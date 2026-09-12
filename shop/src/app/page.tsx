"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getAdvertisements,
  getBestSellingProducts,
  getCategories,
  getFeaturedProducts,
  getProducts,
  getSliders,
  type Advertisement,
  type Category,
  type Product,
  type Slider,
} from "@/lib/api";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";

const HERO_INTERVAL_MS = 2500;

function useCarousel(length: number, intervalMs: number, paused: boolean) {
  const [index, setIndex] = useState(0);
  const safeLength = Math.max(length, 1);
  const [prevLength, setPrevLength] = useState(length);
  if (prevLength !== length) {
    setPrevLength(length);
    setIndex(0);
  }
  const go = (next: number) => setIndex(((next % safeLength) + safeLength) % safeLength);
  useEffect(() => {
    if (paused || length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % length), intervalMs);
    return () => clearInterval(t);
  }, [length, intervalMs, paused]);
  return { index, go, next: () => go(index + 1), prev: () => go(index - 1) };
}

function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-5">
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-red-600">{kicker}</p>
      <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
    </div>
  );
}

function HeroSlider({ sliders }: { sliders: Slider[] }) {
  const [paused, setPaused] = useState(false);
  const { index, go, next, prev } = useCarousel(sliders.length, HERO_INTERVAL_MS, paused);
  if (sliders.length === 0) return null;
  const slide = sliders[index];
  return (
    <section
      aria-label="Featured promotions"
      className="relative w-full overflow-hidden bg-slate-900"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-64 sm:h-80 lg:h-96">
        {sliders.map((s, i) => (
          <div key={s.id} className={`absolute inset-0 transition-opacity duration-500 ${i === index ? "opacity-100" : "pointer-events-none opacity-0"}`}>
            <div className="relative h-full w-full">
              <Image
                src={s.image_url}
                alt={s.title}
                fill
                sizes="100vw"
                priority={i === index}
                className="object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent" />
          </div>
        ))}
        <div className="absolute inset-0 mx-auto flex max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-8">
          <h1 className="max-w-xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">{slide.title}</h1>
          {slide.subtitle && <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-200 sm:text-base">{slide.subtitle}</p>}
          {slide.link_url && (
            <div className="mt-5">
              <Link href={slide.link_url} className="inline-block rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700">
                {slide.headline || "Shop Now"}
              </Link>
            </div>
          )}
        </div>
      </div>
      {sliders.length > 1 && (
        <>
          <button onClick={prev} aria-label="Previous slide" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60">
            <ChevronLeft size={20} />
          </button>
          <button onClick={next} aria-label="Next slide" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60">
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {sliders.map((s, i) => (
              <button key={s.id} onClick={() => go(i)} aria-label={`Go to slide ${i + 1}`} className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"}`} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function useAutoScrollHeight(ref: React.RefObject<HTMLDivElement | null>, items: React.Key[], intervalMs: number) {
  useEffect(() => {
    const el = ref.current;
    if (!el || items.length === 0) return;
    const t = setInterval(() => {
      if (document.hidden) return;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
      el.scrollTo({ left: atEnd ? 0 : el.scrollLeft + el.clientWidth * 0.6, behavior: "smooth" });
    }, intervalMs);
    return () => clearInterval(t);
  }, [items.length, intervalMs, ref]);
}

function CategoryRow({
  scrollRef,
  items,
}: {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  items: Category[];
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-5">
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-1 scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="flex shrink-0 flex-col items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-3 text-center transition hover:border-red-200 hover:bg-red-50"
          >
            <span className="material-symbols-outlined text-[26px] text-red-600">{cat.icon || "category"}</span>
            <span className="line-clamp-2 text-xs font-semibold text-slate-800">{cat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
function CategoryStrip({ categories }: { categories: Category[] }) {
  const rowARef = useRef<HTMLDivElement>(null);
  const rowBRef = useRef<HTMLDivElement>(null);

  // Two stacked auto-scrolling rows (first half / second half) so mobile
  // gets a proper two-row band instead of two columns in one row.
  const half = Math.max(1, Math.ceil(categories.length / 2));
  const rowA = categories.slice(0, half);
  const rowB = categories.slice(half);

  // Hooks must run unconditionally — do this before any early return.
  useAutoScrollHeight(rowARef, rowA.map((c) => c.id), HERO_INTERVAL_MS);
  useAutoScrollHeight(rowBRef, rowB.map((c) => c.id), HERO_INTERVAL_MS);

  if (categories.length === 0) return null;

  return (
    <section aria-label="Shop by category" className="border-b border-slate-100 bg-slate-50">
      {rowA.length > 0 && <CategoryRow scrollRef={rowARef} items={rowA} />}
      {rowB.length > 0 && <CategoryRow scrollRef={rowBRef} items={rowB} />}
    </section>
  );
}

function AdSlider({ ads }: { ads: Advertisement[] }) {
  const [paused, setPaused] = useState(false);
  const { index, go, next, prev } = useCarousel(ads.length, HERO_INTERVAL_MS, paused);
  if (ads.length === 0) return null;
  return (
    <section aria-label="Offers" className="bg-white">
      <div
        className="relative mx-auto max-w-4xl px-4 sm:px-6"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="relative h-44 overflow-hidden rounded-2xl sm:h-56">
          {ads.map((ad, i) => {
            const img = (
              <div className="relative h-full w-full">
                <Image
                  src={ad.image}
                  alt={ad.title || "Advertisement"}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            );
            const cls = `absolute inset-0 transition-opacity duration-500 ${i === index ? "opacity-100" : "pointer-events-none opacity-0"}`;
            if (!ad.link_url) return <div key={ad.id} className={cls}>{img}</div>;
            return ad.link_type === "external_url" ? (
              <a key={ad.id} href={ad.link_url} target="_blank" rel="noopener noreferrer" className={cls}>{img}</a>
            ) : (
              <Link key={ad.id} href={ad.link_url} className={cls}>{img}</Link>
            );
          })}
          {ads.length > 1 && (
            <>
              <button onClick={prev} aria-label="Previous ad" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white transition hover:bg-black/60">
                <ChevronLeft size={18} />
              </button>
              <button onClick={next} aria-label="Next ad" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white transition hover:bg-black/60">
                <ChevronRight size={18} />
              </button>
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {ads.map((ad, i) => (
                  <button key={ad.id} onClick={() => go(i)} aria-label={`Go to ad ${i + 1}`} className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"}`} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [best, setBest] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    getCategories().then((res) => setCategories(res.categories || [])).catch(() => setCategories([]));
    getSliders().then((res) => setSliders(res.sliders || [])).catch(() => setSliders([]));
    getAdvertisements().then((res) => setAds(res.advertisements || [])).catch(() => setAds([]));
    getFeaturedProducts().then((res) => setFeatured(res.data || [])).catch(() => setFeatured([]));
    getBestSellingProducts(12).then((res) => setBest(res.data || [])).catch(() => setBest([]));
  }, []);

  useEffect(() => {
    getProducts(page, 24)
      .then((res) => {
        setProducts(res.data || []);
        setLastPage(res.last_page || 1);
        setTotal(res.total || 0);
      })
      .catch(() => setProducts([]));
  }, [page]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <HeroSlider sliders={sliders} />
      <CategoryStrip categories={categories} />

      {featured.length > 0 && (
        <section aria-label="Featured products" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <SectionTitle kicker="Handpicked" title="Featured Products" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <div className="py-4">
        <AdSlider ads={ads} />
      </div>

      {best.length > 0 && (
        <section aria-label="Best selling products" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <SectionTitle kicker="Most loved" title="Best Selling Products" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {best.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <section aria-label="All products" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionTitle kicker="Browse everything" title={total > 0 ? `All Products (${total})` : "All Products"} />
        {products.length === 0 ? (
          <p className="text-sm text-slate-500">No products found.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
            {lastPage > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-red-300 hover:text-red-600 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-500">Page {page} of {lastPage}</span>
                <button
                  onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                  disabled={page >= lastPage}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-red-300 hover:text-red-600 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <Footer />
    </div>
  );
}

