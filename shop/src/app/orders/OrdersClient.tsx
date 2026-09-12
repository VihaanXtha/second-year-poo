"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, MapPin, Package, Truck, XCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchOrders, formatPrice, type Order } from "@/lib/api";

// Order lifecycle used for the inline tracking strip. `cancelled` is terminal.
const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"] as const;

function statusIndex(status: string): number {
  const idx = STATUS_STEPS.indexOf(status as (typeof STATUS_STEPS)[number]);
  return idx === -1 ? 0 : idx;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  processing: "bg-blue-50 text-blue-700",
  shipped: "bg-indigo-50 text-indigo-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function OrdersClient() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const load = useCallback(
    (targetPage: number) => {
      setLoading(true);
      setError("");
      fetchOrders(targetPage)
        .then((res) => {
          setOrders(res.data ?? []);
          setLastPage(res.last_page ?? 1);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Failed to load orders");
        })
        .finally(() => setLoading(false));
    },
    []
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/orders");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    fetchOrders(page)
      .then((res) => {
        if (!cancelled) {
          setOrders(res.data ?? []);
          setLastPage(res.last_page ?? 1);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load orders");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, page]);

  if (!isAuthenticated || loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 px-4 py-24 text-center">
        <XCircle className="text-5xl text-red-300" />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Couldn&apos;t load your orders</h1>
        <p className="mt-2 max-w-sm text-sm text-slate-500">{error}</p>
        <button
          onClick={() => load(page)}
          className="mt-6 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 px-4 py-24 text-center">
        <Package className="text-5xl text-slate-300" />
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">No orders yet</h1>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          When you place your first order it will appear here with live status tracking.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Orders</h1>
        <p className="mt-1 text-sm text-slate-500">
          {orders.length} order{orders.length !== 1 ? "s" : ""} — tap one for details and tracking
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {orders.map((order) => {
          const expanded = expandedId === order.id;
          const idx = statusIndex(order.status);
          const cancelled = order.status === "cancelled";

          return (
            <div key={order.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {/* Summary row — toggles the detail/tracking view */}
              <button
                onClick={() => setExpandedId(expanded ? null : order.id)}
                className="flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-slate-50"
              >
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <Package size={20} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-900">{order.order_number}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {formatDate(order.created_at)} · {order.items?.length ?? 0} item
                    {(order.items?.length ?? 0) !== 1 ? "s" : ""} · {order.payment_method.toUpperCase()}
                  </span>
                </span>

                <span
                  className={`hidden flex-shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold sm:block ${
                    STATUS_STYLES[order.status] ?? "bg-slate-100 text-slate-600"
                  }`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>

                <span className="flex-shrink-0 font-mono text-sm font-bold text-slate-900">{formatPrice(order.total)}</span>

                {expanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
              </button>

              {/* Detail / tracking view — shown when the summary row is expanded */}
              {expanded && (
                <div className="border-t border-slate-100 px-5 py-5">
                  <div className="mb-4 flex items-center gap-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Tracking</h2>
                    <span className="flex h-2 w-2 rounded-full bg-slate-300" />
                    <span className="text-xs text-slate-400">{formatDate(order.updated_at ?? order.created_at)}</span>
                  </div>

                  <div className="flex gap-1">
                    {STATUS_STEPS.map((step, i) => {
                      const done = i <= idx;
                      const current = step === order.status;
                      return (
                        <div key={step} className="flex flex-1 flex-col">
                          <div
                            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                              done
                                ? cancelled
                                  ? "border-red-300 bg-red-50 text-red-500"
                                  : "border-green-300 bg-green-50 text-green-600"
                                : "border-slate-200 bg-white text-slate-300"
                            }`}
                          >
                            {done ? (cancelled ? <XCircle size={14} /> : <CheckCircle2 size={14} />) : <div className="h-2 w-2 rounded-full" />}
                          </div>
                          <span
                            className={`mt-1.5 text-center text-xs font-medium ${
                              current
                                ? "text-slate-700"
                                : done
                                  ? "text-green-600"
                                  : "text-slate-400"
                            }`}
                          >
                            {step.charAt(0).toUpperCase() + step.slice(1)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {!cancelled && order.tracking_number && (
                    <div className="mt-5 flex items-start gap-3 rounded-xl bg-slate-50 px-4 py-3">
                      <Truck className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tracking Number</p>
                        <p className="mt-0.5 font-mono text-sm text-slate-700">{order.tracking_number}</p>
                      </div>
                    </div>
                  )}

                  {order.shipping_address && (
                    <div className="mt-4 flex items-start gap-3 rounded-xl bg-slate-50 px-4 py-3">
                      <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Shipping Address</p>
                        <p className="mt-0.5 text-sm text-slate-700">{order.shipping_address}</p>
                      </div>
                    </div>
                  )}

                  {order.items && order.items.length > 0 && (
                    <div className="mt-5 space-y-3">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Items</h3>
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-4 rounded-lg bg-white px-4 py-2.5 shadow-sm">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-900">{item.name}</p>
                            <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                          </div>
                          <span className="font-mono text-sm font-bold text-slate-900">{formatPrice(item.price ?? item.unit_price)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {lastPage > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => {
              setLoading(true);
              setError("");
              setPage((p) => Math.max(1, p - 1));
            }}
            disabled={page <= 1}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <ChevronLeft size={18} />
          </button>

          {Array.from({ length: lastPage }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === lastPage || Math.abs(p - page) <= 1)
            .reduce<(number | "...")[]>((acc, p, i, arr) => {
              if (i > 0 && p - (arr[i - 1] as number) > 1) {
                acc.push("...");
              }
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="h-10 w-10 items-center justify-center text-sm text-slate-400">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => {
                    setLoading(true);
                    setError("");
                    setPage(p as number);
                  }}
                  className={`h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold transition-colors ${
                    p === page
                      ? "bg-red-600 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                  }`}
                  aria-label={`Page ${p}`}
                  aria-current={p === page ? "page" : undefined}
                >
                  {p}
                </button>
              )
            )}

          <button
            onClick={() => {
              setLoading(true);
              setError("");
              setPage((p) => Math.min(lastPage, p + 1));
            }}
            disabled={page >= lastPage}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
