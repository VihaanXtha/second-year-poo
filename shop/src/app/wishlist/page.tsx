"use client";

import { useWishlist } from "@/context/WishlistContext";
import { ProductCard } from "@/components/shared/ProductCard";

export default function WishlistPage() {
  const { items, clearWishlist } = useWishlist();

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Wishlist</h1>
            <p className="text-sm text-slate-600 mt-1">{items.length} items saved</p>
          </div>
          {items.length > 0 && (
            <button onClick={clearWishlist} className="text-sm font-medium text-red-700 hover:text-red-800">Clear all</button>
          )}
        </div>
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center">
            <p className="text-sm text-slate-500">Your wishlist is empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map(({ product }) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
