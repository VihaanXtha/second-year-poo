"use client";

import type React from 'react';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { OtpInput } from '../components/OtpInput';

type Step = 'otp' | 'new_password';

const validatePassword = (pwd: string) => {
  return pwd.length >= 8 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd);
};

function ResetPasswordFormInner() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!email) {
      router.push('/auth/forgot-password');
    }
  }, [email, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

     if (password !== confirmPassword) {
       setError('Passwords do not match');
       return;
     }

     if (!validatePassword(password)) {
       setError('Password must be at least 8 characters with uppercase, lowercase, number, and special character.');
       return;
     }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, password, password_confirmation: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Password reset failed');
      }

      setSuccess(true);
      setTimeout(() => router.push('/auth/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#fcf8fa] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg border border-[#c6c6cd] shadow-sm">
            <div className="bg-[#0f172a] text-white p-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#38bdf8] text-[24px]">check_circle</span>
                <h1 className="font-bold text-lg">Password Reset</h1>
              </div>
            </div>
            <div className="p-6 text-center">
              <p className="text-sm text-[#45464d]">Your password has been reset successfully.</p>
              <p className="text-xs text-[#45464d] mt-2">Redirecting to sign in...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf8fa] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg border border-[#c6c6cd] shadow-sm">
          <div className="bg-[#0f172a] text-white p-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#38bdf8] text-[24px]">lock_reset</span>
              <h1 className="font-bold text-lg">Set New Password</h1>
            </div>
            <p className="text-xs text-gray-400 mt-1">Enter the OTP and your new password</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-[#dc2626]/10 border border-[#dc2626] rounded p-3 text-xs font-mono text-[#dc2626]">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-mono font-bold text-[#45464d] mb-1">OTP CODE</label>
              <OtpInput
                length={6}
                value={code}
                onChange={setCode}
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[#45464d] mb-1">NEW PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Min 8 characters"
                className="w-full border border-[#c6c6cd] rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#000000]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[#45464d] mb-1">CONFIRM PASSWORD</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Repeat password"
                className="w-full border border-[#c6c6cd] rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#000000]"
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full bg-[#000000] text-white text-xs font-mono font-bold py-2.5 rounded hover:bg-[#1f2937] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'RESETTING...' : 'RESET PASSWORD'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fcf8fa] flex items-center justify-center text-sm font-mono text-[#45464d]">Loading...</div>}>
      <ResetPasswordFormInner />
    </Suspense>
  );
}