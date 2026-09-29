"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

/**
 * Standalone OTP entry page for verifying the signed-in account's email or
 * phone number. My Account's "Verify" buttons send the OTP first, then
 * redirect here with `?type=email|phone`; this page confirms the code and
 * returns to /account with a `?verified=` flash.
 *
 * Reads useSearchParams, so the content component sits inside a Suspense
 * boundary below to stay compatible with static prerendering (same as /login
 * and /auth/callback).
 */
function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const { user, isAuthenticated, verifyEmailOtp, verifyPhoneOtp, resendOtp, fetchProfile } = useAuth();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const isEmail = type === "email";
  const isPhone = type === "phone";
  const channel = isEmail ? "email" : isPhone ? "phone" : null;

  // Guard the route: not signed in, bad/missing `type`, nothing to verify, or
  // already verified all send the user back to /account. Failures are derived
  // during render rather than setState'd inside the effect body.
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(`/verify-otp?type=${type ?? ""}`)}`);
      return;
    }
    if (!channel) {
      router.replace("/account");
      return;
    }
    if (!user) return;
    if (channel === "email" ? user.email_verified : user.phone_verified) {
      router.replace(`/account?verified=${channel}`);
      return;
    }
    if (channel === "phone" && !user.phone) {
      router.replace("/account");
    }
  }, [isAuthenticated, channel, user, type, router]);

  if (!isAuthenticated || !user || !channel) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
      </div>
    );
  }

  const destination = channel === "email" ? user.email : user.phone!;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (channel === "email") {
        await verifyEmailOtp(user.email, code);
      } else {
        await verifyPhoneOtp(user.id, code);
      }
      // The verify endpoints return a slim user payload; rehydrate the full
      // profile so address fields aren't wiped from the local snapshot.
      await fetchProfile().catch(() => {
        /* /account refetches on mount anyway */
      });
      router.replace(`/account?verified=${channel}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setResendLoading(true);
    try {
      await resendOtp(user.email, channel === "email" ? "email_verification" : "phone_verification");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] flex-1 items-center justify-center bg-slate-50 px-4 py-16">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            Verify your {channel === "email" ? "email" : "phone"}
          </h1>
          <p className="mt-2 text-slate-600">
            We sent a 6-digit code to <span className="font-medium">{destination}</span>. It expires in 10
            minutes.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Enter OTP</label>
              <input
                type="text"
                required
                autoFocus
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-center text-sm tracking-widest focus:border-red-500 focus:outline-none"
                placeholder="000000"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              className="font-medium text-red-600 hover:underline disabled:opacity-50"
            >
              {resendLoading ? "Sending..." : "Resend OTP"}
            </button>
            <Link href="/account" className="text-slate-500 hover:text-slate-700">
              Back to My Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] flex-1 items-center justify-center bg-slate-50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}
