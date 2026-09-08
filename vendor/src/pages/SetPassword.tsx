import React, { useState } from 'react';
import { getApiUrl } from '../context/AuthContext';
import { useVendorAuth } from '../context/AuthContext';
import { PasswordResetForm } from '../components/PasswordResetForm';

export function SetPassword() {
  const { clearMustChangePassword, user } = useVendorAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('vendor-token');

      const res = await fetch(`${getApiUrl()}/auth/set-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: user?.email,
          password: newPassword,
          password_confirmation: confirmPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to set password');
      setSuccess(true);
      clearMustChangePassword();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set password');
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
            <h1 className="text-4xl font-bold leading-tight text-slate-900">Set Your Password</h1>
            <p className="mt-4 text-base text-slate-600">Choose a strong password to secure your vendor account and get started.</p>
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
              <h2 className="text-2xl font-bold text-slate-900">Set Your Password</h2>
              <p className="mt-1 text-sm text-slate-500">Enter a new password to secure your account.</p>

              {success ? (
                <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                  Password set successfully. You may now close this page and continue using the vendor portal.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <PasswordResetForm
                    newPassword={newPassword}
                    confirmPassword={confirmPassword}
                    onChangeNew={setNewPassword}
                    onChangeConfirm={setConfirmPassword}
                    error={error}
                    showToggle={true}
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword((v) => !v)}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 active:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Setting password...
                      </>
                    ) : (
                      <>
                        Set Password
                        <span className="material-symbols-outlined text-lg">check</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
