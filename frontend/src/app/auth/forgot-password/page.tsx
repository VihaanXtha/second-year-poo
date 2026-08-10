"use client";

import type React from 'react';
import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';

function ForgotPasswordFormInner() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to send reset OTP');
      }

      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-[#fcf8fa] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg border border-[#c6c6cd] shadow-sm">
            <div className="bg-[#0f172a] text-white p-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#38bdf8] text-[24px]">mark_email_read</span>
                <h1 className="font-bold text-lg">Check Your Email</h1>
              </div>
            </div>
            <div className="p-6 text-center space-y-4">
              <p className="text-sm text-[#45464d]">
                We sent a 6-digit OTP to <span className="font-bold">{email}</span>
              </p>
              <button
                onClick={() => router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`)}
                className="w-full bg-[#000000] text-white text-xs font-mono font-bold py-2.5 rounded hover:bg-[#1f2937] transition-colors"
              >
                ENTER OTP
              </button>
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
              <h1 className="font-bold text-lg">Reset Password</h1>
            </div>
            <p className="text-xs text-gray-400 mt-1">Enter your email to receive an OTP</p>
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
                required
                placeholder="you@example.com"
                className="w-full border border-[#c6c6cd] rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#000000]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#000000] text-white text-xs font-mono font-bold py-2.5 rounded hover:bg-[#1f2937] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'SENDING...' : 'SEND OTP'}
            </button>

            <div className="text-center text-xs text-[#45464d]">
              Remember your password?{' '}
              <a href="/auth/login" className="text-[#000000] font-bold hover:underline">
                Sign in
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fcf8fa] flex items-center justify-center text-sm font-mono text-[#45464d]">Loading...</div>}>
      <ForgotPasswordFormInner />
    </Suspense>
  );
}