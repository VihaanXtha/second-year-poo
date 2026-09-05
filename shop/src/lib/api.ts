export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://backendcircuit-production.up.railway.app/api';

const TOKEN_KEY = 'circuit-bazaar-token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

function buildHeaders(init?: RequestInit): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(init && (init.headers as Record<string, string>)),
  };
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function apiClient<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const response = await fetch(url, { ...init, headers: buildHeaders(init) });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message =
      (data && (data.message || data.error)) || `${response.status} ${response.statusText}`;
    const error = new Error(message) as Error & { status?: number; data?: unknown };
    error.status = response.status;
    error.data = data;
    throw error;
  }

  if (response.status === 204 || response.headers.get('content-type')?.includes('text/plain')) {
    return (response.status === 204 ? undefined : await response.text()) as T;
  }

  return response.json() as T;
}

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
    links_page: string;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}
