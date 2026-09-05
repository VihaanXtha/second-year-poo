import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-[#dc2626]/10 text-[#dc2626]">
          <span className="material-symbols-outlined text-[64px]">error</span>
        </div>
        <p className="mt-5 text-6xl font-mono font-bold text-slate-900">404</p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
          The page you are looking for has been moved, deleted, or perhaps never existed.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-11 px-6 items-center justify-center rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold text-sm"
          >
            Go home
          </Link>
          <Link
            href="/products"
            className="inline-flex h-11 px-6 items-center justify-center rounded-xl border border-slate-200 hover:border-[#dc2626] hover:text-[#dc2626] font-bold text-sm"
          >
            Browse products
          </Link>
        </div>
      </div>
    </main>
  );
}