"use client";

import Link from "next/link";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/api";

export default function WishlistClient() {
  const { items, loading, count, removeItem, toggle } = useWishlist();
  const { addItem } = useCart();

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
        <Heart className="text-5xl text-slate-300" />
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">Your wishlist is empty</h1>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Tap the heart on any product to save it here. Saved items are kept on your device as a
          guest and merge into your account when you sign in.
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Your Wishlist</h1>
        <p className="mt-1 text-sm text-slate-500">{count} item{count !== 1 ? "s" : ""}</p>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.productId}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white"
          >
            <button
              onClick={() => toggle({ id: item.productId, name: item.name, price: item.price, image: item.image })}
              aria-label={`Remove ${item.name} from wishlist`}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-red-500 shadow-sm transition-colors hover:bg-red-50"
            >
              <Heart size={16} fill="currentColor" />
            </button>

            <Link
              href={`/product/${item.productId}`}
              className="flex aspect-square items-center justify-center overflow-hidden bg-slate-50"
            >
              {item.image ? (
                <img src={item.image} alt={item.name} className="h-full w-full object-contain p-6 transition-transform duration-300 group-hover:scale-105" />
              ) : (
                <ShoppingCart className="text-3xl text-slate-300" />
              )}
            </Link>

            <div className="flex flex-1 flex-col p-4">
              <Link
                href={`/product/${item.productId}`}
                className="line-clamp-2 text-sm font-semibold text-slate-900 hover:text-red-600"
              >
                {item.name}
              </Link>
              <p className="mt-1 font-mono text-sm font-bold text-red-600">{formatPrice(item.price)}</p>
              <div className="mt-auto flex items-center gap-2 pt-4">
                <button
                  onClick={() => addItem({ id: item.productId, name: item.name, price: item.price, image: item.image })}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                >
                  <ShoppingCart size={14} />
                  Add to Cart
                </button>
                <button
                  onClick={() => removeItem(item.productId)}
                  aria-label={`Remove ${item.name}`}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:border-red-200 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
