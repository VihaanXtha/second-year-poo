"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingCart, Heart, Minus, Plus } from "lucide-react";
import ComingSoon from "@/components/ComingSoon";
import { apiClient, formatPrice, type Product } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

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
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();

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

  const wishlisted = has(product.id);

  async function handleAddToCart() {
    await addItem(product!, quantity);
    setJustAdded(true);
    setQuantity(1);
    setTimeout(() => setJustAdded(false), 1500);
  }

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

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-lg border border-slate-200">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="flex h-10 w-10 items-center justify-center text-slate-500 transition-colors hover:text-red-600"
              >
                <Minus size={16} />
              </button>
              <span className="flex h-10 w-12 items-center justify-center text-sm font-semibold text-slate-900">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                aria-label="Increase quantity"
                className="flex h-10 w-10 items-center justify-center text-slate-500 transition-colors hover:text-red-600"
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingCart size={16} />
              {justAdded ? "Added!" : "Add to Cart"}
            </button>

            <button
              onClick={() => toggle(product)}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              aria-pressed={wishlisted}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
                wishlisted
                  ? "border-red-200 bg-red-50 text-red-600"
                  : "border-slate-200 text-slate-500 hover:border-red-200 hover:text-red-600"
              }`}
            >
              <Heart size={16} fill={wishlisted ? "currentColor" : "none"} />
            </button>
          </div>

          {product.stock <= 0 && (
            <p className="mt-3 text-xs font-medium text-red-600">This product is currently out of stock.</p>
          )}
        </div>
      </div>
    </div>
  );
}