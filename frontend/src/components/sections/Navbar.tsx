"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900">
              <span className="material-symbols-outlined text-red-500 text-[20px]">
                hardware
              </span>
            </div>
            <div className="leading-tight">
              <span className="block text-lg font-bold tracking-tight text-slate-900">
                Circuit Bazaar
              </span>
              <span className="block text-[10px] font-mono font-bold uppercase tracking-widest text-red-600">
                Nepal Hardware Hub
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className={isActive("/") ? "text-red-700" : "text-slate-600 hover:text-slate-900"}>
              Home
            </Link>
            <Link href="/shop" className={isActive("/shop") ? "text-red-700" : "text-slate-600 hover:text-slate-900"}>
              Shop
            </Link>
            <Link href="/blogs" className={isActive("/blogs") ? "text-red-700" : "text-slate-600 hover:text-slate-900"}>
              Blogs
            </Link>
            <Link href="/career" className={isActive("/career") ? "text-red-700" : "text-slate-600 hover:text-slate-900"}>
              Career
            </Link>
            <Link href="/vendor" className={isActive("/vendor") ? "text-red-700" : "text-slate-600 hover:text-slate-900"}>
              Become a Vendor
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              Sign In
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden rounded-lg border border-slate-200 p-2"
          >
            <span className="material-symbols-outlined text-slate-700">
              {mobileOpen ? "close" : "menu"}
            </span>
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/" className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Home</Link>
            <Link href="/shop" className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Shop</Link>
            <Link href="/blogs" className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Blogs</Link>
            <Link href="/career" className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Career</Link>
            <Link href="/vendor" className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Become a Vendor</Link>
            <Link href="/login" className="block rounded-lg px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50">Sign In</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
