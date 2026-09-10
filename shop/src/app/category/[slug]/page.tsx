import TaxonomyComingSoon from "@/components/TaxonomyComingSoon";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <TaxonomyComingSoon kind="category" slug={slug} />;
}
