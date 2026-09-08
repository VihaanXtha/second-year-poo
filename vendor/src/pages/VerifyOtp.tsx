import React, { useState } from 'react';
import { getApiUrl } from '../context/AuthContext';

type VerifyOtpProps = {
  email: string;
  onVerified?: (code: string) => void;
  onBack?: () => void;
};

export function VerifyOtp({ email, onVerified, onBack }: VerifyOtpProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/auth/verify-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to verify OTP');
      onVerified?.(data.reset_token || code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <div className="hidden flex-col justify-between p-12 lg:flex">
          <div className="flex items-center gap-2">
            <div className="brand-gradient flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md">
              <span className="material-symbols-outlined">bolt</span>
            </div>
            <div className="leading-tight">
              <div className="text-base font-bold text-slate-900">Circuit Bazaar</div>
              <div className="text-xs uppercase tracking-wider text-red-600">Vendor Portal</div>
            </div>
          </div>
          <div className="max-w-md">
            <h1 className="text-4xl font-bold leading-tight text-slate-900">Verify OTP</h1>
            <p className="mt-4 text-base text-slate-600">Enter the 6-digit code sent to your email to verify your identity.</p>
          </div>
          <div className="text-xs text-slate-400">© {new Date().getFullYear()} Circuit Bazaar. All rights reserved.</div>
        </div>
        <div className="flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            <div className="card p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-2 lg:hidden">
                <div className="brand-gradient flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md">
                  <span className="material-symbols-outlined">bolt</span>
                </div>
                <div className="leading-tight">
                  <div className="text-base font-bold text-slate-900">Circuit Bazaar</div>
                  <div className="text-xs uppercase tracking-wider text-red-600">Vendor Portal</div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Verify OTP</h2>
              <p className="mt-1 text-sm text-slate-500">Enter the code sent to your email.</p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Email address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    readOnly
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 py-2.5 px-3 text-sm text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">OTP Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-2 focus:ring-red-100 tracking-widest"
                  />
                </div>
                {error && (
                  <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                    <span className="material-symbols-outlined text-lg">error</span>
                    <span>{error}</span>
                  </div>
                )}
                <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 active:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60">
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-slate-400">
                <button type="button" onClick={onBack} className="text-red-600 hover:text-red-700">Back to forgot password</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
