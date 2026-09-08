"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";
import { getCategories } from "@/lib/api";

type CategoryLink = {
  name: string;
  count: number;
  icon: string;
  href: string;
};

const iconMap: Record<string, string> = {
  "pc-components": "memory",
  "iot-gear": "developer_board",
  laptops: "laptop_mac",
  networking: "router",
  "cables-connectors": "cable",
  "tools-equipment": "handyman",
  "power-supplies": "power",
  storage: "sd_card",
};

export default function ShopByCategory() {
  const [categories, setCategories] = useState<CategoryLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getCategories()
      .then((data) => {
        if (!cancelled) {
          const mapped = (data.categories || [])
            .filter((c) => c.is_active)
            .map((c) => ({
              name: c.name,
              count: 0,
              icon: iconMap[c.slug] || "category",
              href: `/shop?category=${c.slug}`,
            }));
          setCategories(mapped);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <section id="shop" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Shop by Category</h2>
            <p className="mt-2 text-slate-600">From GPUs to LoRa modules — find exactly what your project needs.</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl bg-white p-6 ring-1 ring-slate-200 h-32 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="shop" className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Shop by Category
            </h2>
            <p className="mt-2 text-slate-600">
              From GPUs to LoRa modules — find exactly what your project needs.
            </p>
          </div>
        </ScrollReveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat, i) => (
            <ScrollReveal key={cat.name} direction="up" delay={i * 80}>
              <Link
                href={cat.href}
                className="group relative overflow-hidden rounded-2xl bg-white p-6 ring-1 ring-slate-200 hover:ring-red-200 card-hover-lift transition-all"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[24px]">
                    {cat.icon}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  {cat.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {cat.count > 0 ? `${cat.count} verified products` : "Browse category"}
                </p>
                <span className="mt-4 inline-flex items-center text-sm font-semibold text-red-600">
                  Browse category
                  <span className="material-symbols-outlined ml-1 text-[18px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </span>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
