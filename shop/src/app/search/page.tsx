"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ComingSoon from "@/components/ComingSoon";

function SearchContent() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";

  return (
    <ComingSoon
      title={q ? `Search: “${q}”` : "Search"}
      kicker="Search results"
      note={
        q
          ? "Product search results for this query are coming soon as part of the shop rollout."
          : "Type a query in the search bar — product results arrive with the storefront rollout."
      }
    />
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex-1 bg-slate-50" />}>
      <SearchContent />
    </Suspense>
  );
}
