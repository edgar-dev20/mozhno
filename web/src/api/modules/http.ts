import { AppError, createAppError } from '@/shared/errors';

const BASE_URL = '/api/v1';

let token: string | null = localStorage.getItem('mozhno_token');
let refreshToken: string | null = localStorage.getItem('mozhno_refresh_token');

export function getToken(): string | null {
  return token;
}

export function setToken(t: string | null) {
  token = t;
  if (t) localStorage.setItem('mozhno_token', t);
  else localStorage.removeItem('mozhno_token');
}

export function getRefreshToken(): string | null {
  return refreshToken;
}

export function setRefreshToken(rt: string | null) {
  refreshToken = rt;
  if (rt) localStorage.setItem('mozhno_refresh_token', rt);
  else localStorage.removeItem('mozhno_refresh_token');
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

function syncTokensFromStorage(): boolean {
  const storedRt = localStorage.getItem('mozhno_refresh_token');
  const storedT = localStorage.getItem('mozhno_token');
  if (storedRt && storedT && (storedRt !== refreshToken || storedT !== token)) {
    refreshToken = storedRt;
    token = storedT;
    return true;
  }
  return false;
}

async function tryRefreshToken(): Promise<boolean> {
  syncTokensFromStorage();

  if (!refreshToken) return false;

  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  const attemptedRefreshToken = refreshToken;
  refreshPromise = (async () => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ refreshToken: attemptedRefreshToken }),
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 400) {
          refreshToken = null;
          localStorage.removeItem('mozhno_refresh_token');
        }
        return syncTokensFromStorage();
      }
      const data = await res.json();
      setToken(data.token);
      setRefreshToken(data.refreshToken);
      return true;
    } catch {
      return syncTokensFromStorage();
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

let onAuthExpired: (() => void) | null = null;

export function setOnAuthExpired(fn: (() => void) | null) {
  onAuthExpired = fn;
}

export function clearAuth() {
  setToken(null);
  setRefreshToken(null);
  if (onAuthExpired) {
    onAuthExpired();
  }
}

const DEFAULT_TIMEOUT = 30000;

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    if (!res.ok) {
      if (res.status === 401) {
        const isAuthEndpoint = path.startsWith('/auth/login') || path.startsWith('/auth/refresh');
        if (!isAuthEndpoint) {
          const refreshed = await tryRefreshToken();
          if (refreshed) {
            headers['Authorization'] = `Bearer ${token}`;
            const retryRes = await fetch(`${BASE_URL}${path}`, {
              ...options,
              headers,
              signal: controller.signal,
            });
            if (!retryRes.ok) {
              if (retryRes.status === 401 && !syncTokensFromStorage()) {
                clearAuth();
              }
              const body = await retryRes.json().catch(() => ({}));
              throw createAppError(
                body.error || body.message || `HTTP ${retryRes.status}`,
                retryRes.status,
                body,
              );
            }
            if (retryRes.status === 204) return undefined as T;
            return retryRes.json();
          }
          if (!getRefreshToken()) {
            clearAuth();
          }
        }
      }
      const body = await res.json().catch(() => ({}));
      throw createAppError(body.error || body.message || `HTTP ${res.status}`, res.status, body);
    }
    if (res.status === 204) return undefined as T;
    return res.json();
  } catch (e) {
    if (e instanceof AppError) throw e;
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new AppError('Request timed out', 'TIMEOUT');
    }
    throw new AppError('Network error', 'NETWORK');
  } finally {
    clearTimeout(timeout);
  }
}

export async function uploadRequest<T>(path: string, formData: FormData): Promise<T> {
  syncTokensFromStorage();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
      signal: controller.signal,
    });
    if (!res.ok) {
      if (res.status === 401 && path !== '/auth/refresh') {
        const refreshed = await tryRefreshToken();
        if (refreshed) {
          const retryRes = await fetch(`${BASE_URL}${path}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${getToken()}` },
            body: formData,
            signal: controller.signal,
          });
          if (!retryRes.ok) {
            if (retryRes.status === 401 && !syncTokensFromStorage()) {
              clearAuth();
            }
            const retryBody = await retryRes.json().catch(() => ({}));
            throw createAppError(retryBody.error || retryBody.message || `HTTP ${retryRes.status}`, retryRes.status, retryBody);
          }
          return retryRes.json() as Promise<T>;
        }
      }
      const body = await res.json().catch(() => ({}));
      throw createAppError(body.error || body.message || `HTTP ${res.status}`, res.status, body);
    }
    return res.json() as Promise<T>;
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new AppError('Request timed out', 'TIMEOUT');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
