import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface VendorUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  email_verified: boolean;
}

export interface VendorStore {
  id: number;
  store_name: string;
  store_slug?: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  address?: string;
  phone?: string;
  verified: boolean;
  status: string;
  rating?: number;
  total_products?: number;
  total_orders?: number;
  total_revenue?: number;
}

interface AuthContextType {
  user: VendorUser | null;
  store: VendorStore | null;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  refreshStore: (Store: VendorStore) => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function getApiUrl(): string {
  const envUrl = (import.meta as any).env?.VITE_API_URL as string | undefined;
  if (envUrl) return envUrl;
  return 'https://backendcircuit-production.up.railway.app/api';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<VendorUser | null>(null);
  const [store, setStore] = useState<VendorStore | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('vendor-auth');
      const storedStore = localStorage.getItem('vendor-store');
      const storedToken = localStorage.getItem('vendor-token');
      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedStore) setStore(JSON.parse(storedStore));
      if (storedToken) setToken(storedToken);
    } catch {
      localStorage.removeItem('vendor-auth');
      localStorage.removeItem('vendor-store');
      localStorage.removeItem('vendor-token');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    const API_URL = getApiUrl();
    const res = await fetch(`${API_URL}/auth/vendor-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: identifier, password }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }

    if (data.user?.role !== 'vendor') {
      throw new Error('Access denied. Vendor accounts only.');
    }

    const userData: VendorUser = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      status: data.user.status || 'active',
      email_verified: !!data.user.email_verified,
    };

    const storeData: VendorStore | null = data.store
      ? {
          id: data.store.id,
          store_name: data.store.store_name,
          store_slug: data.store.store_slug,
          description: data.store.description,
          logo_url: data.store.logo_url,
          banner_url: data.store.banner_url,
          address: data.store.address,
          phone: data.store.phone,
          verified: !!data.store.verified,
          status: data.store.status || 'pending',
          rating: data.store.rating,
          total_products: data.store.total_products,
          total_orders: data.store.total_orders,
          total_revenue: data.store.total_revenue,
        }
      : null;

    setUser(userData);
    setStore(storeData);
    setToken(data.token);
    localStorage.setItem('vendor-auth', JSON.stringify(userData));
    if (storeData) localStorage.setItem('vendor-store', JSON.stringify(storeData));
    localStorage.setItem('vendor-token', data.token);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setStore(null);
    setToken(null);
    localStorage.removeItem('vendor-auth');
    localStorage.removeItem('vendor-store');
    localStorage.removeItem('vendor-token');
  }, []);

  const refreshStore = useCallback((next: VendorStore) => {
    setStore(next);
    localStorage.setItem('vendor-store', JSON.stringify(next));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, store, isAuthenticated: !!user, login, logout, loading, refreshStore, token }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useVendorAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useVendorAuth must be used within AuthProvider');
  }
  return ctx;
}