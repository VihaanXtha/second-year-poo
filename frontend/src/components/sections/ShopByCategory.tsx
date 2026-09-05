"use client";

import { CategoryType } from "@/types";
import Link from "next/link";

const categories: { name: CategoryType; count: number; icon: string }[] = [
  { name: "PC Components", count: 24, icon: "memory" },
  { name: "IoT Gear", count: 18, icon: "developer_board" },
  { name: "Laptops", count: 12, icon: "laptop_mac" },
  { name: "Networking", count: 9, icon: "router" },
];

export default function ShopByCategory() {
  return (
    <section id="shop" className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Shop by Category
          </h2>
          <p className="mt-2 text-slate-600">
            From GPUs to LoRa modules — find exactly what your project needs.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href="#"
              className="group relative overflow-hidden rounded-2xl bg-white p-6 ring-1 ring-slate-200 hover:ring-slate-300 transition-all"
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
                {cat.count} verified products
              </p>
              <span className="mt-4 inline-flex items-center text-sm font-semibold text-red-600">
                Browse category
                <span className="material-symbols-outlined ml-1 text-[18px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
