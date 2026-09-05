"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight text-slate-900">
            Circuit Bazaar
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/products" className="hover:text-slate-900">Products</Link>
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
