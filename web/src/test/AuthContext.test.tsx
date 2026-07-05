import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/app/auth/AuthContext';
import { useAuth } from '@/app/auth/useAuth';
import { api, setToken, setRefreshToken } from '@/api';

function AuthDisplay() {
  const { user, loading, login, logout } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return (
      <div>
        <button onClick={() => login('test@test.com', 'pass', false)}>Login</button>
      </div>
    );
  }

  return (
    <div>
      <span data-testid="email">{user.email}</span>
      <span data-testid="role">{user.role}</span>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

function renderAuth() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <AuthDisplay />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('shows login button when no token', async () => {
    renderAuth();
    await waitFor(() => {
      expect(screen.getByText('Login')).toBeTruthy();
    });
  });

  it('calls api.auth.login on login button click', async () => {
    const mockLogin = vi.fn().mockResolvedValue({
      token: 'fake-token',
      refreshToken: 'fake-refresh',
      user: { id: 1, email: 'test@test.com', name: 'Test User', role: 'admin', status: 'active', avatar: null, locale: 'ru', createdAt: '2024-01-01T00:00:00Z', lastActiveAt: '2024-01-01T00:00:00Z' },
    });
    vi.spyOn(api.auth, 'login').mockImplementation(mockLogin);

    renderAuth();
    await waitFor(() => screen.getByText('Login'));
    await userEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'pass', false);
    });
  });

  it('displays user info after successful login', async () => {
    vi.spyOn(api.auth, 'login').mockResolvedValue({
      token: 'fake-token',
      refreshToken: 'fake-refresh',
      user: { id: 1, email: 'test@test.com', name: 'Test User', role: 'developer', status: 'active', avatar: null, locale: 'ru', createdAt: '2024-01-01T00:00:00Z', lastActiveAt: '2024-01-01T00:00:00Z' },
    });

    renderAuth();
    await waitFor(() => screen.getByText('Login'));
    await userEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('email').textContent).toBe('test@test.com');
      expect(screen.getByTestId('role').textContent).toBe('developer');
    });
  });

  it('shows login button after logout', async () => {
    vi.spyOn(api.auth, 'login').mockResolvedValue({
      token: 'fake-token',
      refreshToken: 'fake-refresh',
      user: { id: 1, email: 'test@test.com', name: 'Test User', role: 'admin', status: 'active', avatar: null, locale: 'ru', createdAt: '2024-01-01T00:00:00Z', lastActiveAt: '2024-01-01T00:00:00Z' },
    });
    vi.spyOn(api.auth, 'logout').mockResolvedValue(undefined);

    renderAuth();
    await waitFor(() => screen.getByText('Login'));
    await userEvent.click(screen.getByText('Login'));

    await waitFor(() => screen.getByText('Logout'));
    await userEvent.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(screen.getByText('Login')).toBeTruthy();
    });
  });

  it('auto-refreshes expired token and displays user', async () => {
    vi.spyOn(api.auth, 'me').mockRejectedValue(new Error('Unauthorized'));
    vi.spyOn(api.auth, 'refresh').mockResolvedValue({
      token: 'new-token',
      refreshToken: 'new-refresh',
      user: { id: 2, email: 'refreshed@test.com', name: 'Refreshed User', role: 'viewer', status: 'active', avatar: null, locale: 'ru', createdAt: '2024-01-01T00:00:00Z', lastActiveAt: '2024-01-01T00:00:00Z' },
    });

    setToken('expired-token');
    setRefreshToken('valid-refresh');

    renderAuth();

    await waitFor(() => {
      expect(screen.getByTestId('email').textContent).toBe('refreshed@test.com');
    });
  });

  it('shows login when refresh fails', async () => {
    vi.spyOn(api.auth, 'me').mockRejectedValue(new Error('Unauthorized'));
    vi.spyOn(api.auth, 'refresh').mockRejectedValue(new Error('Refresh failed'));

    setToken('expired-token');
    setRefreshToken('bad-refresh');

    renderAuth();

    await waitFor(() => {
      expect(screen.getByText('Login')).toBeTruthy();
    });
  });
});
