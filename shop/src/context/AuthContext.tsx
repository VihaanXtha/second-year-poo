"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AddressValue } from '@/components/NepalAddressPicker';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  address?: string;
  city?: string;
  province?: string;
  district?: string;
  municipality?: string;
  ward?: string;
  postal_code?: string;
  country?: string;
  email_verified: boolean;
  phone_verified: boolean;
}

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
  googleLogin: () => Promise<void>;
  updateProfile: (profile: { name?: string; phone?: string; address?: string; city?: string; province?: string; district?: string; municipality?: string; ward?: string; postal_code?: string; country?: string }) => Promise<User>;
  changePassword: (currentPassword: string, password: string, passwordConfirmation: string) => Promise<void>;
  fetchProfile: () => Promise<User>;
  loading: boolean;
}

/**
 * Map the backend's user payload (snake_case, structured Nepal address fields)
 * onto the shop's User shape. Used by every auth flow that receives a user.
 */
function mapUser(data: {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  district?: string | null;
  municipality?: string | null;
  ward?: string | null;
  postal_code?: string | null;
  country?: string | null;
  email_verified: boolean;
  phone_verified: boolean;
}): User {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone ?? undefined,
    role: data.role,
    address: data.address ?? undefined,
    city: data.city ?? undefined,
    province: data.province ?? undefined,
    district: data.district ?? undefined,
    municipality: data.municipality ?? undefined,
    ward: data.ward ?? undefined,
    postal_code: data.postal_code ?? undefined,
    country: data.country ?? undefined,
    email_verified: data.email_verified,
    phone_verified: data.phone_verified,
  };
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
        saveUser(mapUser(data.user));
        throw new Error('PHONE_VERIFICATION_REQUIRED');
      }
      throw new Error(data.message || 'Login failed');
    }

    const userData = mapUser(data.user);
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
      body.province = address.province;
      body.district = address.district;
      body.municipality = address.municipality;
      body.ward = address.ward;
      body.postal_code = address.postal_code;
      body.country = address.country;
      // Free-text street/block line; Nepal address fields carry the structured part.
      body.address = address.municipality ? `Ward ${address.ward}, ${address.municipality}` : undefined;
      body.city = address.district;
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

    const userData = mapUser({
      ...data.user,
      email_verified: false,
      phone_verified: false,
    });
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

    const userData = mapUser(data.user);
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

    const userData = mapUser(data.user);
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

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('circuit-bazaar-token');
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) {
      throw new Error('Failed to load profile');
    }
    const data = await res.json();
    const userData = mapUser(data.user);
    saveUser(userData);
    return userData;
  }, [saveUser]);

  const updateProfile = useCallback(async (profile: { name?: string; phone?: string; address?: string; city?: string; province?: string; district?: string; municipality?: string; ward?: string; postal_code?: string; country?: string }) => {
    const token = localStorage.getItem('circuit-bazaar-token');
    const res = await fetch(`${API_URL}/auth/update-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(profile),
    });
    if (!res.ok) {
      const data = await res.json();
      const msg = data.errors ? Object.values(data.errors).flat().join(', ') : (data.message || 'Update failed');
      throw new Error(msg);
    }
    const data = await res.json();
    const userData = mapUser(data.user);
    saveUser(userData);
    return userData;
  }, [saveUser]);

  const changePassword = useCallback(async (currentPassword: string, password: string, passwordConfirmation: string) => {
    const res = await fetch(`${API_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('circuit-bazaar-token') ?? ''}`,
      },
      body: JSON.stringify({
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      const msg = data.errors ? Object.values(data.errors).flat().join(', ') : (data.message || 'Password change failed');
      throw new Error(msg);
    }
  }, []);

  // Children always render so pages SSR normally; since `user` hydrates
  // synchronously during first render (see the lazy initializer above) and
  // `loading` is always false, there is nothing to gate on mount.
  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, verifyEmailOtp, sendPhoneOtp, verifyPhoneOtp, resendOtp, googleLogin, updateProfile, changePassword, fetchProfile, loading }}>
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
      updateProfile: async () => ({} as User),
      changePassword: async () => {},
      fetchProfile: async () => ({} as User),
      loading: false,
    };
  }
  return context;
}