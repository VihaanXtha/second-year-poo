import TaxonomyComingSoon from "@/components/TaxonomyComingSoon";

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <TaxonomyComingSoon kind="brand" slug={slug} />;
}
