"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { getBrands, type Brand } from "@/lib/api";

export default function BrandsMenu() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getBrands()
      .then((res) => setBrands(res.brands ?? []))
      .catch(() => {
        // API unreachable — dropdown simply renders "No brands yet"
      });
  }, []);

  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
      <button
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        className="relative z-50 flex items-center gap-1.5 text-sm font-medium text-slate-700 transition-colors hover:text-red-600"
      >
        Brands
        <ChevronDown size={15} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 z-50 mt-2 w-72 rounded-xl border border-slate-100 bg-white p-3 shadow-xl animate-fade-in-down">
          {brands.length === 0 ? (
            <p className="px-2 py-3 text-sm text-slate-500">No brands yet.</p>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/brands/${brand.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-slate-50"
                >
                  {brand.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element -- brand logos come from arbitrary remote hosts
                    <img src={brand.logo} alt="" className="h-8 w-14 rounded border border-slate-100 object-contain" />
                  ) : (
                    <span className="flex h-8 w-14 items-center justify-center rounded border border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400">
                      {brand.name.slice(0, 6).toUpperCase()}
                    </span>
                  )}
                  <span className="text-sm font-medium text-slate-700">{brand.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
