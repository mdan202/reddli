const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

let accessToken: string | null = null;

export function setAccessToken(t: string | null) { accessToken = t; }
export function getAccessToken() { return accessToken; }

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const res = await fetch(`${BASE}${path}`, { ...init, headers, credentials: 'include' });

  // Auto-refresh on 401
  if (res.status === 401 && path !== '/auth/refresh') {
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${accessToken}`;
      const retry = await fetch(`${BASE}${path}`, { ...init, headers, credentials: 'include' });
      const data = await retry.json();
      if (!retry.ok) throw new ApiError(data.error ?? 'Request failed', retry.status, data.code);
      return data.data as T;
    }
  }

  const data = await res.json();
  if (!res.ok) throw new ApiError(data.error ?? 'Request failed', res.status, data.code);
  return data.data as T;
}

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/auth/refresh`, { method: 'POST', credentials: 'include' });
    if (!res.ok) return false;
    const data = await res.json();
    setAccessToken(data.data.accessToken);
    return true;
  } catch {
    return false;
  }
}

export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message);
  }
}

export const api = {
  get:    <T>(path: string) => request<T>(path),
  post:   <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT',  body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

// ── Typed API methods ─────────────────────────────────────────────────────────

export interface AuthUser { id: string; email: string; displayName: string | null; biometricEnabled: boolean; }
export interface AuthResult { accessToken: string; user: AuthUser; }

export const authApi = {
  register: (body: { email: string; password: string; displayName?: string }) =>
    api.post<AuthResult>('/auth/register', body),
  login: (body: { email: string; password: string }) =>
    api.post<AuthResult>('/auth/login', body),
  logout: () => api.post<void>('/auth/logout', {}),
  google: (idToken: string) => api.post<AuthResult>('/auth/google', { idToken }),
};

export interface RatesData { usdToLbp: number; rates: Record<string, Record<string, number>>; updatedAt: string; }
export const converterApi = {
  getRates: () => api.get<RatesData>('/converter/rates'),
  saveHistory: (body: object) => api.post('/converter/history', body),
  getHistory: (page = 1) => api.get(`/converter/history?page=${page}`),
  getFavorites: () => api.get('/converter/favorites'),
  saveFavorite: (body: object) => api.post('/converter/favorites', body),
  deleteFavorite: (id: string) => api.delete(`/converter/favorites/${id}`),
};

export const expensesApi = {
  list: (params = '') => api.get(`/expenses${params ? '?' + params : ''}`),
  summary: () => api.get('/expenses/summary'),
  chart: () => api.get('/expenses/chart'),
  create: (body: object) => api.post('/expenses', body),
  update: (id: string, body: object) => api.put(`/expenses/${id}`, body),
  remove: (id: string) => api.delete(`/expenses/${id}`),
};

export const budgetsApi = {
  list: () => api.get('/budgets'),
  alerts: () => api.get('/budgets/alerts'),
  create: (body: object) => api.post('/budgets', body),
  update: (id: string, body: object) => api.put(`/budgets/${id}`, body),
  remove: (id: string) => api.delete(`/budgets/${id}`),
};

export const savingsApi = {
  list: () => api.get('/savings'),
  create: (body: object) => api.post('/savings', body),
  contribute: (id: string, body: object) => api.post(`/savings/${id}/contribute`, body),
  progress: (id: string) => api.get(`/savings/${id}/progress`),
  update: (id: string, body: object) => api.put(`/savings/${id}`, body),
  remove: (id: string) => api.delete(`/savings/${id}`),
};

export const communityApi = {
  list: (page = 1) => api.get(`/community?page=${page}`),
  stats: () => api.get('/community/stats'),
  report: (body: { reportedRate: number; location?: string }) => api.post('/community', body),
  vote: (id: string, vote: 'up' | 'down') => api.post(`/community/${id}/vote`, { vote }),
};

export const analyticsApi = {
  dashboard: () => api.get('/analytics/dashboard'),
  spending: () => api.get('/analytics/spending'),
};

export const notificationsApi = {
  list: () => api.get('/notifications'),
  markRead: (id: string) => api.put(`/notifications/${id}/read`, {}),
  markAllRead: () => api.put('/notifications/read-all', {}),
};

export const syncApi = {
  push: (body: object) => api.post('/sync/push', body),
  pull: (since?: string) => api.get(`/sync/pull${since ? '?since=' + since : ''}`),
};
