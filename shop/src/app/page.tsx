import Link from "next/link";
import { PRODUCTS } from "@/data/hardwareData";
import { getCategories } from "@/lib/api";
import HomepageSlider from "@/components/sections/HomepageSlider";
import ShopByCategory from "@/components/sections/ShopByCategory";
import FeaturedProducts from "@/components/sections/FeaturedProducts";

const iconMap: Record<string, string> = {
  "pc-components": "memory",
  "iot-gear": "developer_board",
  laptops: "laptop_mac",
  networking: "router",
  "cables-connectors": "cable",
  "tools-equipment": "handyman",
  "power-supplies": "power",
  storage: "sd_card",
};

function PopularProducts() {
  const popular = PRODUCTS.filter((p) => p.isBestSeller || p.rating >= 4.9).slice(0, 8);
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Most Seen Products</h2>
            <p className="mt-2 text-slate-600">Trending hardware across Nepal right now.</p>
          </div>
          <Link href="/products" className="hidden sm:inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800">View all <span className="material-symbols-outlined ml-1 text-[18px]">arrow_forward</span></Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popular.map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`} className="group block rounded-2xl bg-white ring-1 ring-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-200/60 hover:ring-slate-300 transition-all duration-300">
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
          ))}
        </div>
      </div>
    </section>
  );
}

function AllProducts() {
  const all = PRODUCTS.slice(0, 8);
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">All Products</h2>
            <p className="mt-2 text-slate-600">Browse our full catalog of verified hardware.</p>
          </div>
          <Link href="/products" className="hidden sm:inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800">View all <span className="material-symbols-outlined ml-1 text-[18px]">arrow_forward</span></Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {all.map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`} className="group block rounded-2xl bg-white ring-1 ring-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-200/60 hover:ring-slate-300 transition-all duration-300">
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
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <HomepageSlider />
      <ShopByCategory />
      <FeaturedProducts />
      <PopularProducts />
      <AllProducts />
    </main>
  );
}
