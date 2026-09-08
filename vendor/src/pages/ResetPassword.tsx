import React, { useState } from 'react';
import { getApiUrl } from '../context/AuthContext';
import { PasswordResetForm } from '../components/PasswordResetForm';

type ResetPasswordProps = {
  email: string;
  code: string;
  onSuccess?: () => void;
  onBack?: () => void;
};

export function ResetPassword({ email, code, onSuccess, onBack }: ResetPasswordProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captcha, setCaptcha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!captcha) {
      setError('Please confirm you are not a robot.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          reset_token: code,
          password: newPassword,
          password_confirmation: confirmPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Password reset failed');
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed');
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

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                  <input type="email" required value={email} readOnly className="w-full rounded-xl border border-slate-200 bg-slate-100 py-2.5 px-3 text-sm text-slate-900 outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">OTP Code</label>
                  <input type="text" required maxLength={6} value={code} readOnly className="w-full rounded-xl border border-slate-200 bg-slate-100 py-2.5 px-3 text-sm text-slate-900 outline-none tracking-widest" />
                </div>
                <PasswordResetForm
                  newPassword={newPassword}
                  confirmPassword={confirmPassword}
                  onChangeNew={setNewPassword}
                  onChangeConfirm={setConfirmPassword}
                  error={error}
                  showToggle={false}
                />
                <div className="flex items-center gap-2">
                  <input
                    id="reset-captcha"
                    type="checkbox"
                    checked={captcha}
                    onChange={(e) => setCaptcha(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                  />
                  <label htmlFor="reset-captcha" className="text-sm text-slate-600">
                    I'm not a robot
                  </label>
                </div>
                <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 active:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60">
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-slate-400">
                <button type="button" onClick={onBack} className="text-red-600 hover:text-red-700">Resend OTP</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
