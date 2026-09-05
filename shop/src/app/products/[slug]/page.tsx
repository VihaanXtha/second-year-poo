"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { PRODUCTS } from "@/data/hardwareData";
import { formatNpr } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const product = PRODUCTS.find((p) => p.slug === slug);
  const { addItem, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Product not found</h1>
          <a href="/products" className="text-red-700 hover:underline">Back to products</a>
        </div>
      </main>
    );
  }

  const handleAdd = async () => {
    await addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    openCart();
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <img src={product.image} alt={product.name} className="w-full h-96 object-cover rounded-2xl bg-slate-100" />
          <div>
            <p className="text-sm text-slate-500 mb-2">{product.category} · {product.subCategory}</p>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">{product.name}</h1>
            <p className="text-2xl font-semibold text-slate-900 mb-4">{formatNpr(product.priceNpr)}</p>
            <p className="text-sm text-slate-600 mb-6">{product.description}</p>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50">-</button>
                <span className="text-sm font-medium w-8 text-center">{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)} className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50">+</button>
              </div>
              <Button onClick={handleAdd}>{added ? "Added!" : "Add to Cart"}</Button>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-900">Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.specs.map((spec) => (
                  <div key={spec.label} className="rounded-lg border border-slate-200 p-3">
                    <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">{spec.label}</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">{spec.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
