export interface MozhnoConfig {
  url: string;
  apiKey?: string;
  clientKey?: string;
  appName: string;
  instanceId?: string;
  mode?: 'server' | 'client';
  refreshInterval?: number;
  metricsInterval?: number;
  disableMetrics?: boolean;
  bootstrap?: FeatureFlag[];
  storageProvider?: StorageProvider;
  fetch?: typeof globalThis.fetch;
  environment?: string;
  context?: MozhnoContext;
}

export interface MozhnoContext {
  userId?: string;
  sessionId?: string;
  appName?: string;
  environment?: string;
  [key: string]: string | undefined;
}

export interface FeatureFlag {
  name: string;
  key: string;
  enabled: boolean;
  activation?: Activation;
}

export interface Activation {
  rollOut?: number;
  constraints?: Constraint[];
}

export interface Constraint {
  field: string;
  operator: string;
  values: string[];
  contextType?: string;
}

export interface ToggleResult {
  name: string;
  enabled: boolean;
  variant: VariantData;
}

export interface VariantData {
  name: string;
  enabled: boolean;
  payload?: PayloadData;
}

export interface PayloadData {
  type: string;
  value: string;
}

export interface StorageProvider {
  save(name: string, data: unknown): void | Promise<void>;
  get(name: string): unknown | undefined | Promise<unknown | undefined>;
}

export type MozhnoEvent = 'ready' | 'update' | 'error' | 'initialized' | 'sent' | 'warn';
