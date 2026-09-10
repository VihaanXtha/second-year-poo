"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  email_verified: boolean;
  phone_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  signup: (name: string, identifier: string, password: string, channel: 'email' | 'phone', address?: string) => Promise<{ user: User; channel: string }>;
  logout: () => Promise<void>;
  verifyEmailOtp: (email: string, code: string) => Promise<User>;
  sendPhoneOtp: (userId: number, phone?: string) => Promise<{ phone: string }>;
  verifyPhoneOtp: (userId: number, code: string) => Promise<User>;
  resendOtp: (email: string, type: 'email_verification' | 'phone_verification' | 'password_reset') => Promise<void>;
  googleLogin: () => Promise<void>;
  loading: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // Hydrate auth state once at init time via a lazy initializer instead of
  // calling `setUser` inside the effect below — the latter trips
  // `react-hooks/set-state-in-effect` and forces an extra cascading render.
  // Client components are deferred to the client by Next.js (layout.tsx is a
  // server component that references this client boundary), so localStorage is
  // only touched on the client; the window guard keeps SSR safe regardless.
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('circuit-bazaar-auth');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        localStorage.removeItem('circuit-bazaar-auth');
      }
    }
    return null;
  });
  // `user` is hydrated synchronously via the lazy initializer above (it reads
  // the persisted session straight off localStorage during first render), so
  // there is no post-mount hydration gap and `loading` stays false. It remains
  // a state cell only to preserve the context API shape; the synchronous
  // hydration above makes any other flag pointless (and setState-in-effect is
  // banned by the linter).
  const [loading] = useState(false);

  const saveUser = useCallback((userData: User) => {
    setUser(userData);
    localStorage.setItem('circuit-bazaar-auth', JSON.stringify(userData));
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.requires_phone_verification) {
        const userData: User = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          role: data.user.role,
          email_verified: data.user.email_verified,
          phone_verified: data.user.phone_verified,
        };
        saveUser(userData);
        throw new Error('PHONE_VERIFICATION_REQUIRED');
      }
      throw new Error(data.message || 'Login failed');
    }

    const userData: User = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      phone: data.user.phone,
      role: data.user.role,
      address: data.user.address,
      city: data.user.city,
      postal_code: data.user.postal_code,
      country: data.user.country,
      email_verified: data.user.email_verified,
      phone_verified: data.user.phone_verified,
    };
    saveUser(userData);
    if (data.token) {
      localStorage.setItem('circuit-bazaar-token', data.token);
    }
  }, [saveUser]);

  const signup = useCallback(async (name: string, identifier: string, password: string, channel: 'email' | 'phone', address?: string) => {
    const body: Record<string, unknown> = {
      name,
      password,
      password_confirmation: password,
      channel,
    };

    if (channel === 'email') {
      body.email = identifier;
    } else {
      body.phone = identifier;
    }

    if (address) {
      body.address = address;
    }

    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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
      phone: data.user.phone,
      role: data.user.role,
      email_verified: false,
      phone_verified: false,
    };
    saveUser(userData);

    return { user: userData, channel: data.user.channel };
  }, [saveUser]);

  const verifyEmailOtp = useCallback(async (email: string, code: string) => {
    const res = await fetch(`${API_URL}/auth/verify-email-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Email verification failed');
    }

    const userData: User = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      phone: data.user.phone,
      role: data.user.role,
      email_verified: data.user.email_verified,
      phone_verified: data.user.phone_verified,
    };
    saveUser(userData);
    if (data.token) {
      localStorage.setItem('circuit-bazaar-token', data.token);
    }
    return userData;
  }, [saveUser]);

  const sendPhoneOtp = useCallback(async (userId: number, phone?: string) => {
    const body: Record<string, unknown> = { user_id: userId };
    if (phone) {
      body.phone = phone;
    }

    const res = await fetch(`${API_URL}/auth/send-phone-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to send phone OTP');
    }

    return { phone: data.phone };
  }, []);

  const verifyPhoneOtp = useCallback(async (userId: number, code: string) => {
    const res = await fetch(`${API_URL}/auth/verify-phone-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, code }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Phone verification failed');
    }

    const userData: User = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      phone: data.user.phone,
      role: data.user.role,
      email_verified: data.user.email_verified,
      phone_verified: data.user.phone_verified,
    };
    saveUser(userData);
    if (data.token) {
      localStorage.setItem('circuit-bazaar-token', data.token);
    }
    return userData;
  }, [saveUser]);

  const resendOtp = useCallback(async (email: string, type: 'email_verification' | 'phone_verification' | 'password_reset') => {
    const res = await fetch(`${API_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, type }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to resend OTP');
    }
  }, []);

  const googleLogin = useCallback(async () => {
    const redirectTo = encodeURIComponent(window.location.origin);
    // External OAuth redirect to the API backend, not an internal Next.js route.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- API_URL is absolute (http(s)://...), the rule can't see through the variable
    window.location.href = `${API_URL}/auth/google/redirect?redirect_to=${redirectTo}`;
  }, []);

  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem('circuit-bazaar-token');
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch {
      // ignore network errors on logout
    }
    setUser(null);
    localStorage.removeItem('circuit-bazaar-auth');
    localStorage.removeItem('circuit-bazaar-token');
  }, []);

  // Children always render so pages SSR normally; since `user` hydrates
  // synchronously during first render (see the lazy initializer above) and
  // `loading` is always false, there is nothing to gate on mount.
  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, verifyEmailOtp, sendPhoneOtp, verifyPhoneOtp, resendOtp, googleLogin, loading }}>
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
      signup: async () => ({ user: {} as User, channel: 'email' }),
      logout: async () => {},
      verifyEmailOtp: async () => ({} as User),
      sendPhoneOtp: async () => ({ phone: '' }),
      verifyPhoneOtp: async () => ({} as User),
      resendOtp: async () => {},
      googleLogin: async () => {},
      loading: false,
    };
  }
  return context;
}