"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { fetchOrder, formatPrice, initiatePayment, type Order, type PaymentInitiateData } from "@/lib/api";

const METHOD_LABELS: Record<string, string> = {
  cod: "Cash on Delivery",
  esewa: "eSewa",
  stripe: "Card (Stripe)",
  khalti: "Khalti",
};

function ConfirmedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { clearCart } = useCart();

  const orderParam = searchParams.get("order");
  // "failed" = gateway rejected/cancelled after the order (eSewa),
  // "cancelled" = customer backed out of Stripe before paying.
  const paymentFlag = searchParams.get("payment");
  const orderId = Number(orderParam);
  // Derived instead of synced via setState so the fetch effect never calls
  // setState synchronously (avoids cascading renders).
  const hasValidOrderParam = !!orderParam && !Number.isNaN(orderId) && orderId > 0;

  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  // True while the order request is in flight. It is only ever cleared in
  // async callbacks below — the "invalid link / logged out" case is derived
  // during render (see isLoading) so this effect never calls setState
  // synchronously (which would trigger cascading renders).
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const clearedRef = useRef(false);

  // Derived during render instead of synced via setState: when the link is
  // incomplete (or the visitor is logged out) there is nothing to fetch, so
  // we are never "loading".
  const isLoading = loading && isAuthenticated && hasValidOrderParam;

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(`/order/confirmed?order=${orderParam ?? ""}`)}`);
    }
  }, [isAuthenticated, router, orderParam]);

  useEffect(() => {
    if (!isAuthenticated || !hasValidOrderParam) {
      return;
    }
    let cancelled = false;
    fetchOrder(orderId)
      .then(({ order: loaded }) => {
        if (cancelled) return;
        setOrder(loaded);
        // A settled order (paid, or placed with COD) empties the cart. The
        // failed/cancelled flags keep the items so the customer can retry.
        const settled = !paymentFlag && (loaded.payment_status === "paid" || loaded.payment_method === "cod");
        if (settled && !clearedRef.current) {
          clearedRef.current = true;
          clearCart().catch(() => {
            /* cart refresh happens on the next page anyway */
          });
        }
      })
      .catch(() => {
        if (!cancelled) setError("We couldn't load this order — check My Orders for its status.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, hasValidOrderParam, orderId, paymentFlag, clearCart]);

  /** Re-open the payment portal for an unpaid-but-reserved order. */
  async function retryPayment() {
    if (!order) return;
    setRetrying(true);
    setError("");
    try {
      const { data } = await initiatePayment(order.id, order.payment_method as "cod" | "esewa" | "khalti" | "stripe");
      if (data.url) {
        router.push(data.url);
        return;
      }
      if (data.action && data.fields) {
        submitEsewaForm(data);
        return;
      }
      throw new Error("The payment gateway did not respond correctly.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not restart the payment.");
      setRetrying(false);
    }
  }

  function submitEsewaForm(data: PaymentInitiateData) {
    const form = document.createElement("form");
    form.method = (data.method as string) || "POST";
    form.action = data.action || "";
    form.target = "_self";
    for (const [key, value] of Object.entries(data.fields ?? {})) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = String(value);
      form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
  }
  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[60vh] flex-1 items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Order not found</h1>
          <p className="mt-2 text-sm text-slate-600">{error || "This order link is incomplete or belongs to another account."}</p>
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

  const paid = order.payment_status === "paid";
  const showSuccess = paid || (order.payment_method === "cod" && !paymentFlag);
  const canRetry = paymentFlag === "cancelled" && !paid;
  const subtotal = Number(order.subtotal ?? order.total);
  const discount = Number(order.discount_amount ?? 0);

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      {/* Result banner */}
      {showSuccess ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
          <CheckCircle2 size={48} className="mx-auto text-green-600" />
          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            {paid ? "Payment successful — order placed!" : "Order placed!"}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {order.payment_method === "cod"
              ? `Pay Rs. ${Number(order.total).toLocaleString("en-IN")} in cash when your order arrives.`
              : "Thank you — your payment has been received."}
          </p>
        </div>
      ) : paymentFlag === "failed" ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <XCircle size={48} className="mx-auto text-red-600" />
          <h1 className="mt-3 text-2xl font-bold text-slate-900">Payment failed</h1>
          <p className="mt-1 text-sm text-slate-600">
            The payment didn&apos;t go through, so this order was cancelled and its items were returned to stock. Your cart still has them — try again whenever you like.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <XCircle size={48} className="mx-auto text-amber-600" />
          <h1 className="mt-3 text-2xl font-bold text-slate-900">Payment not completed</h1>
          <p className="mt-1 text-sm text-slate-600">
            Your order is reserved but still unpaid. You can complete the payment now or later from My Orders.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Order details */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Order number</p>
            <p className="font-mono text-lg font-bold text-slate-900">{order.order_number}</p>
          </div>
          <div className="text-right text-sm text-slate-600">
            <p>{METHOD_LABELS[order.payment_method] ?? order.payment_method}</p>
            <p className={paid ? "font-semibold text-green-600" : "font-semibold text-amber-600"}>
              {paid ? "Paid" : `Payment ${order.payment_status}`}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3 border-b border-slate-100 pb-4">
          {(order.items ?? []).map((it) => (
            <div key={it.id} className="flex items-center gap-3">
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-slate-50">
                {it.product?.image ? (
                  <Image src={it.product.image} alt={it.product_name} fill sizes="48px" className="object-contain" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{it.product_name}</p>
                <p className="text-xs text-slate-500">Qty {it.quantity}</p>
              </div>
              <span className="font-mono text-sm font-bold text-slate-900">{formatPrice(it.subtotal)}</span>
            </div>
          ))}
        </div>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between text-slate-600">
            <dt>Subtotal</dt>
            <dd className="font-mono">{formatPrice(subtotal)}</dd>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <dt>Discount</dt>
              <dd className="font-mono">&minus;{formatPrice(discount)}</dd>
            </div>
          )}
          <div className="flex justify-between text-slate-600">
            <dt>Shipping</dt>
            <dd className="font-medium text-green-600">Free</dd>
          </div>
          <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-bold text-slate-900">
            <dt>Total</dt>
            <dd className="font-mono">{formatPrice(order.total)}</dd>
          </div>
        </dl>

        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Deliver to</p>
          <p className="mt-1 text-slate-900">{order.shipping_phone}</p>
          <p>{order.shipping_address}</p>
          <p>{order.shipping_city}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {canRetry && (
          <button
            onClick={retryPayment}
            disabled={retrying}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            <RotateCcw size={15} />
            {retrying ? "Opening payment..." : "Retry payment"}
          </button>
        )}
        <Link href="/orders" className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700">
          View My Orders
        </Link>
        <Link href="/" className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmedClient() {
  return <ConfirmedContent />;
}