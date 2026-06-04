const BASE_URL = '/api/v1';

let token: string | null = localStorage.getItem('mozhno_token');

export function getToken(): string | null {
  return token;
}

export function setToken(t: string | null) {
  token = t;
  if (t) localStorage.setItem('mozhno_token', t);
  else localStorage.removeItem('mozhno_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    if (res.status === 401) {
      setToken(null);
      window.location.hash = '/login';
    }
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || body.message || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; user: UserDto }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    me: () => request<UserDto>('/auth/me'),
  },
  projects: {
    list: () => request<Project[]>('/projects'),
    get: (id: number) => request<Project>(`/projects/${id}`),
    create: (data: { name: string; description?: string }) =>
      request<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: { name: string; description?: string }) =>
      request<Project>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/projects/${id}`, { method: 'DELETE' }),
  },
  environments: {
    list: (projectId: number) =>
      request<Environment[]>(`/projects/${projectId}/environments`),
    create: (projectId: number, name: string) =>
      request<Environment>(`/projects/${projectId}/environments`, {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
    update: (projectId: number, id: number, name: string) =>
      request<Environment>(`/projects/${projectId}/environments/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name }),
      }),
    delete: (projectId: number, id: number) =>
      request<void>(`/projects/${projectId}/environments/${id}`, { method: 'DELETE' }),
  },
  flags: {
    list: (projectId: number, envId?: number) =>
      request<FlagResponse[]>(`/projects/${projectId}/flags${envId ? `?environmentId=${envId}` : ''}`),
    get: (projectId: number, id: number) =>
      request<FlagResponse>(`/projects/${projectId}/flags/${id}`),
    create: (projectId: number, data: FlagRequest) =>
      request<FlagResponse>(`/projects/${projectId}/flags`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (projectId: number, id: number, data: FlagRequest) =>
      request<FlagResponse>(`/projects/${projectId}/flags/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (projectId: number, id: number) =>
      request<void>(`/projects/${projectId}/flags/${id}`, { method: 'DELETE' }),
  },
  strategies: {
    list: (flagId: number) => request<FlagStrategy[]>(`/flags/${flagId}/strategies`),
    create: (flagId: number, data: StrategyRequest) =>
      request<FlagStrategy>(`/flags/${flagId}/strategies`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (flagId: number, id: number, data: StrategyRequest) =>
      request<FlagStrategy>(`/flags/${flagId}/strategies/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (flagId: number, id: number) =>
      request<void>(`/flags/${flagId}/strategies/${id}`, { method: 'DELETE' }),
    upsert: (flagId: number, data: StrategyRequest) =>
      request<FlagStrategy>(`/flags/${flagId}/strategies`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },
  segments: {
    list: (projectId: number) => request<SegmentResponse[]>(`/projects/${projectId}/segments`),
    get: (projectId: number, id: number) => request<SegmentResponse>(`/projects/${projectId}/segments/${id}`),
    create: (projectId: number, data: SegmentRequest) =>
      request<SegmentResponse>(`/projects/${projectId}/segments`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (projectId: number, id: number, data: SegmentRequest) =>
      request<SegmentResponse>(`/projects/${projectId}/segments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (projectId: number, id: number) =>
      request<void>(`/projects/${projectId}/segments/${id}`, { method: 'DELETE' }),
  },
  tags: {
    list: (projectId: number) => request<Tag[]>(`/projects/${projectId}/tags`),
    get: (projectId: number, id: number) => request<Tag>(`/projects/${projectId}/tags/${id}`),
    create: (projectId: number, data: TagRequest) =>
      request<Tag>(`/projects/${projectId}/tags`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (projectId: number, id: number, data: TagRequest) =>
      request<Tag>(`/projects/${projectId}/tags/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (projectId: number, id: number) =>
      request<void>(`/projects/${projectId}/tags/${id}`, { method: 'DELETE' }),
  },
  contexts: {
    list: (projectId: number) => request<ContextDefinition[]>(`/projects/${projectId}/contexts`),
    create: (projectId: number, data: { name: string; description?: string }) =>
      request<ContextDefinition>(`/projects/${projectId}/contexts`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (projectId: number, id: number, data: { name: string; description?: string }) =>
      request<ContextDefinition>(`/projects/${projectId}/contexts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (projectId: number, id: number) =>
      request<void>(`/projects/${projectId}/contexts/${id}`, { method: 'DELETE' }),
    values: {
      list: (projectId: number, defId: number) =>
        request<ContextValue[]>(`/projects/${projectId}/contexts/${defId}/values`),
      create: (projectId: number, defId: number, values: string) =>
        request<ContextValue>(`/projects/${projectId}/contexts/${defId}/values`, {
          method: 'POST',
          body: JSON.stringify({ contextDefinitionId: defId, values }),
        }),
    },
  },
  users: {
    list: () => request<UserDto[]>('/users'),
    get: (id: number) => request<UserDto>(`/users/${id}`),
    create: (data: UserCreateRequest) =>
      request<UserDto>('/users', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: UserUpdateRequest) =>
      request<UserDto>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/users/${id}`, { method: 'DELETE' }),
  },
  apiKeys: {
    list: (projectId: number) => request<ApiKey[]>(`/projects/${projectId}/api-keys`),
    create: (projectId: number, data: ApiKeyRequest) =>
      request<ApiKey>(`/projects/${projectId}/api-keys`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (projectId: number, id: number, data: ApiKeyRequest) =>
      request<ApiKey>(`/projects/${projectId}/api-keys/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (projectId: number, id: number) =>
      request<void>(`/projects/${projectId}/api-keys/${id}`, { method: 'DELETE' }),
  },
  audit: {
    list: (projectId: number) => request<AuditEvent[]>(`/audit?projectId=${projectId}`),
  },
  integrations: {
    list: (projectId: number) => request<Integration[]>(`/projects/${projectId}/integrations`),
    create: (projectId: number, data: IntegrationRequest) =>
      request<Integration>(`/projects/${projectId}/integrations`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (projectId: number, id: number, data: IntegrationRequest) =>
      request<Integration>(`/projects/${projectId}/integrations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (projectId: number, id: number) =>
      request<void>(`/projects/${projectId}/integrations/${id}`, { method: 'DELETE' }),
  },
  settings: {
    get: (projectId: number) => request<ProjectSettings>(`/projects/${projectId}/settings`),
    update: (projectId: number, data: SettingsUpdateRequest) =>
      request<ProjectSettings>(`/projects/${projectId}/settings`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },
};

export type UserDto = { id: number; email: string; name: string; role: string; status: string; createdAt: string; lastActiveAt: string };
export type Project = { id: number; name: string; description: string; createdAt: string };
export type Environment = { id: number; projectId: number; name: string; createdAt: string };
export type FlagResponse = { id: number; projectId: number; name: string; key: string; description: string; flagType: string; createdAt: string; tags: FlagTagValue[]; enabled: boolean; strategyId: number; percentage: number; contextDefinitionId: number; contextValuesJson: string; segmentIds: number[] };
export type FlagTagValue = { tagId: number; tagName: string; tagColor: string; value: string };
export type FlagRequest = { name: string; key: string; description?: string; flagType?: string; enabled?: boolean; tags?: { tagId: number; value: string }[] };
export type FlagStrategy = { id: number; flagId: number; environmentId: number; enabled: boolean; percentage: number; contextDefinitionId: number; contextValuesJson: string; segmentIds: number[]; createdAt: string };
export type StrategyRequest = { flagId?: number; environmentId: number; enabled?: boolean; percentage?: number; contextDefinitionId?: number; contextValuesJson?: string; segmentIds?: number[] };
export type SegmentResponse = { id: number; projectId: number; name: string; description: string; createdAt: string; context: { contextDefinitionId: number; contextValues: string }[] };
export type SegmentRequest = { projectId: number; name: string; description?: string; context?: { contextDefinitionId: number; contextValues: string }[] };
export type Tag = { id: number; projectId: number; name: string; description: string; color: string; createdAt: string };
export type TagRequest = { projectId?: number; name: string; description?: string; color: string };
export type ContextDefinition = { id: number; projectId: number; name: string; description: string; createdAt: string };
export type ContextValue = { id: number; contextDefinitionId: number; values: string; createdAt: string };
export type UserCreateRequest = { email: string; password: string; name?: string; role: string };
export type UserUpdateRequest = { email?: string; password?: string; name?: string; role?: string; status?: string };
export type ApiKey = { id: number; projectId: number; environmentId: number; name: string; description: string; apiKey: string; createdAt: string; lastUsedAt: string };
export type ApiKeyRequest = { name: string; environmentId?: number; description?: string };
export type AuditEvent = { id: number; projectId: number; userId: number; userName: string; userEmail: string; action: string; resourceType: string; resourceId: number; resourceName: string; details: string; ipAddress: string; createdAt: string };
export type Integration = { id: number; projectId: number; type: string; name: string; enabled: boolean; configJson: string; eventSubscriptionsJson: string; createdAt: string; updatedAt: string };
export type IntegrationRequest = { type: string; name: string; enabled: boolean; configJson: string; eventSubscriptionsJson: string };
export type ProjectSettings = { id: number; projectId: number; requireMfa: boolean; sessionTimeoutHours: number; ipWhitelist: string; createdAt: string; updatedAt: string };
export type SettingsUpdateRequest = { requireMfa?: boolean; sessionTimeoutHours?: number; ipWhitelist?: string };