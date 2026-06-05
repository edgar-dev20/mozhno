import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getToken, setToken, getRefreshToken, setRefreshToken, clearAuth, api, UserDto } from '../../api';

interface AuthState {
  user: UserDto | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);

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
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}