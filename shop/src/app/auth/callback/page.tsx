"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth, takeGoogleReturn, type GoogleSignInResult } from "@/context/AuthContext";

/**
 * Landing page for the Google OAuth round-trip.
 *
 * The backend's /api/auth/google/callback handler redirects here with a
 * single-use `code`, which this page swaps for a Sanctum token via
 * POST /api/auth/google/exchange. Swapping rather than receiving the token in
 * the query string keeps the credential out of browser history, server access
 * logs and Referer headers.
 *
 * Reads useSearchParams, so it is wrapped in a Suspense boundary below to stay
 * compatible with static prerendering.
 */
function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { completeGoogleSignIn } = useAuth();

  // Failure modes the query string already spells out (`?error=...`, or no
  // `code` at all) are known during render, so they are derived here rather
  // than synced into state from the effect. Calling setState from the effect
  // body trips `react-hooks/set-state-in-effect` and costs a cascading render
  // before the error card can paint.
  const failure = searchParams.get("error");
  const code = searchParams.get("code");
  const paramError = failure
    ? failure === "google_auth_failed"
      ? "Google sign-in could not be completed. Please try again."
      : "Google returned an error. Please try again."
    : !code
      ? "This sign-in link is incomplete. Please try again."
      : "";

  // The exchange outcome is the only genuinely async value, so it is the only
  // thing that needs state; it is written from promise callbacks below, never
  // from the synchronous body of the effect.
  const [exchangeError, setExchangeError] = useState("");
  const error = paramError || exchangeError;

  // Memoised so StrictMode's dev-only effect re-run re-subscribes to the same
  // exchange instead of replaying the single-use code (see the effect below).
  const exchangeRef = useRef<Promise<GoogleSignInResult> | null>(null);

  useEffect(() => {
    // The link is already known to be unusable; there is nothing to exchange.
    if (paramError || !code) return;

    let cancelled = false;

    // StrictMode mounts effects twice in dev and the OAuth code is single-use,
    // so the in-flight exchange is reused by the second run rather than being
    // fired twice. Each run keeps its own `cancelled` flag, so leaving the page
    // mid-flight still discards a result nobody is waiting for any more.
    if (!exchangeRef.current) {
      exchangeRef.current = completeGoogleSignIn(code);
    }
    const exchange = exchangeRef.current;

    exchange
      .then((result) => {
        if (cancelled) return;
        // Strip the spent code from the address bar before navigating away.
        window.history.replaceState(null, "", "/auth/callback");
        if (result.requiresProfileCompletion || result.requiresPhoneVerification) {
          // New or incomplete accounts (e.g. Google sign-ups with no phone or
          // address) finish setup on the register wizard, which owns the only
          // phone-verification UI in the shop. /settings is read-only there.
          router.replace("/register?mode=google");
          return;
        }
        router.replace(takeGoogleReturn());
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setExchangeError(err instanceof Error ? err.message : "Google sign-in failed");
      });

    return () => {
      cancelled = true;
    };
  }, [code, completeGoogleSignIn, paramError, router]);

  return (
    <div className="flex min-h-[70vh] flex-1 items-center justify-center bg-slate-50 px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        {error ? (
          <>
            <h1 className="text-xl font-bold text-slate-900">Sign-in failed</h1>
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <Link
              href="/login"
              className="mt-6 inline-block rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              Back to sign in
            </Link>
          </>
        ) : (
          <>
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
            <p className="mt-4 text-sm text-slate-600">Finishing your Google sign-in…</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] flex-1 items-center justify-center bg-slate-50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}