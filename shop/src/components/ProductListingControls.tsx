"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export type ProductSort = "relevance" | "newest" | "popular" | "price_asc" | "price_desc";

export interface ProductListingControlsProps {
  query: string;
  total: number;
  sort: ProductSort;
  priceRange: { min?: number | null; max?: number | null };
  page: number;
  lastPage: number;
  onSortChange: (sort: ProductSort) => void;
  onPriceRangeChange: (priceRange: { min?: number | null; max?: number | null }) => void;
  onPageChange: (page: number) => void;
  loading: boolean;
}

export default function ProductListingControls({
  query,
  total,
  sort,
  priceRange,
  page,
  lastPage,
  onSortChange,
  onPriceRangeChange,
  onPageChange,
  loading,
}: ProductListingControlsProps) {
  const [minInput, setMinInput] = useState("");
  const [maxInput, setMaxInput] = useState("");

  function applyPriceFilter() {
    const min = minInput.trim() === "" ? null : Number(minInput);
    const max = maxInput.trim() === "" ? null : Number(maxInput);
    setMinInput("");
    setMaxInput("");
    onPriceRangeChange({
      min: min !== null && Number.isFinite(min) ? min : null,
      max: max !== null && Number.isFinite(max) ? max : null,
    });
  }

  function clearPriceFilter() {
    setMinInput("");
    setMaxInput("");
    onPriceRangeChange({ min: null, max: null });
  }

  const hasPrice = priceRange.min != null || priceRange.max != null;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* Heading row */}
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {query ? `Results for “${query}”` : "Search results"}
          </h1>
          {query && (
            <p className="mt-1 text-sm text-slate-500">
              {total > 0 ? `${total} product${total !== 1 ? "s" : ""}` : "No products match this query"}
            </p>
          )}
        </div>
        <div className="text-sm text-slate-500">
          Page {page} of {lastPage}
        </div>
      </div>

      {/* Filter / sort bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as ProductSort)}
          className="h-10 min-w-[170px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-red-500 focus:outline-none"
          disabled={loading}
        >
          <option value="relevance">Relevance</option>
          <option value="newest">Newest first</option>
          <option value="popular">Most popular</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>

        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
          <label htmlFor="min-price" className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-slate-500">
            Min
          </label>
          <input
            id="min-price"
            type="number"
            min={0}
            value={minInput}
            onChange={(e) => setMinInput(e.target.value)}
            placeholder="Rs."
            className="h-8 w-24 rounded-md border border-slate-200 bg-white px-2 text-sm focus:border-red-500 focus:outline-none"
          />
          <span className="text-slate-300">-</span>
          <label htmlFor="max-price" className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-slate-500">
            Max
          </label>
          <input
            id="max-price"
            type="number"
            min={0}
            value={maxInput}
            onChange={(e) => setMaxInput(e.target.value)}
            placeholder="Rs."
            className="h-8 w-24 rounded-md border border-slate-200 bg-white px-2 text-sm focus:border-red-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={applyPriceFilter}
            disabled={loading}
            className="h-8 rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:opacity-40"
          >
            Apply
          </button>
          {hasPrice && (
            <button
              type="button"
              onClick={clearPriceFilter}
              className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-red-300 hover:text-red-600"
            >
              Clear price
            </button>
          )}
        </div>

        {query && (
          <span className="ml-auto rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
            {total} result{total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-slate-50 px-4 py-10 text-sm text-slate-500">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
          <span className="font-medium">Searching products…</span>
        </div>
      )}

      {/* Pagination */}
      {!loading && lastPage > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <ChevronLeft size={18} />
          </button>

          {Array.from({ length: lastPage }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === lastPage || Math.abs(p - page) <= 1)
            .reduce<(number | "...")[]>((acc, p, i, arr) => {
              if (i > 0 && p - (arr[i - 1] as number) > 1) {
                acc.push("...");
              }
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="h-10 w-10 items-center justify-center text-sm text-slate-400">
                  ...
                </span>
              ) : (
                <button
                  type="button"
                  key={p}
                  onClick={() => onPageChange(p as number)}
                  className={`h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold transition-colors ${
                    p === page
                      ? "bg-red-600 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                  }`}
                  aria-label={`Page ${p}`}
                  aria-current={p === page ? "page" : undefined}
                >
                  {p}
                </button>
              )
            )}

          <button
            type="button"
            onClick={() => onPageChange(Math.min(lastPage, page + 1))}
            disabled={page >= lastPage}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}