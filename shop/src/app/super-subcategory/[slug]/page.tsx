import TaxonomyComingSoon from "@/components/TaxonomyComingSoon";

export default async function SuperSubCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <TaxonomyComingSoon kind="super-subcategory" slug={slug} />;
}
