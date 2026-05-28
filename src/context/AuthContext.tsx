import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authApi, setAccessToken, type AuthUser } from '../lib/api';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login:    (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout:   () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

const STORAGE_KEY = 'redeli_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setLoading] = useState(true); // start true while we check the session

  // On mount: restore user from localStorage and refresh the access token via httpOnly cookie
  useEffect(() => {
    const stored = (() => {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null'); } catch { return null; }
    })();

    if (!stored) { setLoading(false); return; }

    // Try to get a fresh access token using the refresh cookie
    fetch(`${BASE}/auth/refresh`, { method: 'POST', credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.data?.accessToken) {
          setAccessToken(data.data.accessToken);
          setUser(stored);
        } else {
          // Refresh cookie expired — clear stored session
          localStorage.removeItem(STORAGE_KEY);
        }
      })
      .catch(() => {
        // Network error — keep user in state so UI shows, API calls will fail gracefully
        setUser(stored);
      })
      .finally(() => setLoading(false));
  }, []);

  const persist = (u: AuthUser | null) => {
    setUser(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      setAccessToken(res.accessToken);
      persist(res.user);
    } finally { setLoading(false); }
  }, []);

  const register = useCallback(async (email: string, password: string, displayName?: string) => {
    setLoading(true);
    try {
      const res = await authApi.register({ email, password, displayName });
      setAccessToken(res.accessToken);
      persist(res.user);
    } finally { setLoading(false); }
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => {});
    setAccessToken(null);
    persist(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
