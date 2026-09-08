"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { API_ENDPOINTS, fetchData } from "@/utils/api";

export default function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = (searchParams?.q || "").trim();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    const run = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("search", query);
        const data = await fetchData(`${API_ENDPOINTS.PRODUCTS}?${params.toString()}`);
        setResults(Array.isArray(data?.data) ? data.data : []);
      } catch (e) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [query]);

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Search</h1>
        <p className="text-slate-600 mb-8">
          {query ? `Results for "${query}"` : "Enter a search term to find products."}
        </p>
        {loading && <p className="text-slate-600">Searching...</p>}
        {!loading && results.length === 0 && query && (
          <p className="text-slate-600">No products found.</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {results.map((product) => (
            <div key={product.id} onClick={() => router.push(`/products/${product.slug}`)} className="rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow bg-white cursor-pointer">
              <div className="h-48 bg-slate-100" />
              <div className="p-4">
                <p className="text-xs text-slate-500 mb-1">{product.category?.name}</p>
                <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">{product.name}</h3>
                <p className="text-sm font-bold text-slate-900 mt-2">NPR {Number(product.price).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
