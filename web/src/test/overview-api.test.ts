import { describe, it, expect, vi, beforeEach } from 'vitest';

const { overviewApi } = await import('@/api/modules/overview');

beforeEach(async () => {
  vi.restoreAllMocks();
  const mod = await import('@/api/modules/http');
  vi.spyOn(mod, 'request').mockResolvedValue({});
});

let requestSpy: ReturnType<typeof vi.fn>;
beforeEach(async () => {
  const mod = await import('@/api/modules/http');
  requestSpy = vi.mocked(mod.request) as ReturnType<typeof vi.fn>;
  requestSpy.mockClear();
});

describe('overviewApi', () => {
  it('get calls the overview endpoint', async () => {
    await overviewApi.get();
    expect(requestSpy).toHaveBeenCalledWith('/overview');
  });
});
