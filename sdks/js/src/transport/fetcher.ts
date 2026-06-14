import type { MozhnoConfig, FeatureFlag, ToggleResult, MozhnoContext } from './types';

const SDK_TYPE = 'js';
const SDK_VERSION = '1.0.0';

export class HttpFetcher {
  private config: MozhnoConfig;
  private lastEtag: string | null = null;
  private fetchImpl: typeof globalThis.fetch;

  constructor(config: MozhnoConfig) {
    this.config = config;
    this.fetchImpl = config.fetch || ((...args: Parameters<typeof fetch>) => globalThis.fetch(...args));
  }

  async fetchFeatures(): Promise<{ flags: FeatureFlag[] | null; etag: string | null; notModified: boolean }> {
    const url = this.normalizeUrl(this.config.url) + '/api/client/features';
    const key = this.config.apiKey || this.config.clientKey || '';
    const headers: Record<string, string> = {
      'Authorization': 'Bearer ' + key,
      'Accept': 'application/json',
      'X-Mozhno-App-Name': this.config.appName,
      'X-Mozhno-Instance-Id': this.config.instanceId || '',
      'X-Mozhno-Sdk-Type': SDK_TYPE,
      'X-Mozhno-Sdk-Version': SDK_VERSION,
    };

    if (this.lastEtag) {
      headers['If-None-Match'] = this.lastEtag;
    }

    const res = await this.fetchImpl(url, { headers });

    if (res.status === 304) {
      return { flags: null, etag: this.lastEtag, notModified: true };
    }

    if (!res.ok) {
      throw new Error(`Failed to fetch features: HTTP ${res.status}`);
    }

    const etag = res.headers.get('ETag');
    if (etag) this.lastEtag = etag;

    const flags: FeatureFlag[] = await res.json();
    return { flags, etag, notModified: false };
  }

  async evaluate(context: MozhnoContext): Promise<ToggleResult[]> {
    const url = this.normalizeUrl(this.config.url) + '/api/client/evaluate';
    const key = this.config.apiKey || this.config.clientKey || '';

    try {
      const res = await this.fetchImpl(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + key,
          'Content-Type': 'application/json',
          'X-Mozhno-App-Name': this.config.appName,
          'X-Mozhno-Instance-Id': this.config.instanceId || '',
          'X-Mozhno-Sdk-Type': SDK_TYPE,
          'X-Mozhno-Sdk-Version': SDK_VERSION,
        },
        body: JSON.stringify({ context }),
      });

      if (!res.ok) {
        console.warn('Failed to evaluate flags: HTTP', res.status);
        return [];
      }

      const data = await res.json();
      return data.toggles || [];
    } catch (e) {
      console.error('Error evaluating flags', e);
      return [];
    }
  }

  async sendMetrics(evaluations: Record<string, number>): Promise<boolean> {
    const url = this.normalizeUrl(this.config.url) + '/api/client/metrics';
    const key = this.config.apiKey || this.config.clientKey || '';

    try {
      const res = await this.fetchImpl(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + key,
          'Content-Type': 'application/json',
          'X-Mozhno-App-Name': this.config.appName,
          'X-Mozhno-Instance-Id': this.config.instanceId || '',
          'X-Mozhno-Sdk-Type': SDK_TYPE,
          'X-Mozhno-Sdk-Version': SDK_VERSION,
        },
        body: JSON.stringify({ evaluations }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  private normalizeUrl(url: string): string {
    return url.endsWith('/') ? url.slice(0, -1) : url;
  }
}
