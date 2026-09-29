"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth, takeGoogleReturn } from "@/context/AuthContext";

/**
 * Landing page for the Google OAuth round-trip on the marketing site.
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
  const [error, setError] = useState("");

  // StrictMode fires effects twice in dev; the code is single-use so a second
  // exchange would fail and wrongly show an error. This guard keeps it to one.
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const failure = searchParams.get("error");
    if (failure) {
      setError(
        failure === "google_auth_failed"
          ? "Google sign-in could not be completed. Please try again."
          : "Google returned an error. Please try again.",
      );
      return;
    }

    const code = searchParams.get("code");
    if (!code) {
      setError("This sign-in link is incomplete. Please try again.");
      return;
    }

    let cancelled = false;

    completeGoogleSignIn(code)
      .then((result) => {
        if (cancelled) return;
        void result;
        // Strip the spent code from the address bar before navigating away.
        window.history.replaceState(null, "", "/auth/callback");

        // Match the login page: with no in-app destination to return to, the
        // customer area lives on the shop portal.
        const destination = takeGoogleReturn("");
        if (destination) {
          router.replace(destination);
        } else {
          const shopUrl = process.env.NEXT_PUBLIC_SHOP_URL || "http://localhost:3003";
          window.location.href = `${shopUrl}/account`;
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Google sign-in failed");
      });

    return () => {
      cancelled = true;
    };
  }, [completeGoogleSignIn, router, searchParams]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {error ? (
          <>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Sign-in failed</h1>
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <Link
              href="/login"
              className="mt-6 inline-block rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Back to sign in
            </Link>
          </>
        ) : (
          <>
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
            <p className="mt-4 text-sm text-slate-500">Finishing your Google sign-in…</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center px-4"><p className="text-slate-500 text-sm">Loading…</p></div>}>
      <CallbackContent />
    </Suspense>
  );
}