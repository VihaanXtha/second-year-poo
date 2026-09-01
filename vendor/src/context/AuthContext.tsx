import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  email_verified: boolean;
}

interface Store {
  id: number;
  store_name: string;
  verified: boolean;
  status: string;
}

interface AuthContextType {
  user: User | null;
  store: Store | null;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const API_URL = getApiUrl();

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('vendor-auth');
    const storedStore = localStorage.getItem('vendor-store');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('vendor-auth');
      }
    }
    if (storedStore) {
      try {
        setStore(JSON.parse(storedStore));
      } catch {
        localStorage.removeItem('vendor-store');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    // Support login by email or phone number
    const payload = { email: identifier, password };

    const res = await fetch(`${API_URL}/api/auth/vendor-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }

    if (data.user.role !== 'vendor') {
      throw new Error('Access denied. Vendor only.');
    }

    const userData: User = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      status: data.user.status || 'active',
      email_verified: data.user.email_verified,
    };

    const storeData: Store | null = data.store
      ? {
          id: data.store.id,
          store_name: data.store.store_name,
          verified: data.store.verified,
          status: data.store.status,
        }
      : null;

    setUser(userData);
    setStore(storeData);
    localStorage.setItem('vendor-auth', JSON.stringify(userData));
    if (storeData) {
      localStorage.setItem('vendor-store', JSON.stringify(storeData));
    }
    localStorage.setItem('vendor-token', data.token);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setStore(null);
    localStorage.removeItem('vendor-auth');
    localStorage.removeItem('vendor-store');
    localStorage.removeItem('vendor-token');
  }, []);

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, store, isAuthenticated: !!user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useVendorAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      store: null,
      isAuthenticated: false,
      login: async () => {},
      logout: () => {},
      loading: false,
    };
  }
  return context;
}

export function getVendorToken(): string | null {
  return localStorage.getItem('vendor-token');
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