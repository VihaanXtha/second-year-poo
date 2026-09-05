"use client";

import { useCart } from "@/context/CartContext";
import { formatNpr } from "@/lib/utils";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={closeCart} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold">Cart ({items.length})</h2>
          <button onClick={closeCart} className="p-2 text-slate-500 hover:text-slate-900">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 && <p className="text-sm text-slate-500">Your cart is empty.</p>}
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="flex gap-4">
              <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover bg-slate-100" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-slate-900 line-clamp-1">{product.name}</h3>
                <p className="text-sm text-slate-500">{formatNpr(product.priceNpr)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => updateQuantity(product.id, quantity - 1)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50">-</button>
                  <span className="text-sm font-medium w-6 text-center">{quantity}</span>
                  <button onClick={() => updateQuantity(product.id, quantity + 1)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50">+</button>
                  <button onClick={() => removeItem(product.id)} className="ml-auto text-xs text-red-700 hover:text-red-800">Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div className="border-t border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between text-sm font-medium">
              <span>Subtotal</span>
              <span>{formatNpr(total)}</span>
            </div>
            <a href="/cart" onClick={closeCart} className="block w-full text-center rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
              View Cart
            </a>
            <a href="/checkout" onClick={closeCart} className="block w-full text-center rounded-lg bg-red-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-800">
              Checkout
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
