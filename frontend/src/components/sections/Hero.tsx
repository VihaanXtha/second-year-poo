import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(220,38,38,0.06)_0%,transparent_40%),radial-gradient(circle_at_70%_80%,rgba(2,6,23,0.04)_0%,transparent_40%)]" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-600 ring-1 ring-red-600/20">
              Nepal&apos;s Verified Hardware Marketplace
            </span>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900">
              Build with confidence.<br />
              <span className="text-red-600">Buy with trust.</span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed">
              Circuit Bazaar is Nepal&apos;s specification-first hardware marketplace.
              Every component, module, and laptop is listed by verified vendors with
              full warranty transparency — so you never have to guess if you&apos;re
              getting the real deal.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="#featured"
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
              >
                Explore Verified Hardware
                <span className="material-symbols-outlined ml-2 text-[18px]">
                  arrow_forward
                </span>
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-base font-semibold text-slate-900 ring-1 ring-slate-300 hover:bg-slate-50 transition-colors"
              >
                How It Works
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-slate-500">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-white bg-slate-200"
                  />
                ))}
              </div>
              <div>
                <span className="block text-slate-900 font-semibold">10,000+ builders</span>
                <span>trust Circuit Bazaar across Nepal</span>
              </div>
            </div>
          </div>
          <div className="relative lg:h-[540px] hidden lg:block">
            <div className="absolute inset-0 rounded-3xl bg-slate-100 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=800&q=80"
                alt="Circuit board close-up"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                  <span className="material-symbols-outlined text-green-600 text-[24px]">
                    verified
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Verified Vendor</p>
                  <p className="text-xs text-slate-500">Official warranty included</p>
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                  <span className="material-symbols-outlined text-red-600 text-[24px]">
                    local_shipping
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Fast Delivery</p>
                  <p className="text-xs text-slate-500">Across Nepal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
