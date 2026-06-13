export const queryKeys = {
  projects: {
    all: ['projects'] as const,
  },
  environments: {
    all: ['environments'] as const,
    limit: (projectId: number | null) => ['environments', 'limit', projectId] as const,
  },
  contexts: {
    all: ['contexts'] as const,
    byProject: (projectId: number | null) => ['contexts', projectId] as const,
  },
  flags: {
    all: ['flags'] as const,
    enriched: ['flags', 'enriched'] as const,
  },
  segments: {
    all: ['segments'] as const,
    byProject: (projectId: number | null) => ['segments', projectId] as const,
  },
  tags: {
    all: ['tags'] as const,
  },
  users: {
    all: ['users'] as const,
  },
  apiKeys: {
    byProject: (projectId: number | null) => ['apikeys', projectId] as const,
  },
  clientInstances: {
    byProject: (projectId: number | null) => ['clientInstances', projectId] as const,
    filtered: (projectId: number | null, envFilter: string | null) =>
      ['clientInstances', projectId, envFilter] as const,
  },
  metrics: {
    sparkline: ['metrics', 'sparkline'] as const,
    project: (projectId: number | null, envFilter: string | null) =>
      ['metrics', 'project', projectId, envFilter] as const,
  },
  settings: {
    byProject: (projectId: number | null) => ['settings', projectId] as const,
  },
  integrations: {
    byProject: (projectId: number | null) => ['integrations', projectId] as const,
    webhookLimit: (projectId: number | null) =>
      ['integrations', 'webhookLimit', projectId] as const,
  },
  audit: {
    filtered: (projectId: number | null, dateFrom: string, dateTo: string) =>
      ['audit', projectId, dateFrom, dateTo] as const,
  },
} as const;
