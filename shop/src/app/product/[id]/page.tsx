"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ComingSoon from "@/components/ComingSoon";
import { apiClient, formatPrice, type Product } from "@/lib/api";

interface ProductDetailData extends Product {
  description?: string;
  category?: { name: string; slug: string };
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  return <ProductDetail params={params} />;
}

function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductDetailData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    params.then((p) => setId(p.id)).catch(() => setError(true));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    apiClient<{ product: ProductDetailData }>(`/products/${id}`)
      .then((res) => setProduct(res.product))
      .catch(() => setError(true));
  }, [id]);

  if (error) return <ComingSoon title="Product" kicker="Product details" note="This product could not be loaded." />;
  if (!product) return <div className="flex-1 bg-slate-50" />;

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          {product.image ? (
            <img src={product.image} alt={product.name} className="aspect-square w-full object-contain p-6" />
          ) : (
            <div className="flex aspect-square items-center justify-center text-sm text-slate-400">No image</div>
          )}
        </div>
        <div>
          {product.sku && <p className="font-mono text-xs text-slate-400">{product.sku}</p>}
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{product.name}</h1>
          <p className="mt-3 font-mono text-2xl font-bold text-red-600">{formatPrice(product.price)}</p>
          <p className="mt-2 text-sm text-slate-500">{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</p>
          {product.description && <p className="mt-4 text-sm leading-relaxed text-slate-600">{product.description}</p>}
          {product.category && (
            <p className="mt-4 text-sm text-slate-500">
              Category: <Link href={`/category/${product.category.slug}`} className="font-medium text-red-600 hover:underline">{product.category.name}</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}