import AdminEditPostPageClient from "./AdminEditPostPageClient";

export function generateStaticParams() {
  return Array.from({ length: 20 }, (_, i) => ({ id: String(i + 1) }));
}

export default function AdminEditPostPage() {
  return <AdminEditPostPageClient />;
}
