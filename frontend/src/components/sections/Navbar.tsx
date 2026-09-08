"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const SHOP_URL = process.env.NEXT_PUBLIC_SHOP_URL || 'http://localhost:3003';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) => pathname === href;

  const navLinks = [
    { href: SHOP_URL, label: "Shop", external: true },
    { href: "/blogs", label: "Blogs" },
    { href: "/career", label: "Career" },
    { href: "/vendor", label: "Vendor" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-slate-900/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/10"
          : "bg-slate-900/40 backdrop-blur-lg"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-700 shadow-lg shadow-red-500/25 group-hover:shadow-red-500/40 transition-all duration-300">
              <span className="material-symbols-outlined text-white text-[22px]">
                hardware
              </span>
            </div>
            <div className="leading-tight">
              <span className="block text-xl font-bold tracking-tight text-white">
                Circuit Bazaar
              </span>
              <span className="block text-[10px] font-mono font-bold tracking-widest text-red-400">
                NEPAL HARDWARE HUB
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200 group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-0 bg-gradient-to-r from-red-500 to-red-400 rounded-full group-hover:w-3/4 transition-all duration-300" />
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors duration-200 group ${
                    isActive(link.href) ? "text-white" : "text-slate-300 hover:text-white"
                  }`}
                >
                  {link.label}
                  <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-300 ${
                    isActive(link.href) ? "w-3/4" : "w-0 group-hover:w-3/4"
                  }`} />
                </Link>
              )
            ))}

            {isAuthenticated && user ? (
              <div className="relative ml-2">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/10 transition-all duration-200"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-red-700 text-xs font-bold text-white">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                  <span className="max-w-[100px] truncate">{user.name}</span>
                  <span className="material-symbols-outlined text-[16px] text-slate-400 transition-transform duration-200">
                    {userMenuOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-3 w-52 rounded-2xl bg-slate-800/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/20 py-2 animate-fade-in-down">
                    <div className="px-4 py-2 border-b border-white/5">
                      <p className="text-sm font-semibold text-white">{user.name}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                    <a
                      href={`${SHOP_URL}/account`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">account_circle</span>
                      My Account
                    </a>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="ml-4 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-900/25 hover:shadow-red-900/40 hover:from-red-500 hover:to-red-600 transition-all duration-300"
              >
                Sign In
              </Link>
            )}
          </nav>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-300 hover:text-white hover:bg-white/10 transition-all"
          >
            <span className="material-symbols-outlined text-[22px]">
              {mobileOpen ? "close" : "menu"}
            </span>
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-6 pt-2 animate-fade-in-down">
            <div className="rounded-2xl bg-slate-800/95 backdrop-blur-xl border border-white/10 p-3 space-y-1 shadow-2xl shadow-black/20">
              {navLinks.map((link) => (
                link.external ? (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    {link.label}
                    <span className="material-symbols-outlined text-[18px] ml-auto">open_in_new</span>
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      isActive(link.href) ? "text-white bg-white/5" : "text-slate-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                    {isActive(link.href) && (
                      <span className="material-symbols-outlined text-[18px] ml-auto text-red-400">check</span>
                    )}
                  </Link>
                )
              ))}

              <div className="pt-3 mt-2 border-t border-white/10">
                {isAuthenticated && user ? (
                  <>
                    <a
                      href={`${SHOP_URL}/account`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      My Account
                    </a>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-3 w-full text-left rounded-xl px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-4 py-3 text-sm font-semibold text-white"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
