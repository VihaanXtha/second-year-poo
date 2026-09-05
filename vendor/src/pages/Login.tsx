import React, { useState } from 'react';
import { useVendorAuth } from '../context/AuthContext';

export function Login() {
  const { login } = useVendorAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
              Manage your storefront, products, orders and analytics from one powerful vendor
              dashboard. Reach thousands of customers across Nepal.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-4">
              {[
                { icon: 'storefront', label: 'Storefront control' },
                { icon: 'inventory_2', label: 'Product management' },
                { icon: 'insights', label: 'Sales analytics' },
                { icon: 'support_agent', label: 'Priority support' },
              ].map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700"
                >
                  <span className="material-symbols-outlined text-red-600">{f.icon}</span>
                  {f.label}
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-400">
            © {new Date().getFullYear()} Circuit Bazaar. All rights reserved.
          </div>
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
              <p className="mt-1 text-sm text-slate-500">
                Sign in to your vendor account to continue
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Email address
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      mail
                    </span>
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
                    <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      lock
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      aria-label="Toggle password visibility"
                    >
                      <span className="material-symbols-outlined text-lg">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                    <span className="material-symbols-outlined text-lg">error</span>
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 active:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
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

                <p className="text-center text-xs text-slate-400">
                  Protected area for authorised vendor accounts only.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}