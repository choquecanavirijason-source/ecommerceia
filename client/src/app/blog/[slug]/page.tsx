import BlogDetailPageClient from "./BlogDetailPageClient";

export function generateStaticParams() {
  return [
    { slug: "elegir-taladro-inalambrico" },
    { slug: "comprar-seguro-online" },
    { slug: "kit-herramientas-esenciales" },
    { slug: "tendencias-herramientas-2026" },
    { slug: "1" },
    { slug: "2" },
    { slug: "3" },
    { slug: "4" },
  ];
}

export default function BlogDetailPage() {
  return <BlogDetailPageClient />;
}
