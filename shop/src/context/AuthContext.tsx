"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  loginWithOtp: (email: string, code: string) => Promise<User>;
  sendOtp: (email: string, type: string) => Promise<void>;
  updateProfile: (data: Record<string, unknown>) => Promise<User>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'circuit-bazaar-auth';

function readStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as User;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

function storeUser(user: User | null): void {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser);
  const [loading, setLoading] = useState(false);

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await apiClient<{ user: User; token?: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const userData: User = data.user;
      setUser(userData);
      storeUser(userData);
      if (data.token) {
        localStorage.setItem('circuit-bazaar-token', data.token);
      }
      return userData;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const data = await apiClient<{ user: User; token?: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: password,
        }),
      });
      const userData: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        email_verified: data.user.email_verified ?? false,
        address: data.user.address,
        city: data.user.city,
        postal_code: data.user.postal_code,
        country: data.user.country,
      };
      setUser(userData);
      storeUser(userData);
      if (data.token) {
        localStorage.setItem('circuit-bazaar-token', data.token);
      }
      return userData;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithOtp = useCallback(async (email: string, code: string) => {
    setLoading(true);
    try {
      const data = await apiClient<{ user: User; token?: string }>('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, code }),
      });
      const userData: User = data.user;
      setUser(userData);
      storeUser(userData);
      if (data.token) {
        localStorage.setItem('circuit-bazaar-token', data.token);
      }
      return userData;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendOtp = useCallback(async (email: string, type: string) => {
    await apiClient('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email, type }),
    });
  }, []);

  const updateProfile = useCallback(async (profileData: Record<string, unknown>) => {
    setLoading(true);
    try {
      const data = await apiClient<{ user: User }>('/auth/me', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
      const userData: User = data.user;
      setUser(userData);
      storeUser(userData);
      return userData;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setUser(null);
    storeUser(null);
    localStorage.removeItem('circuit-bazaar-token');
  }, []);

  if (!hydrated) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        loginWithOtp,
        sendOtp,
        updateProfile,
        loading,
      }}
    >
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
      login: async () => {
        throw new Error('AuthProvider is required');
      },
      signup: async () => {
        throw new Error('AuthProvider is required');
      },
      logout: async () => {},
      loginWithOtp: async () => {
        throw new Error('AuthProvider is required');
      },
      sendOtp: async () => {},
      updateProfile: async () => {
        throw new Error('AuthProvider is required');
      },
      loading: false,
    };
  }
  return context;
}
