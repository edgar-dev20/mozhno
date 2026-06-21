import type { MozhnoConfig, MozhnoContext, FeatureFlag, ToggleResult, StorageProvider } from './types';
import { EventEmitter } from './events';
import { HttpFetcher } from './transport/fetcher';
import { isFlagEnabled } from './evaluation/evaluator';
import { createDefaultStorage } from './repository/storage';

const STORAGE_KEY = 'mozhno_anon_id';

function getOrCreateAnonId(): string {
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      try { localStorage.setItem(STORAGE_KEY, id); } catch { /* quota exceeded */ }
    }
    return id;
  } catch {
    return crypto?.randomUUID?.() ?? Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  }
}

export class MozhnoClient extends EventEmitter {
  private config: MozhnoConfig;
  private fetcher: HttpFetcher;
  private storage: StorageProvider;
  private flags: Map<string, FeatureFlag> = new Map();
  private clientToggles: Map<string, boolean> = new Map();
  private context: MozhnoContext;
  private metricsBuffer: Record<string, { t: number; f: number }> = {};
  private running = false;
  private fetchTimer: ReturnType<typeof setInterval> | null = null;
  private metricsTimer: ReturnType<typeof setInterval> | null = null;
  private readyNotified = false;
  private warnedNoId = false;
  private anonId: string;
  private useAnonId: boolean;

  constructor(config: MozhnoConfig) {
    super();
    this.config = {
      refreshInterval: 15,
      metricsInterval: 60,
      disableMetrics: false,
      mode: 'server',
      environment: 'default',
      instanceId: this.generateId(),
      ...config,
    };
    this.fetcher = new HttpFetcher(this.config);
    this.storage = config.storageProvider || createDefaultStorage();
    this.useAnonId = config.stickyAnonId !== false;
    this.anonId = this.useAnonId ? getOrCreateAnonId() : '';
    this.context = {
      appName: this.config.appName,
      environment: this.config.environment || 'default',
      currentTime: new Date().toISOString(),
      ...config.context,
    };
  }

  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;

    await this.bootstrap();

    await this.initialFetch();

    const refresh = this.config.refreshInterval;
    if (refresh && refresh > 0) {
      this.fetchTimer = setInterval(() => this.fetch(), refresh * 1000);
    }

    if (!this.config.disableMetrics && this.config.metricsInterval && this.config.metricsInterval > 0) {
      this.metricsTimer = setInterval(() => this.sendMetrics(), this.config.metricsInterval * 1000);
    }

    this.emit('initialized');
  }

  stop(): void {
    if (!this.running) return;
    this.running = false;

    if (this.fetchTimer) { clearInterval(this.fetchTimer); this.fetchTimer = null; }
    if (this.metricsTimer) { clearInterval(this.metricsTimer); this.metricsTimer = null; }
  }

  isEnabled(flagKey: string, context?: MozhnoContext): boolean {
    const ctx = this.enrichContext(context);
    const targetingKey = this.getTargetingKey(ctx);

    if (this.config.mode === 'client') {
      const enabled = this.clientToggles.get(flagKey) || false;
      this.recordMetric(flagKey, enabled);
      return enabled;
    }

    const flag = this.flags.get(flagKey);
    if (!flag) return false;

    const result = isFlagEnabled(flag, ctx, targetingKey);
    this.recordMetric(flagKey, result);
    return result;
  }

  private getTargetingKey(context: MozhnoContext): string {
    const key = context.userId || context.sessionId || (this.useAnonId ? this.anonId : '');
    if (!key && !this.warnedNoId) {
      this.warnedNoId = true;
      console.warn(
        'Mozhno: no userId or sessionId in context — rollout will bucket all anonymous traffic into the same group. ' +
        'Set stickyAnonId=true (default) or pass a userId/sessionId to fix.',
      );
    }
    return key;
  }

  private enrichContext(context?: MozhnoContext): MozhnoContext {
    const ctx = context || this.context;
    const needsAppName = ctx.appName == null;
    const needsEnvironment = ctx.environment == null;
    const needsCurrentTime = ctx.currentTime == null;

    if (!needsAppName && !needsEnvironment && !needsCurrentTime) return ctx;

    return {
      ...ctx,
      ...(needsAppName && { appName: this.config.appName }),
      ...(needsEnvironment && { environment: this.config.environment || 'default' }),
      ...(needsCurrentTime && { currentTime: new Date().toISOString() }),
    };
  }

  getVariant(flagKey: string): ToggleResult['variant'] | null {
    if (this.config.mode === 'client') {
      return null;
    }

    const flag = this.flags.get(flagKey);
    if (!flag || !flag.enabled) return null;

    const strategy = flag.activation;
    if (!strategy) return { name: flag.key, enabled: true };

    for (const variant of (flag as any).variants || []) {
      if (variant.enabled) {
        return variant;
      }
    }

    return { name: flag.key, enabled: true };
  }

  updateContext(context: MozhnoContext): void {
    this.context = { ...this.context, ...context };
    if (this.config.mode === 'client') {
      this.fetch();
    }
  }

  setContextField(key: string, value: string): void {
    this.context[key] = value;
    if (this.config.mode === 'client') {
      this.fetch();
    }
  }

  removeContextField(key: string): void {
    delete this.context[key];
  }

  private generateId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 10);
  }

  private async bootstrap(): Promise<void> {
    const bootstrap = this.config.bootstrap;
    if (bootstrap && bootstrap.length > 0) {
      for (const flag of bootstrap) {
        this.flags.set(flag.key, flag);
      }
      this.emit('update');
      this.notifyReady();
    }
  }

  private async initialFetch(): Promise<void> {
    try {
      await this.withRetry(async () => {
        if (this.config.mode === 'client') {
          const toggles = await this.fetcher.evaluate(this.context);
          for (const t of toggles) {
            this.clientToggles.set(t.name, t.enabled);
          }
          this.persistClientToggles();
        } else {
          const result = await this.fetcher.fetchFeatures();
          if (result.flags) {
            this.flags.clear();
            for (const flag of result.flags) {
              this.flags.set(flag.key, flag);
            }
            this.persistFlags();
          }
          this.emit('update');
        }
      });
      this.notifyReady();
    } catch (e) {
      this.emit('error', e);
    }
  }

  private async fetch(): Promise<void> {
    try {
      await this.withRetry(async () => {
        if (this.config.mode === 'client') {
          const toggles = await this.fetcher.evaluate(this.context);
          this.clientToggles.clear();
          for (const t of toggles) {
            this.clientToggles.set(t.name, t.enabled);
          }
          this.persistClientToggles();
        } else {
          const result = await this.fetcher.fetchFeatures();
          if (result.flags) {
            this.flags.clear();
            for (const flag of result.flags) {
              this.flags.set(flag.key, flag);
            }
            this.persistFlags();
          }
          this.emit('update');
        }
      });
      this.notifyReady();
    } catch (e) {
      this.emit('error', e);
    }
  }

  private recordMetric(flagKey: string, enabled: boolean): void {
    const entry = this.metricsBuffer[flagKey] || (this.metricsBuffer[flagKey] = { t: 0, f: 0 });
    if (enabled) {
      entry.t++;
    } else {
      entry.f++;
    }
  }

  private async sendMetrics(): Promise<void> {
    const keys = Object.keys(this.metricsBuffer);
    if (keys.length === 0) return;

    const snapshot = { ...this.metricsBuffer };
    this.metricsBuffer = {};

    const payload: Record<string, { t: number; f: number }> = {};
    for (const key of keys) {
      payload[key] = { t: snapshot[key].t, f: snapshot[key].f };
    }

    const ok = await this.fetcher.sendMetrics(payload);
    if (ok) {
      this.emit('sent');
    } else {
      for (const [k, v] of Object.entries(payload)) {
        const buf = this.metricsBuffer[k] || (this.metricsBuffer[k] = { t: 0, f: 0 });
        buf.t += v.t;
        buf.f += v.f;
      }
    }
  }

  private async withRetry<T>(fn: () => Promise<T>): Promise<T> {
    const delays = [1000, 2000, 4000];
    let lastError: unknown;
    for (let attempt = 0; attempt <= delays.length; attempt++) {
      try {
        return await fn();
      } catch (e) {
        lastError = e;
        if (attempt < delays.length) {
          await new Promise(r => setTimeout(r, delays[attempt]));
        }
      }
    }
    throw lastError;
  }

  private persistFlags(): void {
    try {
      const data = Array.from(this.flags.entries());
      this.storage.save('flags', data);
    } catch (e) {
      this.emit('warn', 'Failed to persist flags', e);
    }
  }

  private persistClientToggles(): void {
    try {
      const data = Array.from(this.clientToggles.entries());
      this.storage.save('clientToggles', data);
    } catch (e) {
      this.emit('warn', 'Failed to persist client toggles', e);
    }
  }

  private notifyReady(): void {
    if (!this.readyNotified) {
      this.readyNotified = true;
      this.emit('ready');
    }
  }
}
