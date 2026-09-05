"use client";

import Link from "next/link";

export default function AccountPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">My Account</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Orders", desc: "Track, return, or buy again", href: "/account/orders" },
            { title: "Addresses", desc: "Edit or add addresses", href: "/account/addresses" },
            { title: "Password", desc: "Change your password", href: "/account/password" },
            { title: "Wishlist", desc: "Browse saved items", href: "/wishlist" },
          ].map((item) => (
            <Link key={item.title} href={item.href} className="rounded-xl border border-slate-200 p-6 hover:border-red-200 hover:shadow-sm transition-all">
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
