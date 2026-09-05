"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  email_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backendcircuit-production.up.railway.app/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('circuit-bazaar-auth');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('circuit-bazaar-auth');
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

    const userData: User = data.user;
    setUser(userData);
    localStorage.setItem('circuit-bazaar-auth', JSON.stringify(userData));
    if (data.token) {
      localStorage.setItem('circuit-bazaar-token', data.token);
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, password_confirmation: password }),
    });

    const data = await res.json();

    if (!res.ok) {
      const msg = data.errors ? Object.values(data.errors).flat().join(', ') : (data.message || 'Signup failed');
      throw new Error(msg);
    }

    const userData: User = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      email_verified: false,
    };
    setUser(userData);
    localStorage.setItem('circuit-bazaar-auth', JSON.stringify(userData));
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch {
      // ignore network errors on logout
    }
    setUser(null);
    localStorage.removeItem('circuit-bazaar-auth');
    localStorage.removeItem('circuit-bazaar-token');
  }, []);

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      isAuthenticated: false,
      login: async () => {},
      signup: async () => {},
      logout: async () => {},
      loading: false,
    };
  }
  return context;
}