import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '@/api';

describe('Metrics API', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  it('api.metrics.get calls correct URL', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
    });

    await api.metrics.get(1, 2);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/flags/1/metrics?environmentId=2'),
      expect.any(Object),
    );
  });

  it('api.metrics.listForProject calls correct URL with env', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
    });

    await api.metrics.listForProject(3);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/metrics?environmentId=3'),
      expect.any(Object),
    );
  });

  it('api.metrics.listForProject omits env query when undefined', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
    });

    await api.metrics.listForProject();
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/metrics'),
      expect.any(Object),
    );
  });

  it('handles non-2xx response', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'not found' }),
    });

    await expect(api.metrics.get(1, 2)).rejects.toBeTruthy();
  });
});
