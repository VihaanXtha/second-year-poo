"use client";

import { useEffect, useState } from "react";
import ComingSoon from "@/components/ComingSoon";
import { getBrands, getCategories } from "@/lib/api";

type Kind = "category" | "subcategory" | "super-subcategory" | "brand";

const KICKERS: Record<Kind, string> = {
  category: "Category listing",
  subcategory: "Subcategory listing",
  "super-subcategory": "Listing",
  brand: "Brand storefront",
};

function prettify(slug: string) {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

// Resolves the real taxonomy/brand name from the live API so placeholder
// pages show "Gaming Laptops — coming soon", not a raw slug.
export default function TaxonomyComingSoon({ kind, slug }: { kind: Kind; slug: string }) {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (kind === "brand") {
      getBrands()
        .then((res) => {
          if (!cancelled) setName(res.brands?.find((b) => b.slug === slug)?.name ?? null);
        })
        .catch(() => {});
    } else {
      getCategories()
        .then((res) => {
          const cats = res.categories ?? [];
          let found: string | undefined;
          if (kind === "category") {
            found = cats.find((c) => c.slug === slug)?.name;
          } else if (kind === "subcategory") {
            found = cats.flatMap((c) => c.sub_categories ?? []).find((s) => s.slug === slug)?.name;
          } else {
            found = cats
              .flatMap((c) => c.sub_categories ?? [])
              .flatMap((s) => s.super_sub_categories ?? [])
              .find((ssa) => ssa.slug === slug)?.name;
          }
          if (!cancelled) setName(found ?? null);
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [kind, slug]);

  return (
    <ComingSoon
      title={name ?? prettify(slug)}
      kicker={KICKERS[kind]}
      note={
        name
          ? `Browsing ${name} — its product listing page is coming soon as part of the shop rollout.`
          : "Its product listing page is coming soon as part of the shop rollout."
      }
    />
  );
}
