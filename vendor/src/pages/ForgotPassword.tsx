import React, { useState } from 'react';
import { getApiUrl } from '../context/AuthContext';

type ForgotPasswordProps = {
  onSuccess?: (email: string) => void;
  onBack?: () => void;
};

export function ForgotPassword({ onSuccess, onBack }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [captcha, setCaptcha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!captcha) {
      setError('Please confirm you are not a robot.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send reset email');
      setSuccess(true);
      onSuccess?.(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
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
            <h1 className="text-4xl font-bold leading-tight text-slate-900">Reset your password</h1>
            <p className="mt-4 text-base text-slate-600">Enter your email and we'll send you a one-time code to reset your password.</p>
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
              <h2 className="text-2xl font-bold text-slate-900">Forgot password?</h2>
              <p className="mt-1 text-sm text-slate-500">Enter your vendor email to receive a reset OTP.</p>

              {success ? (
                <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                  If an account exists for <span className="font-semibold">{email}</span>, a reset OTP has been sent.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Email address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vendor@example.com"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="captcha"
                      type="checkbox"
                      checked={captcha}
                      onChange={(e) => setCaptcha(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                    />
                    <label htmlFor="captcha" className="text-sm text-slate-600">
                      I'm not a robot
                    </label>
                  </div>
                  {error && (
                    <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                      <span className="material-symbols-outlined text-lg">error</span>
                      <span>{error}</span>
                    </div>
                  )}
                  <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 active:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60">
                    {loading ? 'Sending...' : 'Send reset OTP'}
                  </button>
                </form>
              )}

              {success && (
                <button onClick={() => onBack?.()} className="mt-6 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                  Back to login
                </button>
              )}
              {!success && onBack && (
                <p className="mt-6 text-center text-xs text-slate-400">
                  <button type="button" onClick={onBack} className="text-red-600 hover:text-red-700">Back to login</button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
