import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  email_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const API_URL = getApiUrl();

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('admin-auth');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('admin-auth');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }

    if (data.user.role !== 'admin') {
      throw new Error('Access denied. Admin only.');
    }

    const userData: User = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      status: data.user.status || 'active',
      email_verified: data.user.email_verified,
    };

    setUser(userData);
    localStorage.setItem('admin-auth', JSON.stringify(userData));
    localStorage.setItem('admin-token', data.token);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('admin-auth');
    localStorage.removeItem('admin-token');
  }, []);

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      isAuthenticated: false,
      login: async () => {},
      logout: () => {},
      loading: false,
    };
  }
  return context;
}

export function getAdminToken(): string | null {
  return localStorage.getItem('admin-token');
}

export function getApiUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl;

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'admin.localhost' || host === 'vendor.localhost' || host.includes('baseurl.localhost')) {
      return 'http://api.localhost';
    }
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:8000';
    }
  }

  return 'http://api.localhost';
}
