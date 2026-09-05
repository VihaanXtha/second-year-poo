"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { apiClient } from "@/lib/api";

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    apiClient<{ categories: Category[] }>("/categories")
      .then((data) => {
        if (!cancelled) setCategories(data.categories || []);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight text-slate-900">
            Circuit Bazaar
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="hover:text-slate-900 inline-flex items-center gap-1"
              >
                Categories
                <span className="material-symbols-outlined text-[18px]">{categoriesOpen ? 'expand_less' : 'expand_more'}</span>
              </button>

              {categoriesOpen && (
                <div className="absolute top-full left-0 mt-2 w-[640px] rounded-2xl bg-white border border-slate-200 shadow-xl p-6">
                  {loading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-red-600 border-t-transparent" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/products?category=${cat.id}`}
                          className="rounded-xl border border-slate-100 p-3 text-sm font-medium text-slate-700 hover:border-red-200 hover:text-red-700 hover:bg-red-50/50 transition-colors"
                          onClick={() => setCategoriesOpen(false)}
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <Link href="/products" className="hover:text-slate-900">All Products</Link>
            <Link href="/about" className="hover:text-slate-900">About</Link>
            <Link href="/contact" className="hover:text-slate-900">Contact</Link>
            <Link href="/account" className="hover:text-slate-900">Account</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/wishlist" className="text-sm font-medium text-slate-600 hover:text-slate-900">Wishlist</Link>
            <Link href="/cart" className="text-sm font-medium text-slate-600 hover:text-slate-900">Cart</Link>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-slate-600">
            <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/products" className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Products</Link>
            <Link href="/about" className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">About</Link>
            <Link href="/contact" className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Contact</Link>
            <Link href="/account" className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Account</Link>
            <Link href="/wishlist" className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Wishlist</Link>
            <Link href="/cart" className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cart</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
