"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { getCategories, type Category } from "@/lib/api";

export default function CategoryBar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.categories ?? []))
      .catch(() => {
        // API unreachable — bar degrades to empty; pages still render
      });
  }, []);

  // Close any open menu on navigation
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setActiveSlug(null);
    setMobileOpen(false);
  }

  const active = categories.find((c) => c.slug === activeSlug) ?? null;

  return (
    <div>
      {/* Desktop — category bar with mega menus */}
      <div className="relative hidden border-b border-slate-100 bg-slate-50 md:block" onMouseLeave={() => setActiveSlug(null)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1 overflow-x-auto">
          {categories.map((cat) => (
            <div key={cat.id} className="relative">
              {activeSlug === cat.slug && <div className="fixed inset-0 z-40" onClick={() => setActiveSlug(null)} />}
              <button
                onMouseEnter={() => setActiveSlug(cat.slug)}
                onClick={() => setActiveSlug(activeSlug === cat.slug ? null : cat.slug)}
                className={`relative z-50 flex items-center gap-1 whitespace-nowrap px-3 py-2.5 text-sm font-medium transition-colors ${
                  activeSlug === cat.slug ? "text-red-600" : "text-slate-700 hover:text-red-600"
                }`}
              >
                {cat.name}
                <ChevronDown size={14} className={`transition-transform ${activeSlug === cat.slug ? "rotate-180" : ""}`} />
              </button>

              {/* Mega menu: subcategories as columns, super-subcategories nested */}
              {activeSlug === cat.slug && (
                <div className="absolute left-0 top-full z-50 animate-fade-in-down">
                  <div className="w-screen max-w-5xl rounded-b-xl border border-t-0 border-slate-100 bg-white p-6 shadow-xl">
                    {(!cat.sub_categories || cat.sub_categories.length === 0) ? (
                      <div className="py-2">
                        <Link
                          href={`/category/${cat.slug}`}
                          className="text-sm font-semibold text-red-600 hover:underline"
                          onClick={() => setActiveSlug(null)}
                        >
                          Shop all {cat.name} →
                        </Link>
                        <p className="mt-2 text-xs text-slate-400">No subcategories yet.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                        {cat.sub_categories.map((sub) => (
                          <div key={sub.id} className="min-w-0">
                            <Link
                              href={`/subcategory/${sub.slug}`}
                              onClick={() => setActiveSlug(null)}
                              className="block truncate text-sm font-semibold text-slate-900 hover:text-red-600"
                            >
                              {sub.name}
                            </Link>
                            <ul className="mt-2.5 space-y-1.5">
                              {(sub.super_sub_categories ?? []).map((ssa) => (
                                <li key={ssa.id}>
                                  <Link
                                    href={`/super-subcategory/${ssa.slug}`}
                                    onClick={() => setActiveSlug(null)}
                                    className="block truncate text-[13px] text-slate-500 hover:text-red-600"
                                  >
                                    {ssa.name}
                                  </Link>
                                </li>
                              ))}
                              {(sub.super_sub_categories ?? []).length === 0 && (
                                <li className="text-[12px] text-slate-300">—</li>
                              )}
                            </ul>
                          </div>
                        ))}
                        <div className="border-l border-slate-100 pl-6">
                          <Link
                            href={`/category/${cat.slug}`}
                            onClick={() => setActiveSlug(null)}
                            className="text-sm font-semibold text-red-600 hover:underline"
                          >
                            Shop all {cat.name} →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {categories.length === 0 && (
            <span className="px-3 py-2.5 text-sm text-slate-400">Loading categories…</span>
          )}
        </nav>
      </div>
      </div>

      {/* Mobile — simple category list (all real routes) */}
      <div className="border-b border-slate-100 bg-slate-50 md:hidden">
        {mobileOpen && (
          <nav className="max-h-72 overflow-y-auto px-4 py-2 animate-fade-in-down">
            {categories.map((cat) => (
              <div key={cat.id} className="py-1">
                <Link href={`/category/${cat.slug}`} className="block py-1 text-sm font-semibold text-slate-800">
                  {cat.name}
                </Link>
                {(cat.sub_categories ?? []).map((sub) => (
                  <Link key={sub.id} href={`/subcategory/${sub.slug}`} className="block py-0.5 pl-3 text-[13px] text-slate-500">
                    {sub.name}
                  </Link>
                ))}
              </div>
            ))}
            {categories.length === 0 && <span className="py-2 text-sm text-slate-400">Loading categories…</span>}
          </nav>
        )}
        {!mobileOpen && (
          <nav className="flex items-center gap-1 overflow-x-auto px-4">
            <button onClick={() => setMobileOpen(true)} className="flex items-center gap-1 whitespace-nowrap py-2 pr-2 text-[13px] font-bold text-red-600">
              All Categories
              <ChevronDown size={14} />
            </button>
            {categories.slice(0, 6).map((cat) => (
              <Link key={cat.id} href={`/category/${cat.slug}`} className="whitespace-nowrap px-2 py-2 text-[13px] font-medium text-slate-700">
                {cat.name}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
