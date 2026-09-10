"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Search, Heart, ShoppingCart } from "lucide-react";
import { CART_KEY, WISHLIST_KEY } from "@/lib/api";
import TopBar from "@/components/TopBar";
import UserMenu from "@/components/UserMenu";
import BrandsMenu from "@/components/BrandsMenu";
import CategoryBar from "@/components/CategoryBar";

// Cart/wishlist live in localStorage until the backend cart arrives (later prompt).
function useStoredCount(key: string) {
  const read = useCallback(() => {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
      if (!Array.isArray(parsed)) return 0;
      return parsed.reduce((n: number, item) => n + (Number((item as { quantity?: number })?.quantity) || 1), 0);
    } catch {
      return 0;
    }
  }, [key]);

  const [count, setCount] = useState(() => read());
  useEffect(() => {
    const update = () => setCount(read());
    window.addEventListener("storage", update);
    window.addEventListener(`${key}-changed`, update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener(`${key}-changed`, update);
    };
  }, [read, key]);
  return count;
}

export default function Header() {
  const cartCount = useStoredCount(CART_KEY);
  const wishlistCount = useStoredCount(WISHLIST_KEY);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Layer 1 — thin top bar: social links (env-driven) */}
      <TopBar />

      {/* Layer 2 — main bar: logo / search / wishlist / cart / auth */}
      <div className="border-b border-slate-100">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600">
              <span className="material-symbols-outlined text-[20px] text-white">hardware</span>
            </span>
            <span className="leading-tight">
              <span className="block text-lg font-bold tracking-tight text-slate-900">Circuit Bazaar</span>
              <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-red-500">Shop</span>
            </span>
          </Link>

          <div className="ml-6 hidden items-center md:flex">
            <BrandsMenu />
          </div>

          <form action="/search" className="ml-4 hidden flex-1 md:flex">
            <div className="relative w-full max-w-xl">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                name="q"
                placeholder="Search products, brands, SKUs…"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:outline-none"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center">
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative rounded-lg p-2.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-red-600"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative rounded-lg p-2.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-red-600"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <UserMenu />
          </div>
        </div>

        {/* Mobile search row */}
        <form action="/search" className="mx-auto flex max-w-7xl px-4 pb-3 md:hidden sm:px-6">
          <div className="relative w-full">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              name="q"
              placeholder="Search products…"
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm focus:border-red-500 focus:bg-white focus:outline-none"
            />
          </div>
        </form>
      </div>

      {/* Layer 3 — category bar with mega menus (+ mobile nav) */}
      <CategoryBar />
    </header>
  );
}
