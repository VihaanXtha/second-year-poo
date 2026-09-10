"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, LogOut, Package, Settings, UserCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const menuLinks = [
  { href: "/account", label: "My Account", Icon: UserCircle },
  { href: "/orders", label: "Orders", Icon: Package },
  { href: "/wishlist", label: "Wishlist", Icon: Heart },
  { href: "/settings", label: "Settings", Icon: Settings },
];

export default function UserMenu() {
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen((prev) => (prev ? false : prev));
  }, [pathname]); // close menu on route change

  if (!isAuthenticated || !user) {
    return (
      <Link
        href="/login"
        className="ml-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
      >
        Sign In
      </Link>
    );
  }

  return (
    <div className="relative ml-1.5">
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
      <button
        onClick={() => setOpen(!open)}
        className="relative z-50 flex items-center gap-2 rounded-lg border border-slate-200 py-1.5 pl-1.5 pr-2.5 hover:bg-slate-50"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-red-500 to-red-700 text-xs font-bold text-white">
          {user.name?.charAt(0).toUpperCase()}
        </span>
        <span className="hidden max-w-[110px] truncate text-sm font-medium text-slate-700 sm:block">
          {user.name}
        </span>
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-slate-100 bg-white py-2 shadow-xl animate-fade-in-down">
          <div className="border-b border-slate-100 px-4 py-2">
            <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
          {menuLinks.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            >
              <Icon size={16} className="text-slate-400" />
              {label}
            </Link>
          ))}
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-2.5 border-t border-slate-100 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}
