"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Product, Category, CategorySpecField, BackendProduct } from "@/types";
import { ProductCard } from "@/components/shared/ProductCard";
import { apiClient } from "@/lib/api";
import { mapBackendProduct } from "@/lib/productMapper";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [specSchema, setSpecSchema] = useState<CategorySpecField[]>([]);
  const [specValues, setSpecValues] = useState<Record<string, string>>({});

  const search = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category") || "";

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [categoriesData, productsData] = await Promise.all([
          apiClient<{ categories: Category[] }>("/categories"),
          apiClient<{ data: BackendProduct[] }>("/products"),
        ]);

        if (cancelled) return;

        setCategories(categoriesData.categories || []);
        const mapped = (productsData.data || []).map(mapBackendProduct);
        setProducts(mapped);

        if (categoryParam) {
          const cat = categoriesData.categories.find((c) => String(c.id) === categoryParam);
          setSpecSchema(cat?.spec_schema || []);
        } else {
          setSpecSchema([]);
        }
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [categoryParam]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !categoryParam || p.category === categories.find((c) => String(c.id) === categoryParam)?.name;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryParam, categories]);

  const updateSpec = (key: string, value: string) => {
    setSpecValues((prev) => {
      const next = { ...prev };
      if (value === "" || value === "__empty__") {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
  };

  const buildProductUrl = (params: Record<string, string>) => {
    const url = new URL("/products", typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || "http://localhost");
    url.searchParams.set("search", search);
    if (categoryParam) url.searchParams.set("category", categoryParam);
    for (const [key, value] of Object.entries(params)) {
      if (value) url.searchParams.set(`spec[${key}]`, value);
    }
    return url.pathname + url.search;
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Products</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search products..."
                defaultValue={search}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-red-500"
                onChange={(e) => {
                  const url = new URL("/products", typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || "http://localhost");
                  url.searchParams.set("search", e.target.value);
                  if (categoryParam) url.searchParams.set("category", categoryParam);
                  window.location.href = url.pathname + url.search;
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Category</label>
              <select
                value={categoryParam}
                onChange={(e) => {
                  const url = new URL("/products", typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || "http://localhost");
                  if (e.target.value) url.searchParams.set("category", e.target.value);
                  url.searchParams.set("search", search);
                  window.location.href = url.pathname + url.search;
                }}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-red-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
                ))}
              </select>
            </div>

            {specSchema.length > 0 && (
              <div>
                <p className="block text-sm font-semibold text-slate-900 mb-2">Specifications</p>
                <div className="space-y-3">
                  {specSchema.map((field) => (
                    <SpecFilter
                      key={field.key}
                      field={field}
                      value={specValues[field.key] || ""}
                      onChange={(value) => updateSpec(field.key, value)}
                    />
                  ))}
                </div>
                <button
                  onClick={() => {
                    setSpecValues({});
                    window.location.href = buildProductUrl({});
                  }}
                  className="mt-3 text-xs text-red-700 hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </aside>

          <div className="flex-1">
            {loading ? (
              <p className="text-sm text-slate-500">Loading products...</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-slate-500">No products found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

interface SpecFilterProps {
  field: CategorySpecField;
  value: string;
  onChange: (value: string) => void;
}

function SpecFilter({ field, value, onChange }: SpecFilterProps) {
  if (field.type === "select" && field.options) {
    return (
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">{field.label}</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:border-red-500"
        >
          <option value="">Any</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "number") {
    return (
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">{field.label}</label>
        <input
          type="number"
          placeholder={field.unit ? `(${field.unit})` : "Any"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:border-red-500"
        />
      </div>
    );
  }

  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">{field.label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:border-red-500"
      />
    </div>
  );
}
