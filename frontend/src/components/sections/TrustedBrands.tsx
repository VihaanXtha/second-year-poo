import { VENDORS } from "@/data/hardwareData";

export default function TrustedBrands() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Trusted Vendors
          </h2>
          <p className="mt-2 text-slate-600">
            Meet the verified sellers powering Nepal&apos;s hardware community.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VENDORS.map((vendor) => (
            <div
              key={vendor.id}
              className="rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200 flex flex-col items-center text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-slate-900 ring-1 ring-slate-200">
                {vendor.code}
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                {vendor.name}
              </h3>
              <p className="mt-1 text-sm text-slate-500">{vendor.specialty}</p>
              <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-slate-900">
                <span className="material-symbols-outlined text-[18px] text-amber-500">
                  star
                </span>
                {vendor.rating}
                <span className="text-slate-400 font-normal">
                  ({vendor.reviewsCount})
                </span>
              </div>
              <span className="mt-3 inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                Verified since {vendor.verifiedSince}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
