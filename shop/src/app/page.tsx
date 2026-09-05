import Link from "next/link";
import { PRODUCTS, CATEGORIES } from "@/data/hardwareData";

export default function HomePage() {
  const bestSellers = PRODUCTS.filter((p) => p.isBestSeller || p.rating >= 4.9).slice(0, 4);
  const newArrivals = PRODUCTS.filter((p) => p.isNewArrival).slice(0, 4);

  return (
    <main className="min-h-screen bg-white">
      <section className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-4">
            Nepal&apos;s Verified <span className="text-red-700">IT Hardware</span> Marketplace
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl">
            Source genuine PC components, networking gear, IoT modules, and laptops from verified local vendors with official warranties.
          </p>
          <Link href="/products" className="inline-flex items-center rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800">
            Browse Products
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Shop by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Link key={cat.id} href={cat.href} className="group rounded-xl border border-slate-200 p-6 hover:border-red-200 hover:shadow-sm transition-all">
              <span className="material-symbols-outlined text-red-700 text-[28px] mb-3 block">{cat.icon}</span>
              <h3 className="text-lg font-semibold text-slate-900">{cat.name}</h3>
              <p className="text-sm text-slate-500 mt-1">{cat.productCount} products</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Best Sellers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`} className="group rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
              <img src={product.image} alt={product.name} className="w-full h-48 object-cover bg-slate-100" />
              <div className="p-4">
                <p className="text-xs text-slate-500 mb-1">{product.category}</p>
                <h3 className="text-sm font-medium text-slate-900 line-clamp-2 group-hover:text-red-700">{product.name}</h3>
                <p className="mt-2 text-sm font-semibold text-slate-900">Rs. {product.priceNpr.toLocaleString()}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">New Arrivals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`} className="group rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
              <img src={product.image} alt={product.name} className="w-full h-48 object-cover bg-slate-100" />
              <div className="p-4">
                <p className="text-xs text-slate-500 mb-1">{product.category}</p>
                <h3 className="text-sm font-medium text-slate-900 line-clamp-2 group-hover:text-red-700">{product.name}</h3>
                <p className="mt-2 text-sm font-semibold text-slate-900">Rs. {product.priceNpr.toLocaleString()}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
