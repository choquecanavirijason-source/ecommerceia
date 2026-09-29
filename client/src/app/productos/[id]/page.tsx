import ProductDetailPageClient from "./ProductDetailPageClient";
import { getProductIds } from "@/infrastructure/build/buildParams";

export async function generateStaticParams() {
  const ids = await getProductIds();
  return ids.map((id) => ({ id }));
}

export default function ProductDetailPage() {
  return <ProductDetailPageClient />;
}
