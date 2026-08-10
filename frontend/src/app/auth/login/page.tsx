"use client";

import type React from 'react';
import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';

function LoginFormInner() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const checkEmailExists = async (value: string) => {
    if (!value || !value.includes('@')) {
      setEmailError('');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value }),
      });

      const data = await res.json();

      if (!res.ok) {
        setEmailError(data.message || 'Could not verify email.');
        return;
      }

      if (!data.exists) {
        setEmailError('Email not registered.');
      } else {
        setEmailError('');
      }
    } catch {
      setEmailError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('circuit-bazaar-auth', JSON.stringify(data.user));
      
      const role = data.user.role;
      if (role === 'admin') {
        window.location.href = 'http://admin.localhost';
      } else if (role === 'vendor') {
        window.location.href = 'http://vendor.localhost';
      } else {
        router.push('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf8fa] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg border border-[#c6c6cd] shadow-sm">
          <div className="bg-[#0f172a] text-white p-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#38bdf8] text-[24px]">login</span>
              <h1 className="font-bold text-lg">Sign In</h1>
            </div>
            <p className="text-xs text-gray-400 mt-1">Welcome back to Circuit Bazaar</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-[#dc2626]/10 border border-[#dc2626] rounded p-3 text-xs font-mono text-[#dc2626]">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-mono font-bold text-[#45464d] mb-1">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={(e) => checkEmailExists(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full border border-[#c6c6cd] rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#000000]"
              />
              {emailError && (
                <p className="mt-1 text-xs text-[#dc2626]">{emailError}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[#45464d] mb-1">PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full border border-[#c6c6cd] rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#000000]"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-[#c6c6cd]" />
                <span className="text-[#45464d]">Remember me</span>
              </label>
              <a href="/auth/forgot-password" className="text-[#000000] font-bold hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#000000] text-white text-xs font-mono font-bold py-2.5 rounded hover:bg-[#1f2937] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'PLEASE WAIT...' : 'SIGN IN'}
            </button>

            <div className="text-center text-xs text-[#45464d]">
              Don&apos;t have an account?{' '}
              <a href="/auth/register" className="text-[#000000] font-bold hover:underline">
                Sign up
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fcf8fa] flex items-center justify-center text-sm font-mono text-[#45464d]">Loading...</div>}>
      <LoginFormInner />
    </Suspense>
  );
}