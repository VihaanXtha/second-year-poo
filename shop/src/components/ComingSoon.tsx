import Link from "next/link";

interface ComingSoonProps {
  title: string;
  kicker?: string;
  note?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

// Shared placeholder shell — used by every route whose real page ships in a later prompt.
export default function ComingSoon({
  title,
  kicker,
  note,
  secondaryHref,
  secondaryLabel,
}: ComingSoonProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 px-4 py-24 text-center">
      {kicker && (
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-red-500">{kicker}</p>
      )}
      <span className="material-symbols-outlined mt-4 text-5xl text-slate-300">widgets</span>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500">
        {note ?? "This section is part of the shop rollout — its product listings arrive in an upcoming prompt."}
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link
          href="/"
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
        >
          Back to Home
        </Link>
        {secondaryHref && secondaryLabel && (
          <a
            href={secondaryHref}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-red-500 hover:text-red-600"
          >
            {secondaryLabel}
          </a>
        )}
      </div>
    </div>
  );
}
