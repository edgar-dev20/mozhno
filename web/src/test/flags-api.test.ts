import { describe, it, expect, vi, beforeEach } from 'vitest';

const { flagsApi, strategiesApi, metricsApi } = await import("@/api/modules/flags");

beforeEach(async () => {
  vi.restoreAllMocks();
  const mod = await import("@/api/modules/http");
  vi.spyOn(mod, 'request').mockResolvedValue({});
});

describe('flagsApi', () => {
  let requestSpy: ReturnType<typeof vi.mocked>;

  beforeEach(async () => {
    const mod = await import("@/api/modules/http");
    requestSpy = vi.mocked(mod.request);
    requestSpy.mockClear();
  });

  it('list without params', async () => {
    await flagsApi.list();
    expect(requestSpy).toHaveBeenCalledWith('/flags');
  });

  it('list with envId', async () => {
    await flagsApi.list(1);
    expect(requestSpy).toHaveBeenCalledWith('/flags?environmentId=1');
  });

  it('list with includeArchived', async () => {
    await flagsApi.list(undefined, true);
    expect(requestSpy).toHaveBeenCalledWith('/flags?includeArchived=true');
  });

  it('list with both envId and includeArchived', async () => {
    await flagsApi.list(1, true);
    expect(requestSpy).toHaveBeenCalledWith('/flags?environmentId=1&includeArchived=true');
  });

  it('get by id', async () => {
    await flagsApi.get(5);
    expect(requestSpy).toHaveBeenCalledWith('/flags/5');
  });

  it('create', async () => {
    const data = { name: 'f', key: 'f', flagType: 'RELEASE' } as never;
    await flagsApi.create(data);
    expect(requestSpy).toHaveBeenCalledWith('/flags', { method: 'POST', body: JSON.stringify(data) });
  });

  it('update', async () => {
    const data = { name: 'f' } as never;
    await flagsApi.update(3, data);
    expect(requestSpy).toHaveBeenCalledWith('/flags/3', { method: 'PUT', body: JSON.stringify(data) });
  });

  it('delete', async () => {
    await flagsApi.delete(3);
    expect(requestSpy).toHaveBeenCalledWith('/flags/3', { method: 'DELETE' });
  });

  it('archive', async () => {
    await flagsApi.archive(3);
    expect(requestSpy).toHaveBeenCalledWith('/flags/3/archive', { method: 'POST' });
  });

  it('unarchive', async () => {
    await flagsApi.unarchive(3);
    expect(requestSpy).toHaveBeenCalledWith('/flags/3/unarchive', { method: 'POST' });
  });

  it('listEnriched', async () => {
    await flagsApi.listEnriched(2, 50);
    expect(requestSpy).toHaveBeenCalledWith('/flags/enriched?page=2&size=50');
  });

  it('list strategies for flag', async () => {
    await strategiesApi.list(1);
    expect(requestSpy).toHaveBeenCalledWith('/flags/1/strategies');
  });

  it('create strategy', async () => {
    const data = { name: 's' } as never;
    await strategiesApi.create(1, data);
    expect(requestSpy).toHaveBeenCalledWith('/flags/1/strategies', { method: 'POST', body: JSON.stringify(data) });
  });

  it('update strategy', async () => {
    const data = { name: 's' } as never;
    await strategiesApi.update(1, 2, data);
    expect(requestSpy).toHaveBeenCalledWith('/flags/1/strategies/2', { method: 'PUT', body: JSON.stringify(data) });
  });

  it('delete strategy', async () => {
    await strategiesApi.delete(1, 2);
    expect(requestSpy).toHaveBeenCalledWith('/flags/1/strategies/2', { method: 'DELETE' });
  });

  it('upsert strategy', async () => {
    const data = { name: 's' } as never;
    await strategiesApi.upsert(1, data);
    expect(requestSpy).toHaveBeenCalledWith('/flags/1/strategies', { method: 'PUT', body: JSON.stringify(data) });
  });

  it('get metrics for flag', async () => {
    await metricsApi.get(1, 2);
    expect(requestSpy).toHaveBeenCalledWith('/flags/1/metrics?environmentId=2');
  });

  it('listForProject with envId', async () => {
    await metricsApi.listForProject(2);
    expect(requestSpy).toHaveBeenCalledWith('/metrics?environmentId=2');
  });

  it('listForProject without envId', async () => {
    await metricsApi.listForProject();
    expect(requestSpy).toHaveBeenCalledWith('/metrics');
  });
});
