import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadRequest, setToken } from '@/api/modules/http';
import { AppError } from '@/shared/errors';

beforeEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
  setToken(null);
});

function mockFetch(status: number, body: unknown) {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response);
}

describe('uploadRequest', () => {
  it('returns JSON on success', async () => {
    mockFetch(200, { url: '/logo.png' });
    const fd = new FormData();
    fd.append('file', new Blob());
    const result = await uploadRequest('/upload', fd);
    expect(result).toEqual({ url: '/logo.png' });
  });

  it('throws AppError on failure', async () => {
    mockFetch(400, { error: 'Too large' });
    const fd = new FormData();
    await expect(uploadRequest('/upload', fd)).rejects.toThrow(AppError);
  });

  it('sends Authorization header when token set', async () => {
    setToken('test-token');
    mockFetch(200, { ok: true });
    const fd = new FormData();
    await uploadRequest('/upload', fd);
    expect(fetch).toHaveBeenCalledWith(
      '/api/v1/upload',
      expect.objectContaining({
        headers: { Authorization: 'Bearer test-token' },
        body: fd,
      }),
    );
  });
});
