"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatNpr } from "@/lib/utils";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    clearCart();
    router.push("/");
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h1>
          <a href="/products" className="text-red-700 hover:underline">Continue shopping</a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Checkout</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <input required placeholder="Full name" className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-red-500" />
                <input required placeholder="Address" className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-red-500" />
                <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="City" className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-red-500" />
                  <input required placeholder="Phone" className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-red-500" />
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Payment Method</h2>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-slate-700"><input type="radio" name="payment" value="cod" defaultChecked /> Cash on Delivery</label>
                <label className="flex items-center gap-2 text-sm text-slate-700"><input type="radio" name="payment" value="esewa" /> eSewa</label>
                <label className="flex items-center gap-2 text-sm text-slate-700"><input type="radio" name="payment" value="khalti" /> Khalti</label>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 p-6 h-fit">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h2>
            <div className="space-y-3">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{product.name} × {quantity}</span>
                  <span className="font-medium">{formatNpr(product.priceNpr * quantity)}</span>
                </div>
              ))}
              <div className="border-t border-slate-200 pt-3 flex items-center justify-between font-semibold">
                <span>Total</span>
                <span>{formatNpr(total >= 50000 ? total : total + 950)}</span>
              </div>
            </div>
            <button type="submit" disabled={loading} className="mt-6 w-full rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
              {loading ? "Placing order..." : "Place Order"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
