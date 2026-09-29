"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { verifyStripePayment } from "@/lib/api";

/**
 * Browser return from Stripe Checkout. Confirms the session server-side,
 * then hands off to the shared order-confirmed page (success or failed).
 */
function StripeReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderParam = searchParams.get("order");
  const sessionId = searchParams.get("session_id");
  const orderId = Number(orderParam);

  const [verifyError, setVerifyError] = useState("");
  const verifyRef = useRef<{ key: string; promise: Promise<unknown> } | null>(null);

  // Derive link validation during render instead of setting state in an effect.
  const linkError = !orderParam || Number.isNaN(orderId) || orderId <= 0 || !sessionId
    ? "This payment return link is incomplete."
    : "";
  const error = linkError || verifyError;

  useEffect(() => {
    if (linkError) {
      return;
    }

    // StrictMode mounts effects twice in dev — reuse the single verification.
    if (!sessionId) {
      return;
    }
    const verifyKey = `${orderId}:${sessionId}`;
    if (verifyRef.current?.key !== verifyKey) {
      verifyRef.current = { key: verifyKey, promise: verifyStripePayment(orderId, sessionId) };
    }
    let cancelled = false;
    const pending = verifyRef.current.promise;
    pending
      .then((result) => {
        if (cancelled) {
          return;
        }
        const ok = (result as { success?: boolean }).success === true;
        router.replace(`/order/confirmed?order=${orderId}${ok ? "" : "&payment=failed"}`);
      })
      .catch(() => {
        if (!cancelled) {
          setVerifyError("We couldn't confirm your payment — check My Orders, or contact support if your card was charged.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [linkError, orderId, sessionId, router]);

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-1 items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Payment confirmation failed</h1>
          <p className="mt-2 text-sm text-slate-600">{error}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/orders" className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700">
              My Orders
            </Link>
            <Link href="/" className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-1 flex-col items-center justify-center bg-slate-50 px-4">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
      <p className="mt-4 text-sm text-slate-600">Confirming your payment…</p>
    </div>
  );
}

export default function StripeReturnClient() {
  return <StripeReturnContent />;
}