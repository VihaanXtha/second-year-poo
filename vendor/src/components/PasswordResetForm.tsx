import React from 'react';

interface PasswordResetFormProps {
  newPassword: string;
  confirmPassword: string;
  onChangeNew: (v: string) => void;
  onChangeConfirm: (v: string) => void;
  error?: string | null;
  showToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  newPasswordPlaceholder?: string;
  confirmPasswordPlaceholder?: string;
}

export function PasswordResetForm({
  newPassword,
  confirmPassword,
  onChangeNew,
  onChangeConfirm,
  error,
  showToggle = true,
  showPassword = false,
  onTogglePassword,
  newPasswordPlaceholder = '••••••••',
  confirmPasswordPlaceholder = '••••••••',
}: PasswordResetFormProps) {
  return (
    <>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">New Password</label>
        <div className="relative">
          <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => onChangeNew(e.target.value)}
            placeholder={newPasswordPlaceholder}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-2 focus:ring-red-100"
          />
          {showToggle && onTogglePassword && (
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Toggle password visibility"
            >
              <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
            </button>
          )}
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Confirm Password</label>
        <div className="relative">
          <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => onChangeConfirm(e.target.value)}
            placeholder={confirmPasswordPlaceholder}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-2 focus:ring-red-100"
          />
          {showToggle && onTogglePassword && (
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Toggle password visibility"
            >
              <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
            </button>
          )}
        </div>
      </div>
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <span className="material-symbols-outlined text-lg">error</span>
          <span>{error}</span>
        </div>
      )}
    </>
  );
}
