import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { getToken, setToken, getRefreshToken, setRefreshToken, clearAuth, setOnAuthExpired, api, UserDto } from "@/api";
import { resetOnboardingComplete } from '@/shared/onboardingUtils';

interface AuthState {
  user: UserDto | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => void;
  updateUser: (user: UserDto) => void;
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  updateUser: () => {},
});

export { AuthContext };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setOnAuthExpired(() => {
      navigate('/login', { replace: true });
    });
    return () => setOnAuthExpired(null);
  }, [navigate]);

  useEffect(() => {
    const t = getToken();
    if (t) {
      api.auth.me()
        .then(u => setUser(u))
        .catch(async () => {
          const rt = getRefreshToken();
          if (rt) {
            try {
              const res = await api.auth.refresh();
              setUser(res.user);
              return;
            } catch {}
          }
          clearAuth();
          resetOnboardingComplete();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string, rememberMe: boolean) => {
    const res = await api.auth.login(email, password, rememberMe);
    setToken(res.token);
    setRefreshToken(res.refreshToken);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    api.auth.logout().catch(() => {});
    clearAuth();
    resetOnboardingComplete();
    setUser(null);
  }, []);

  const updateUser = useCallback((updated: UserDto) => {
    setUser(updated);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}