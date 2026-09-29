"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PostForm } from "@/presentation/organisms/PostForm";

export default function AdminBlogCrearPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Volver al listado de artículos
        </Link>
        <h1 className="text-3xl font-black text-foreground font-heading">
          Nuevo artículo de blog
        </h1>
        <p className="text-sm text-muted-foreground">
          Creá una guía, comparativa o publicación para tus compradores
        </p>
      </div>

      <PostForm />
    </div>
  );
}
