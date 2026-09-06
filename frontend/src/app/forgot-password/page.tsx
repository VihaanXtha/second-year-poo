"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resendOtp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      await resendOtp(email, 'password_reset');
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Forgot password?</h1>
          <p className="text-slate-600">No worries, we'll send you reset instructions.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
                <span className="material-symbols-outlined text-green-600 text-[28px]">mail</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Check your email</h2>
              <p className="text-sm text-slate-600">
                We sent a password reset OTP to <span className="font-semibold">{email}</span>.
                Please check your inbox and use the 6-digit code to reset your password.
              </p>
              <Link
                href="/reset-password"
                className="inline-flex items-center justify-center rounded-xl bg-red-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-800 transition-colors"
              >
                Enter reset code
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-slate-600">
            <Link href="/login" className="text-red-700 font-medium hover:underline">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
