"use client";

import Link from "next/link";
import { useState } from "react";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/api";

export default function CartClient() {
  const { items, loading, subtotal, count, removeItem, updateQuantity, clearCart } = useCart();
  const [busy, setBusy] = useState(false);

  async function handleCheckout() {
    setBusy(true);
    // Checkout flow ships in a later prompt — this is a deliberate dead-end
    // that keeps the button honest rather than pretending to work.
    window.alert("Checkout arrives in an upcoming prompt. Your cart is saved.");
    setBusy(false);
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 px-4 py-24 text-center">
        <ShoppingBag className="text-5xl text-slate-300" />
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">Your cart is empty</h1>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Browse the store and add items — they will show up here. Guest carts are saved to your
          device and merge into your account when you sign in.
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
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Your Cart</h1>
          <p className="mt-1 text-sm text-slate-500">{count} item{count !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={clearCart}
          className="text-sm font-medium text-slate-500 transition-colors hover:text-red-600"
        >
          Clear cart
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Line items */}
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4">
              <Link
                href={`/product/${item.productId}`}
                className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50"
              >
                {item.image ? (
                  <img src={item.image} alt={item.name} className="h-full w-full object-contain p-2" />
                ) : (
                  <ShoppingBag className="text-2xl text-slate-300" />
                )}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <Link href={`/product/${item.productId}`} className="truncate text-sm font-semibold text-slate-900 hover:text-red-600">
                  {item.name}
                </Link>
                <p className="mt-1 font-mono text-sm font-bold text-red-600">{formatPrice(item.price)}</p>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-lg border border-slate-200">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      aria-label="Decrease quantity"
                      className="flex h-8 w-8 items-center justify-center text-slate-500 transition-colors hover:text-red-600"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="flex h-8 w-10 items-center justify-center text-sm font-semibold text-slate-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      aria-label="Increase quantity"
                      className="flex h-8 w-8 items-center justify-center text-slate-500 transition-colors hover:text-red-600"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm font-bold text-slate-900">{formatPrice(item.price * item.quantity)}</span>
                    <button
                      onClick={() => removeItem(item.productId)}
                      aria-label={`Remove ${item.name} from cart`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-40 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900">Order Summary</h2>
            <dl className="mt-4 space-y-3 border-b border-slate-100 pb-4">
              <div className="flex justify-between text-sm text-slate-600">
                <dt>Subtotal ({count} items)</dt>
                <dd className="font-mono">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <dt>Shipping</dt>
                <dd className="text-slate-400">Calculated at checkout</dd>
              </div>
            </dl>
            <div className="mt-4 flex justify-between text-base font-bold text-slate-900">
              <span>Total</span>
              <span className="font-mono">{formatPrice(subtotal)}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={busy}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
            >
              Proceed to Checkout
              <ArrowRight size={16} />
            </button>
            <Link href="/" className="mt-3 block text-center text-sm font-medium text-slate-500 transition-colors hover:text-red-600">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
