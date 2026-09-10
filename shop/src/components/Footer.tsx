"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCategories, type Category } from "@/lib/api";

const HOME_URL = process.env.NEXT_PUBLIC_HOME_URL || "http://localhost:3000";

const companyLinks = [
  { name: "About", href: `${HOME_URL}/` },
  { name: "Blog", href: `${HOME_URL}/blogs` },
  { name: "Careers", href: `${HOME_URL}/career` },
  { name: "Become a Vendor", href: `${HOME_URL}/vendor` },
];

const supportLinks = [
  { name: "My Account", href: "/account" },
  { name: "My Orders", href: "/orders" },
  { name: "Wishlist", href: "/wishlist" },
  { name: "Cart", href: "/cart" },
  { name: "Settings", href: "/settings" },
];

const payments = ["eSewa", "Khalti", "Stripe", "Cash on Delivery"];

export default function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories()
      .then((res) => setCategories((res.categories ?? []).slice(0, 5)))
      .catch(() => {});
  }, []);

  return (
    <footer className="mt-auto bg-slate-900 pt-14 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
                <span className="material-symbols-outlined text-[20px] text-red-600">hardware</span>
              </span>
              <span className="leading-tight">
                <span className="block text-lg font-bold tracking-tight text-white">Circuit Bazaar</span>
                <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-red-400">Nepal hardware hub</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              Nepal&apos;s specification-first hardware marketplace. Verified vendors, transparent specs, local warranty.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {payments.map((p) => (
                <span key={p} className="rounded-md border border-slate-700 px-2.5 py-1 text-[11px] font-medium text-slate-300">
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Shop</h3>
            <ul className="mt-4 space-y-2.5">
              {categories.length === 0 ? (
                <li className="text-sm text-slate-500">Browse from the category bar above.</li>
              ) : (
                categories.map((cat) => (
                  <li key={cat.id}>
                    <Link href={`/category/${cat.slug}`} className="text-sm text-slate-400 transition-colors hover:text-white">
                      {cat.name}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Company</h3>
            <ul className="mt-4 space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-slate-400 transition-colors hover:text-white">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
            <h3 className="mt-6 text-sm font-semibold text-white">Support</h3>
            <ul className="mt-4 space-y-2.5">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-slate-400 transition-colors hover:text-white">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-800 pt-6 sm:flex-row">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Circuit Bazaar. All rights reserved.
          </p>
          <p className="text-xs text-slate-500">
            Support: <a href="mailto:support@circuitbazaar.com" className="hover:text-slate-300">support@circuitbazaar.com</a> · Kathmandu, Nepal
          </p>
        </div>
      </div>
    </footer>
  );
}
