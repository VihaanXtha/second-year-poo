import Link from "next/link";
import { formatPrice, effectivePrice } from "@/lib/api";
import type { Product } from "@/lib/api";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/product/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-3 transition hover:border-red-300 hover:shadow-md"
    >
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-slate-50">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain p-3"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
            No image
          </div>
        )}
      </div>
      <div className="mt-3 space-y-1">
        {product.sku && <p className="font-mono text-[11px] text-slate-400">{product.sku}</p>}
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">
          {product.name}
        </h3>
        <div className="flex flex-wrap items-baseline gap-2">
          <p className="font-mono text-sm font-bold text-red-600">{formatPrice(effectivePrice(product))}</p>
          {effectivePrice(product) < Number(product.price) && (
            <>
              <p className="font-mono text-xs text-slate-400 line-through">{formatPrice(product.price)}</p>
              <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                -{Math.round((1 - effectivePrice(product) / Number(product.price)) * 100)}%
              </span>
            </>
          )}
        </div>
        {typeof product.total_sold === "number" && product.total_sold > 0 && (
          <p className="text-xs text-amber-600">{product.total_sold} sold</p>
        )}
        {product.stock !== undefined && product.stock < 5 && (
          <p className="text-xs text-amber-600">Only {product.stock} left</p>
        )}
      </div>
    </Link>
  );
}
