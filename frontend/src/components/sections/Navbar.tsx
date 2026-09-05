"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const SHOP_URL = process.env.NEXT_PUBLIC_SHOP_URL || 'https://shop.localhost';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 shadow-sm">
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
            <a
              href={SHOP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-slate-900"
            >
              Shop
            </a>
            <Link href="/blogs" className={isActive("/blogs") ? "text-red-700" : "text-slate-600 hover:text-slate-900"}>
              Blogs
            </Link>
            <Link href="/career" className={isActive("/career") ? "text-red-700" : "text-slate-600 hover:text-slate-900"}>
              Career
            </Link>
            <Link href="/vendor" className={isActive("/vendor") ? "text-red-700" : "text-slate-600 hover:text-slate-900"}>
              Vendor
            </Link>

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                  <span className="max-w-[120px] truncate">{user.name}</span>
                  <span className="material-symbols-outlined text-[16px] text-slate-500">
                    {userMenuOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-slate-200 shadow-lg py-1">
                    <a
                      href={`${SHOP_URL}/account`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      My Account
                    </a>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                Sign In
              </Link>
            )}
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
            <a
              href={SHOP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Shop
            </a>
            <Link href="/blogs" className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Blogs</Link>
            <Link href="/career" className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Career</Link>
            <Link href="/vendor" className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Vendor</Link>

            {isAuthenticated && user ? (
              <>
                <a
                  href={`${SHOP_URL}/account`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  My Account
                </a>
                <button
                  onClick={() => logout()}
                  className="block w-full text-left rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Log Out
                </button>
              </>
            ) : (
              <Link href="/login" className="block rounded-lg px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50">Sign In</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
