import { describe, it, expect, vi, beforeEach } from 'vitest';

const { authApi } = await import('@/api/modules/auth');

beforeEach(async () => {
  vi.restoreAllMocks();
  const mod = await import('@/api/modules/http');
  vi.spyOn(mod, 'request').mockResolvedValue({});
  vi.spyOn(mod, 'getRefreshToken').mockReturnValue('rt123');
});

describe('authApi', () => {
  let requestSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    const mod = await import('@/api/modules/http');
    requestSpy = vi.mocked(mod.request) as ReturnType<typeof vi.fn>;
    requestSpy.mockClear();
  });

  it('login', async () => {
    await authApi.login('e@m.com', 'pass');
    expect(requestSpy).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'e@m.com', password: 'pass', rememberMe: false }),
    });
  });

  it('login with rememberMe', async () => {
    await authApi.login('e@m.com', 'pass', true);
    expect(requestSpy).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'e@m.com', password: 'pass', rememberMe: true }),
    });
  });

  it('me', async () => {
    await authApi.me();
    expect(requestSpy).toHaveBeenCalledWith('/auth/me');
  });

  it('refresh', async () => {
    await authApi.refresh();
    expect(requestSpy).toHaveBeenCalledWith('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: 'rt123' }),
    });
  });

  it('logout', async () => {
    await authApi.logout();
    expect(requestSpy).toHaveBeenCalledWith('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: 'rt123' }),
    });
  });

  it('forgotPassword', async () => {
    await authApi.forgotPassword('e@m.com');
    expect(requestSpy).toHaveBeenCalledWith('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'e@m.com' }),
    });
  });

  it('forgotPassword with locale', async () => {
    await authApi.forgotPassword('e@m.com', 'en');
    expect(requestSpy).toHaveBeenCalledWith('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'e@m.com', locale: 'en' }),
    });
  });

  it('resetPassword', async () => {
    await authApi.resetPassword('tok', 'newpass');
    expect(requestSpy).toHaveBeenCalledWith('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token: 'tok', password: 'newpass' }),
    });
  });

  it('acceptInvite', async () => {
    await authApi.acceptInvite('tok', 'Name', 'pass');
    expect(requestSpy).toHaveBeenCalledWith('/auth/accept-invite', {
      method: 'POST',
      body: JSON.stringify({ token: 'tok', name: 'Name', password: 'pass' }),
    });
  });

});

