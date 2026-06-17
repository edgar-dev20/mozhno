import { describe, it, expect, vi, beforeEach } from 'vitest';

const { apiKeysApi } = await import("@/api/modules/apiKeys");
const { auditApi } = await import("@/api/modules/audit");
const { clientInstancesApi } = await import("@/api/modules/clientInstances");
const { contextsApi } = await import("@/api/modules/contexts");
const { environmentsApi } = await import("@/api/modules/environments");
const { integrationsApi } = await import("@/api/modules/integrations");
const { projectsApi } = await import("@/api/modules/projects");
const { segmentsApi } = await import("@/api/modules/segments");
const { settingsApi } = await import("@/api/modules/settings");
const { tagsApi } = await import("@/api/modules/tags");
const { usersApi } = await import("@/api/modules/users");

beforeEach(async () => {
  vi.restoreAllMocks();
  const mod = await import("@/api/modules/http");
  vi.spyOn(mod, 'request').mockResolvedValue({});
  vi.spyOn(mod, 'uploadRequest').mockResolvedValue({});
});

let requestSpy: ReturnType<typeof vi.mocked>;
beforeEach(async () => {
  const mod = await import("@/api/modules/http");
  requestSpy = vi.mocked(mod.request);
  requestSpy.mockClear();
});

describe('apiKeysApi', () => {
  it('list', async () => {
    await apiKeysApi.list();
    expect(requestSpy).toHaveBeenCalledWith('/api-keys');
  });
  it('create', async () => {
    const d = { name: 'k' } as never;
    await apiKeysApi.create(d);
    expect(requestSpy).toHaveBeenCalledWith('/api-keys', { method: 'POST', body: JSON.stringify(d) });
  });
  it('update', async () => {
    const d = { name: 'k' } as never;
    await apiKeysApi.update(1, d);
    expect(requestSpy).toHaveBeenCalledWith('/api-keys/1', { method: 'PUT', body: JSON.stringify(d) });
  });
  it('delete', async () => {
    await apiKeysApi.delete(1);
    expect(requestSpy).toHaveBeenCalledWith('/api-keys/1', { method: 'DELETE' });
  });
});

describe('auditApi', () => {
  it('list with no params', async () => {
    await auditApi.list();
    expect(requestSpy).toHaveBeenCalledWith('/audit');
  });
  it('list with params', async () => {
    await auditApi.list(0, 50, '2024-01-01', '2024-12-31');
    expect(requestSpy).toHaveBeenCalledWith('/audit?page=0&size=50&dateFrom=2024-01-01&dateTo=2024-12-31');
  });
});

describe('clientInstancesApi', () => {
  it('list with projectId', async () => {
    await clientInstancesApi.list(1);
    expect(requestSpy).toHaveBeenCalledWith('/projects/1/client-instances');
  });
  it('list with envId', async () => {
    await clientInstancesApi.list(1, 2);
    expect(requestSpy).toHaveBeenCalledWith('/projects/1/client-instances?environmentId=2');
  });
});

describe('contextsApi', () => {
  it('list', async () => {
    await contextsApi.list();
    expect(requestSpy).toHaveBeenCalledWith('/contexts');
  });
  it('create', async () => {
    await contextsApi.create({ name: 'c', key: 'c' });
    expect(requestSpy).toHaveBeenCalledWith('/contexts', { method: 'POST', body: JSON.stringify({ name: 'c', key: 'c' }) });
  });
  it('update', async () => {
    await contextsApi.update(1, { name: 'c', key: 'c' });
    expect(requestSpy).toHaveBeenCalledWith('/contexts/1', { method: 'PUT', body: JSON.stringify({ name: 'c', key: 'c' }) });
  });
  it('delete', async () => {
    await contextsApi.delete(1);
    expect(requestSpy).toHaveBeenCalledWith('/contexts/1', { method: 'DELETE' });
  });
  it('values list', async () => {
    await contextsApi.values.list(1);
    expect(requestSpy).toHaveBeenCalledWith('/contexts/1/values');
  });
  it('values create', async () => {
    await contextsApi.values.create(1, 'a,b');
    expect(requestSpy).toHaveBeenCalledWith('/contexts/1/values', { method: 'POST', body: JSON.stringify({ contextDefinitionId: 1, values: 'a,b' }) });
  });
});

describe('environmentsApi', () => {
  it('list', async () => {
    await environmentsApi.list();
    expect(requestSpy).toHaveBeenCalledWith('/environments');
  });
  it('create', async () => {
    await environmentsApi.create('prod');
    expect(requestSpy).toHaveBeenCalledWith('/environments', { method: 'POST', body: JSON.stringify({ name: 'prod' }) });
  });
  it('update', async () => {
    await environmentsApi.update(1, 'staging');
    expect(requestSpy).toHaveBeenCalledWith('/environments/1', { method: 'PUT', body: JSON.stringify({ name: 'staging' }) });
  });
  it('getLimit', async () => {
    await environmentsApi.getLimit();
    expect(requestSpy).toHaveBeenCalledWith('/environments/limit');
  });
  it('delete', async () => {
    await environmentsApi.delete(1);
    expect(requestSpy).toHaveBeenCalledWith('/environments/1', { method: 'DELETE' });
  });
});

describe('integrationsApi', () => {
  it('list', async () => {
    await integrationsApi.list();
    expect(requestSpy).toHaveBeenCalledWith('/integrations');
  });
  it('create', async () => {
    const d = { name: 'i' } as never;
    await integrationsApi.create(d);
    expect(requestSpy).toHaveBeenCalledWith('/integrations', { method: 'POST', body: JSON.stringify(d) });
  });
  it('update', async () => {
    const d = { name: 'i' } as never;
    await integrationsApi.update(1, d);
    expect(requestSpy).toHaveBeenCalledWith('/integrations/1', { method: 'PUT', body: JSON.stringify(d) });
  });
  it('delete', async () => {
    await integrationsApi.delete(1);
    expect(requestSpy).toHaveBeenCalledWith('/integrations/1', { method: 'DELETE' });
  });
  it('webhookLimit', async () => {
    await integrationsApi.webhookLimit();
    expect(requestSpy).toHaveBeenCalledWith('/integrations/webhook-limit');
  });
});

describe('projectsApi', () => {
  it('list', async () => {
    await projectsApi.list();
    expect(requestSpy).toHaveBeenCalledWith('/projects');
  });
  it('get', async () => {
    await projectsApi.get(1);
    expect(requestSpy).toHaveBeenCalledWith('/projects/1');
  });
  it('create', async () => {
    await projectsApi.create({ name: 'p' });
    expect(requestSpy).toHaveBeenCalledWith('/projects', { method: 'POST', body: JSON.stringify({ name: 'p' }) });
  });
  it('update', async () => {
    await projectsApi.update(1, { name: 'p2' });
    expect(requestSpy).toHaveBeenCalledWith('/projects/1', { method: 'PUT', body: JSON.stringify({ name: 'p2' }) });
  });
  it('delete', async () => {
    await projectsApi.delete(1);
    expect(requestSpy).toHaveBeenCalledWith('/projects/1', { method: 'DELETE' });
  });
  it('getLogoUrl returns string', () => {
    expect(projectsApi.getLogoUrl(1)).toBe('/api/v1/projects/1/logo');
  });
});

describe('segmentsApi', () => {
  it('list', async () => {
    await segmentsApi.list();
    expect(requestSpy).toHaveBeenCalledWith('/segments');
  });
  it('get', async () => {
    await segmentsApi.get(1);
    expect(requestSpy).toHaveBeenCalledWith('/segments/1');
  });
  it('create', async () => {
    const d = { name: 's' } as never;
    await segmentsApi.create(d);
    expect(requestSpy).toHaveBeenCalledWith('/segments', { method: 'POST', body: JSON.stringify(d) });
  });
  it('update', async () => {
    const d = { name: 's' } as never;
    await segmentsApi.update(1, d);
    expect(requestSpy).toHaveBeenCalledWith('/segments/1', { method: 'PUT', body: JSON.stringify(d) });
  });
  it('delete', async () => {
    await segmentsApi.delete(1);
    expect(requestSpy).toHaveBeenCalledWith('/segments/1', { method: 'DELETE' });
  });
});

describe('settingsApi', () => {
  it('get', async () => {
    await settingsApi.get();
    expect(requestSpy).toHaveBeenCalledWith('/settings');
  });
  it('update', async () => {
    const d = { name: 's' } as never;
    await settingsApi.update(d);
    expect(requestSpy).toHaveBeenCalledWith('/settings', { method: 'PUT', body: JSON.stringify(d) });
  });
});

describe('tagsApi', () => {
  it('list', async () => {
    await tagsApi.list();
    expect(requestSpy).toHaveBeenCalledWith('/tags');
  });
  it('get', async () => {
    await tagsApi.get(1);
    expect(requestSpy).toHaveBeenCalledWith('/tags/1');
  });
  it('create', async () => {
    const d = { name: 't' } as never;
    await tagsApi.create(d);
    expect(requestSpy).toHaveBeenCalledWith('/tags', { method: 'POST', body: JSON.stringify(d) });
  });
  it('update', async () => {
    const d = { name: 't' } as never;
    await tagsApi.update(1, d);
    expect(requestSpy).toHaveBeenCalledWith('/tags/1', { method: 'PUT', body: JSON.stringify(d) });
  });
  it('delete', async () => {
    await tagsApi.delete(1);
    expect(requestSpy).toHaveBeenCalledWith('/tags/1', { method: 'DELETE' });
  });
});

describe('usersApi', () => {
  it('list', async () => {
    await usersApi.list();
    expect(requestSpy).toHaveBeenCalledWith('/users');
  });
  it('get', async () => {
    await usersApi.get(1);
    expect(requestSpy).toHaveBeenCalledWith('/users/1');
  });
  it('create', async () => {
    const d = { name: 'u', email: 'u@m.com' } as never;
    await usersApi.create(d);
    expect(requestSpy).toHaveBeenCalledWith('/users', { method: 'POST', body: JSON.stringify(d) });
  });
  it('invite', async () => {
    const d = { email: 'invite@m.com', role: 'developer', locale: 'ru' };
    await usersApi.invite(d);
    expect(requestSpy).toHaveBeenCalledWith('/users/invite', { method: 'POST', body: JSON.stringify(d) });
  });
  it('sendResetLink', async () => {
    await usersApi.sendResetLink(42);
    expect(requestSpy).toHaveBeenCalledWith('/users/42/send-reset-link', { method: 'POST' });
  });
  it('update', async () => {
    const d = { name: 'u' } as never;
    await usersApi.update(1, d);
    expect(requestSpy).toHaveBeenCalledWith('/users/1', { method: 'PUT', body: JSON.stringify(d) });
  });
  it('delete', async () => {
    await usersApi.delete(1);
    expect(requestSpy).toHaveBeenCalledWith('/users/1', { method: 'DELETE' });
  });
  it('getAvatarUrl returns string', () => {
    expect(usersApi.getAvatarUrl(1)).toBe('/api/v1/users/1/avatar');
  });
});
