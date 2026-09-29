"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
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

import { AddressValue } from "@/components/NepalAddressPicker";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  signup: (name: string, identifier: string, password: string, channel: 'email' | 'phone', address?: AddressValue) => Promise<{ user: User; channel: string }>;
  logout: () => Promise<void>;
  verifyEmailOtp: (email: string, code: string) => Promise<User>;
  sendPhoneOtp: (userId: number, phone?: string) => Promise<{ phone: string }>;
  verifyPhoneOtp: (userId: number, code: string) => Promise<User>;
  resendOtp: (email: string, type: 'email_verification' | 'phone_verification' | 'password_reset') => Promise<void>;
  googleLogin: (returnTo?: string) => Promise<void>;
  completeGoogleSignIn: (code: string) => Promise<GoogleSignInResult>;
  loading: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/** Outcome of a completed Google sign-in, mirroring the exchange response. */
export interface GoogleSignInResult {
  user: User;
  requiresProfileCompletion: boolean;
  requiresPhoneVerification: boolean;
}

/**
 * Where to send the user once Google finishes. The OAuth round-trip leaves the
 * app entirely, so the in-app destination is parked in sessionStorage and read
 * back by /auth/callback. It is not passed through the backend's `redirect_to`
 * because that value is validated against an origin allow-list and only accepts
 * an origin, never a path.
 */
const GOOGLE_RETURN_KEY = 'circuit-bazaar-google-return';

export function rememberGoogleReturn(path: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(GOOGLE_RETURN_KEY, path);
  } catch {
    // Private-mode sessionStorage can throw; falling back to '/' is fine.
  }
}

export function takeGoogleReturn(fallback = '/'): string {
  if (typeof window === 'undefined') return fallback;
  let stored: string | null = null;
  try {
    stored = sessionStorage.getItem(GOOGLE_RETURN_KEY);
    sessionStorage.removeItem(GOOGLE_RETURN_KEY);
  } catch {
    return fallback;
  }
  // Only same-origin absolute paths; blocks `//evil.com` and `https://host` opens.
  if (!stored || !/^\/(?!\/)/.test(stored)) return fallback;
  return stored;
}

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

  const signup = useCallback(async (name: string, identifier: string, password: string, channel: 'email' | 'phone', address?: AddressValue) => {
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
      body.address = `${address.municipality}, ${address.district}, ${address.province}, ${address.country}`;
      body.city = address.municipality;
      body.postal_code = address.postal_code;
      body.country = address.country;
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

  const googleLogin = useCallback(async (returnTo?: string) => {
    if (returnTo) rememberGoogleReturn(returnTo);
    const redirectTo = encodeURIComponent(window.location.origin);
    window.location.href = `${API_URL}/auth/google/redirect?redirect_to=${redirectTo}`;
  }, []);

  const completeGoogleSignIn = useCallback(async (code: string): Promise<GoogleSignInResult> => {
    const res = await fetch(`${API_URL}/auth/google/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || 'Google sign-in failed');
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

    return {
      user: userData,
      requiresProfileCompletion: Boolean(data.requires_profile_completion),
      requiresPhoneVerification: Boolean(data.requires_phone_verification),
    };
  }, [saveUser]);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
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
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, verifyEmailOtp, sendPhoneOtp, verifyPhoneOtp, resendOtp, googleLogin, completeGoogleSignIn, loading }}>
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
      verifyEmailOtp: async () => ({ } as User),
      sendPhoneOtp: async () => ({ phone: '' }),
      verifyPhoneOtp: async () => ({ } as User),
      resendOtp: async () => {},
      googleLogin: async () => {},
      completeGoogleSignIn: async () => {
        throw new Error('useAuth must be used within an AuthProvider');
      },
      loading: false,
    };
  }
  return context;
}
