import React, { useState } from 'react';
import { useVendorAuth, getApiUrl } from '../context/AuthContext';

type View = 'login' | 'forgot' | 'reset';

export function Login() {
  const [view, setView] = useState<View>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { login } = useVendorAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(identifier.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send reset email');
      setForgotSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, code: resetCode, password: newPassword, password_confirmation: confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Password reset failed');
      setView('login');
      setIdentifier(resetEmail);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (view === 'forgot') {
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

                {forgotSuccess ? (
                  <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                    If an account exists for <span className="font-semibold">{forgotEmail}</span>, a reset OTP has been sent.
                  </div>
                ) : (
                  <form onSubmit={handleForgot} className="mt-8 space-y-5">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Email address</label>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="vendor@example.com"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                      />
                    </div>
                    <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 active:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60">
                      {loading ? 'Sending...' : 'Send reset OTP'}
                    </button>
                  </form>
                )}

                <p className="mt-6 text-center text-xs text-slate-400">
                  <button onClick={() => setView('login')} className="text-red-600 hover:text-red-700">Back to login</button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'reset') {
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
              <h1 className="text-4xl font-bold leading-tight text-slate-900">Set a new password</h1>
              <p className="mt-4 text-base text-slate-600">Enter the OTP sent to your email and choose a new password.</p>
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
                <h2 className="text-2xl font-bold text-slate-900">Reset password</h2>
                <p className="mt-1 text-sm text-slate-500">Enter the OTP and your new password.</p>

                <form onSubmit={handleReset} className="mt-8 space-y-5">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                    <input type="email" required value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-2 focus:ring-red-100" placeholder="vendor@example.com" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">OTP Code</label>
                    <input type="text" required maxLength={6} value={resetCode} onChange={(e) => setResetCode(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-2 focus:ring-red-100 tracking-widest" placeholder="000000" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">New Password</label>
                    <input type="password" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-2 focus:ring-red-100" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Confirm Password</label>
                    <input type="password" required minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-2 focus:ring-red-100" placeholder="••••••••" />
                  </div>
                  <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 active:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60">
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>

                <p className="mt-6 text-center text-xs text-slate-400">
                  <button onClick={() => setView('forgot')} className="text-red-600 hover:text-red-700">Resend OTP</button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className="text-4xl font-bold leading-tight text-slate-900">
              Grow your electronics business with Circuit Bazaar
            </h1>
            <p className="mt-4 text-base text-slate-600">
              Manage your storefront, products, orders and analytics from one powerful vendor dashboard. Reach thousands of customers across Nepal.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-4">
              {[
                { icon: 'storefront', label: 'Storefront control' },
                { icon: 'inventory_2', label: 'Product management' },
                { icon: 'insights', label: 'Sales analytics' },
                { icon: 'support_agent', label: 'Priority support' },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700">
                  <span className="material-symbols-outlined text-red-600">{f.icon}</span>
                  {f.label}
                </div>
              ))}
            </div>
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

              <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
              <p className="mt-1 text-sm text-slate-500">Sign in to your vendor account to continue</p>

              <form onSubmit={handleLogin} className="mt-8 space-y-5">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Email address</label>
                  <div className="relative">
                    <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="vendor@example.com"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                  <div className="relative">
                    <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                    />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Toggle password visibility">
                      <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-slate-600">
                    <input type="checkbox" className="rounded border-slate-300 text-red-600 focus:ring-red-500" />
                    Remember me
                  </label>
                  <button type="button" onClick={() => setView('forgot')} className="text-red-600 hover:text-red-700">Forgot password?</button>
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                    <span className="material-symbols-outlined text-lg">error</span>
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 active:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60">
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-slate-400">Protected area for authorised vendor accounts only.</p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
