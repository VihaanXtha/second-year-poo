"use client";

import { PRODUCTS } from "@/data/hardwareData";
import Link from "next/link";
import { useState, useRef } from "react";

function ProductCard({ product }: { product: (typeof PRODUCTS)[0] }) {
  return (
    <div className="min-w-[280px] sm:min-w-[300px] snap-start rounded-2xl bg-white ring-1 ring-slate-200 overflow-hidden hover:ring-slate-300 transition-shadow">
      <div className="relative aspect-[4/3] bg-slate-100">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
        />
        <span className="absolute top-3 left-3 rounded-lg bg-white/90 px-2 py-1 text-xs font-mono font-bold text-slate-900 backdrop-blur-sm">
          {product.sku}
        </span>
      </div>
      <div className="p-5">
        <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">
          {product.category}
        </span>
        <h3 className="mt-3 text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
          {product.name}
        </h3>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <span className="block text-xs text-slate-500">Verified Price</span>
            <span className="block text-lg font-bold text-slate-900">
              Rs. {product.priceNpr.toLocaleString("en-IN")}
            </span>
          </div>
          <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded">
            {product.warranty}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function FeaturedProducts() {
  const featured = PRODUCTS.slice(0, 6);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const scroll = (direction: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * 320, behavior: "smooth" });
    setTimeout(checkScroll, 350);
  };

  return (
    <section id="featured" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Featured Hardware
            </h2>
            <p className="mt-2 text-slate-600">
              Hand-picked components trusted by Nepal&apos;s builders this week.
            </p>
          </div>
          <Link
            href="/shop"
            className="hidden sm:inline-flex items-center text-sm font-semibold text-red-600 hover:text-red-700"
          >
            View all products
            <span className="material-symbols-outlined ml-1 text-[18px]">
              arrow_forward
            </span>
          </Link>
        </div>
        <div className="mt-10 relative">
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scroll(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-slate-200 text-slate-700 hover:bg-slate-50"
              aria-label="Scroll products left"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
          )}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scroll(1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-slate-200 text-slate-700 hover:bg-slate-50"
              aria-label="Scroll products right"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          )}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="-mx-4 px-4 overflow-x-auto pb-4 no-scrollbar"
          >
            <div className="flex gap-6">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 sm:hidden text-center">
          <Link
            href="/shop"
            className="inline-flex items-center text-sm font-semibold text-red-600 hover:text-red-700"
          >
            View all products
            <span className="material-symbols-outlined ml-1 text-[18px]">
              arrow_forward
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
