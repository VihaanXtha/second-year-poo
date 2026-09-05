import Link from "next/link";
import { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.slug}`} className="group rounded-xl border border-slate-200 overflow-hidden hover:shadow-sm transition-shadow block">
      <img src={product.image} alt={product.name} className="w-full h-48 object-cover bg-slate-100" />
      <div className="p-4">
        <p className="text-xs text-slate-500 mb-1">{product.category}</p>
        <h3 className="text-sm font-medium text-slate-900 line-clamp-2 group-hover:text-red-700">{product.name}</h3>
        <p className="mt-2 text-sm font-semibold text-slate-900">Rs. {product.priceNpr.toLocaleString()}</p>
      </div>
    </Link>
  );
}
