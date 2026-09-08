import Link from "next/link";
import { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.slug}`} className="group block rounded-2xl bg-white ring-1 ring-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-200/60 hover:ring-slate-300 transition-all duration-300">
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-5">
        <span className="text-[11px] font-bold tracking-wider text-red-700 bg-red-50 px-2.5 py-1 rounded-md uppercase">{product.category}</span>
        <h3 className="mt-3 text-sm font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-red-700 transition-colors">{product.name}</h3>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-base font-bold text-slate-900">Rs. {product.priceNpr.toLocaleString()}</span>
          <span className="text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-md">{product.stockStatus || "In Stock"}</span>
        </div>
      </div>
    </Link>
  );
}
