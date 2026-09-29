"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PostForm } from "@/presentation/organisms/PostForm";
import { apiRequest } from "@/infrastructure/http/client";
import type { Post } from "@/domain/entities/Post";

export default function AdminEditPostPageClient() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    apiRequest<{ data: any }>(`/admin/posts/${id}`, { auth: true })
      .then((res) => {
        const p = res.data;
        setPost({
          id: p.id,
          slug: p.slug,
          title: p.title,
          category: p.category,
          categoryColor: p.category_color || "#18D6D1",
          tagBg: p.tag_bg,
          excerpt: p.excerpt,
          content: p.content,
          image: p.image,
          readTime: p.read_time,
          icon: p.icon,
          bannerGradient: p.banner_gradient,
          isPublished: p.is_published,
        });
      })
      .catch(() => {
        setError("No se pudo cargar el artículo seleccionado.");
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Cargando artículo…
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-center">
        <p className="text-red-600 mb-4">{error || "Artículo no encontrado."}</p>
        <Link href="/admin/blog" className="text-sm font-bold text-primary underline">
          Volver al listado
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Volver al listado de artículos
        </Link>
        <h1 className="text-3xl font-black text-foreground font-heading">Editar artículo</h1>
        <p className="text-sm text-muted-foreground">Modificá el contenido, formato y visibilidad</p>
      </div>

      <PostForm post={post} isEditing />
    </div>
  );
}
