import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppError } from "@/shared/errors";

let request: typeof import("@/api/modules/http").request;
let setToken: typeof import("@/api/modules/http").setToken;
let setRefreshToken: typeof import("@/api/modules/http").setRefreshToken;

beforeEach(async () => {
  vi.restoreAllMocks();
  localStorage.clear();
  const mod = await import("@/api/modules/http");
  request = mod.request;
  setToken = mod.setToken;
  setRefreshToken = mod.setRefreshToken;
  setToken(null);
  setRefreshToken(null);
});

function mockFetch(status: number, body: unknown) {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response);
}

describe('request (http)', () => {
  it('returns JSON for successful response', async () => {
    mockFetch(200, { data: 'ok' });
    const result = await request('/test');
    expect(result).toEqual({ data: 'ok' });
  });

  it('returns undefined for 204', async () => {
    mockFetch(204, null);
    const result = await request('/test');
    expect(result).toBeUndefined();
  });

  it('throws AppError with UNAUTHORIZED for 401', async () => {
    mockFetch(401, { error: 'Token expired' });
    await expect(request('/test')).rejects.toThrow(AppError);
    try {
      await request('/test');
    } catch (e) {
      expect(e).toBeInstanceOf(AppError);
      expect((e as AppError).code).toBe('UNAUTHORIZED');
    }
  });

  it('throws AppError with SERVER for 500', async () => {
    mockFetch(500, { error: 'Internal error' });
    await expect(request('/test')).rejects.toThrow(AppError);
    try {
      await request('/test');
    } catch (e) {
      expect(e).toBeInstanceOf(AppError);
      expect((e as AppError).code).toBe('SERVER');
    }
  });

  it('throws AppError with NOT_FOUND for 404', async () => {
    mockFetch(404, { error: 'Not found' });
    try {
      await request('/test');
    } catch (e) {
      expect(e).toBeInstanceOf(AppError);
      expect((e as AppError).code).toBe('NOT_FOUND');
    }
  });

  it('throws AppError with TIMEOUT on abort', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new DOMException('Aborted', 'AbortError'),
    );
    try {
      await request('/test');
    } catch (e) {
      expect(e).toBeInstanceOf(AppError);
      expect((e as AppError).code).toBe('TIMEOUT');
    }
  });

  it('throws AppError with NETWORK for fetch failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network down'));
    try {
      await request('/test');
    } catch (e) {
      expect(e).toBeInstanceOf(AppError);
      expect((e as AppError).code).toBe('NETWORK');
    }
  });

  it('retries with refreshed token on 401', async () => {
    setToken('expired');
    setRefreshToken('valid-refresh');

    let callCount = 0;
    let refreshHeaders: HeadersInit | undefined;
    vi.spyOn(globalThis, 'fetch').mockImplementation((url, init) => {
      const urlStr = String(url);
      if (urlStr.includes('/auth/refresh')) {
        refreshHeaders = (init as RequestInit).headers;
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ token: 'new-token', refreshToken: 'new-refresh' }),
        } as Response);
      }
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({}),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: 'retried' }),
      } as Response);
    });

    const result = await request('/test');
    expect(result).toEqual({ data: 'retried' });
    expect(callCount).toBe(2);

    const headers = refreshHeaders as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer expired');
  });

  it('clears auth and redirects when refresh fails', async () => {
    setToken('expired');
    setRefreshToken('bad-refresh');

    vi.spyOn(globalThis, 'fetch').mockImplementation((url, _init) => {
      const urlStr = String(url);
      if (urlStr.includes('/auth/refresh')) {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({}),
        } as Response);
      }
      return Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({}),
      } as Response);
    });

    await expect(request('/test')).rejects.toThrow(AppError);
    expect(localStorage.getItem('mozhno_token')).toBeNull();
  });
});
