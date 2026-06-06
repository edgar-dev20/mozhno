import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../api';

const originalFetch = globalThis.fetch;

describe('Metrics API', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  it('api.metrics.get calls correct URL', async () => {
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
    });

    await api.metrics.get(1, 2);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/flags/1/metrics?environmentId=2'),
      expect.any(Object)
    );
  });

  it('api.metrics.listForProject calls correct URL with env', async () => {
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
    });

    await api.metrics.listForProject(5, 3);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/projects/5/metrics?environmentId=3'),
      expect.any(Object)
    );
  });

  it('api.metrics.listForProject omits env query when undefined', async () => {
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
    });

    await api.metrics.listForProject(5);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/projects/5/metrics'),
      expect.any(Object)
    );
  });

  it('handles non-2xx response', async () => {
    (globalThis.fetch as any).mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'not found' }),
    });

    await expect(api.metrics.get(1, 2)).rejects.toBeTruthy();
  });
});
