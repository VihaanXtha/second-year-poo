"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Package, Search, XCircle } from "lucide-react";
import { searchProducts, type Product } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import ProductListingControls, { type ProductSort } from "@/components/ProductListingControls";

// Inner component that owns all query-dependent state. Mounted with `key={q}` so
// a new search query remounts it with fresh initial state (page 1, default sort).
function SearchResults({ q }: { q: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(q.length > 0);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState<ProductSort>("relevance");
  const [priceRange, setPriceRange] = useState<{ min?: number | null; max?: number | null }>({});
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch on mount and whenever query/sort/price/page change.
  useEffect(() => {
    if (!q) return;

    let cancelled = false;

    searchProducts(q, {
      page,
      sort: sort === "relevance" ? undefined : sort,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
    })
      .then((res) => {
        if (cancelled) return;
        setProducts(res.data ?? []);
        setLastPage(res.last_page ?? 1);
        setTotal(res.total ?? 0);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load products");
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [q, page, sort, priceRange.min, priceRange.max, refreshKey]);

  const handleSortChange = (next: ProductSort) => {
    setSort(next);
    setPage(1);
    setLoading(true);
    setError("");
  };

  const handlePriceRangeChange = (range: { min?: number | null; max?: number | null }) => {
    setPriceRange(range);
    setPage(1);
    setLoading(true);
    setError("");
  };

  const handlePageChange = (next: number) => {
    setPage(next);
    setLoading(true);
    setError("");
  };

  const handleRetry = () => {
    setLoading(true);
    setError("");
    setRefreshKey((k) => k + 1);
  };

  // ---- No query yet -------------------------------------------------------
  if (!q) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 px-4 py-24 text-center">
        <Search className="text-5xl text-slate-300" />
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">Search products</h1>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Type a keyword above to search the shop by name, brand, or SKU.
        </p>
      </div>
    );
  }

  // ---- Loading (first load only; refetches keep the previous list visible) --
  if (loading && products.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
      </div>
    );
  }

  // ---- Error state -------------------------------------------------------
  if (error && products.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 px-4 py-24 text-center">
        <XCircle className="text-5xl text-red-300" />
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">Couldn&apos;t search products</h1>
        <p className="mt-2 max-w-sm text-sm text-slate-500">{error}</p>
        <button
          onClick={handleRetry}
          className="mt-6 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    );
  }

  // ---- Empty state -------------------------------------------------------
  const hasFilters = sort !== "relevance" || priceRange.min != null || priceRange.max != null;

  if (!loading && products.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8">
        <ProductListingControls
          query={q}
          total={total}
          sort={sort}
          priceRange={priceRange}
          page={page}
          lastPage={lastPage}
          onSortChange={handleSortChange}
          onPriceRangeChange={handlePriceRangeChange}
          onPageChange={handlePageChange}
          loading={loading}
        />
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
          <Package className="text-5xl text-slate-300" />
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">No results for “{q}”</h1>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
            {hasFilters
              ? "No products match this query with the current filters. Try adjusting your filters or searching for something else."
              : "Try a different keyword, or check your spelling."}
          </p>
          {hasFilters ? (
            <button
              onClick={() => {
                setSort("relevance");
                setPriceRange({ min: null, max: null });
                setPage(1);
                setLoading(true);
                setError("");
              }}
              className="mt-6 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Clear filters
            </button>
          ) : (
            <Link
              href="/"
              className="mt-6 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Back to Home
            </Link>
          )}
        </div>
      </div>
    );
  }
// ---- Results -----------------------------------------------------------
  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <ProductListingControls
        query={q}
        total={total}
        sort={sort}
        priceRange={priceRange}
        page={page}
        lastPage={lastPage}
        onSortChange={handleSortChange}
        onPriceRangeChange={handlePriceRangeChange}
        onPageChange={handlePageChange}
        loading={loading}
      />

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

function SearchContent() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  return <SearchResults key={q} q={q} />;
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center bg-slate-50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}