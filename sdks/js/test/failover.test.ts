import { describe, it, expect, vi, afterEach } from 'vitest';
import { MozhnoClient } from '../src/MozhnoClient';
import type { MozhnoConfig } from '../src/types';

function createMockFetch(
  status: number,
  body: unknown,
  headers?: Record<string, string>
) {
  return vi.fn().mockResolvedValue({
    status,
    ok: status >= 200 && status < 300,
    headers: {
      get: (name: string) => headers?.[name] ?? null,
    },
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  }) as unknown as typeof globalThis.fetch;
}

function createMockRejectingFetch(error: Error) {
  return vi.fn().mockRejectedValue(error) as unknown as typeof globalThis.fetch;
}

function createConfig(overrides?: Partial<MozhnoConfig>): MozhnoConfig {
  return {
    url: 'https://flags.example.com',
    apiKey: 'env-test123',
    appName: 'test-app',
    mode: 'server',
    disableMetrics: true,
    refreshInterval: 0,
    ...overrides,
  };
}

describe('fail-closed behavior', () => {
  let client: MozhnoClient | null = null;

  afterEach(() => {
    vi.useRealTimers();
    if (client) client.stop();
  });

  it('should return false when server returns 500', async () => {
    vi.useFakeTimers();
    const mockFetch = createMockFetch(500, { error: 'Internal Server Error' });
    client = new MozhnoClient(createConfig({ fetch: mockFetch }));
    const startPromise = client.start();
    await vi.runAllTimersAsync();
    await startPromise;
    expect(client.isEnabled('my-flag')).toBe(false);
  });

  it('should return false when server returns 404', async () => {
    vi.useFakeTimers();
    const mockFetch = createMockFetch(404, { error: 'Not Found' });
    client = new MozhnoClient(createConfig({ fetch: mockFetch }));
    const startPromise = client.start();
    await vi.runAllTimersAsync();
    await startPromise;
    expect(client.isEnabled('my-flag')).toBe(false);
  });

  it('should return false when network fails', async () => {
    vi.useFakeTimers();
    const mockFetch = createMockRejectingFetch(new Error('Network error'));
    client = new MozhnoClient(createConfig({ fetch: mockFetch }));
    const startPromise = client.start();
    await vi.runAllTimersAsync();
    await startPromise;
    expect(client.isEnabled('my-flag')).toBe(false);
  });

  it('should return false when response is not valid JSON', async () => {
    vi.useFakeTimers();
    const mockFetch = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      headers: { get: () => null },
      json: () => Promise.reject(new SyntaxError('Unexpected token')),
    }) as unknown as typeof globalThis.fetch;
    client = new MozhnoClient(createConfig({ fetch: mockFetch }));
    const startPromise = client.start();
    await vi.runAllTimersAsync();
    await startPromise;
    expect(client.isEnabled('my-flag')).toBe(false);
  });

  it('should emit error event when server fails', async () => {
    vi.useFakeTimers();
    const errorHandler = vi.fn();
    const mockFetch = createMockRejectingFetch(new Error('Connection refused'));
    client = new MozhnoClient(createConfig({ fetch: mockFetch }));
    client.on('error', errorHandler);
    const startPromise = client.start();
    await vi.runAllTimersAsync();
    await startPromise;
    expect(errorHandler).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should use bootstrap flags when server is unavailable', async () => {
    vi.useFakeTimers();
    const mockFetch = createMockRejectingFetch(new Error('down'));
    client = new MozhnoClient(createConfig({
      fetch: mockFetch,
      bootstrap: [{ name: 'fallback-flag', key: 'fallback-flag', enabled: true }],
    }));
    const startPromise = client.start();
    await vi.runAllTimersAsync();
    await startPromise;
    expect(client.isEnabled('fallback-flag')).toBe(true);
    expect(client.isEnabled('other-flag')).toBe(false);
  });

  it('should return false before start() is called', () => {
    const mockFetch = createMockFetch(200, { flags: [{ name: 'f1', key: 'f1', enabled: true }] });
    client = new MozhnoClient(createConfig({ fetch: mockFetch }));
    expect(client.isEnabled('f1')).toBe(false);
  });

  it('should retain flag state after stop() is called', async () => {
    vi.useFakeTimers();
    const mockFetch = createMockFetch(200, [{ name: 'f1', key: 'f1', enabled: true }]);
    client = new MozhnoClient(createConfig({ fetch: mockFetch }));
    const startPromise = client.start();
    await vi.runAllTimersAsync();
    await startPromise;
    client.stop();
    expect(client.isEnabled('f1')).toBe(true);
  });
});
