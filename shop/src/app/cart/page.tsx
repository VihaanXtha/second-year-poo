"use client";

import { useCart } from "@/context/CartContext";
import { formatNpr } from "@/lib/utils";
import Link from "next/link";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart();

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Shopping Cart</h1>
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">Your cart is empty.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-4 rounded-xl border border-slate-200 p-4">
                  <img src={product.image} alt={product.name} className="w-24 h-24 rounded-lg object-cover bg-slate-100" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-slate-900 line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">{formatNpr(product.priceNpr)}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <button onClick={() => updateQuantity(product.id, quantity - 1)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50">-</button>
                      <span className="text-sm font-medium w-6 text-center">{quantity}</span>
                      <button onClick={() => updateQuantity(product.id, quantity + 1)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50">+</button>
                      <button onClick={() => removeItem(product.id)} className="ml-auto text-xs text-red-700 hover:text-red-800">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-slate-200 p-6 h-fit">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between"><span className="text-slate-600">Subtotal</span><span className="font-medium">{formatNpr(total)}</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-600">Shipping</span><span className="font-medium">{total >= 50000 ? 'Free' : 'Rs. 950'}</span></div>
                <div className="border-t border-slate-200 pt-2 flex items-center justify-between"><span className="font-semibold">Total</span><span className="font-semibold">{formatNpr(total >= 50000 ? total : total + 950)}</span></div>
              </div>
              <Link href="/checkout" className="mt-6 block w-full text-center rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
                Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
