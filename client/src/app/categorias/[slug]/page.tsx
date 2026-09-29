import CategoryDetailPageClient from "./CategoryDetailPageClient";
import { getCategorySlugs } from "@/infrastructure/build/buildParams";

export async function generateStaticParams() {
  const slugs = await getCategorySlugs();
  return slugs.map((slug) => ({ slug }));
}

export default function CategoryDetailPage() {
  return <CategoryDetailPageClient />;
}
