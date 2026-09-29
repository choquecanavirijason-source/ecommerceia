"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Home,
  ShieldCheck,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { StorefrontTemplate } from "@/presentation/templates/StorefrontTemplate";
import { SectionEyebrow } from "@/presentation/atoms/SectionEyebrow";
import { usePosts } from "@/presentation/hooks/usePosts";

const ICON_COMPONENTS: Record<string, LucideIcon> = {
  Wrench,
  ShieldCheck,
  Home,
  Sparkles,
  BookOpen,
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return "Reciente";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const { data: posts, isLoading } = usePosts({
    category: selectedCategory === "Todos" ? undefined : selectedCategory,
  });

  const categories = ["Todos", "Herramientas", "Guía UNO", "Hogar & Taller", "Tecnología"];

  return (
    <StorefrontTemplate>
      <div className="max-w-7xl mx-auto px-4 py-10 sm:py-14">
        {/* Breadcrumb / Back button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </Link>
        </div>

        {/* Header de la página con estética de marca */}
        <div className="mb-10">
          <SectionEyebrow icon={BookOpen}>Novedades & Guías</SectionEyebrow>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-2">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-foreground font-heading tracking-tight">
                Blog UNO COMPRAS
              </h1>
              <div className="w-16 h-1 bg-[#18D6D1] rounded-full mt-2.5" />
            </div>
            <div className="hidden md:block text-right">
              <span
                className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF6A00] block"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                MÁS QUE COMPRAS, POSIBILIDADES
              </span>
              <span className="text-xs text-muted-foreground">Consejos prácticos para tu día a día</span>
            </div>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground mt-4 max-w-2xl leading-relaxed">
            Descubrí tutoriales, comparativas de herramientas, guías para el cuidado del hogar y recomendaciones para hacer compras inteligentes y seguras.
          </p>

          {/* Filtro por categorías estilo chips */}
          <div className="flex flex-wrap gap-2 mt-6">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-subheading font-medium transition-all ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grilla de artículos */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse rounded-3xl border border-border/80 bg-card overflow-hidden"
              >
                <div className="h-48 bg-secondary" />
                <div className="p-6 space-y-3">
                  <div className="h-3 w-1/3 rounded bg-secondary" />
                  <div className="h-5 w-3/4 rounded bg-secondary" />
                  <div className="h-3 w-full rounded bg-secondary" />
                  <div className="h-3 w-2/3 rounded bg-secondary" />
                </div>
              </div>
            ))}
          </div>
        ) : (posts ?? []).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(posts ?? []).map((post) => {
              const Icon = (post.icon && ICON_COMPONENTS[post.icon]) || BookOpen;
              const bannerGradient =
                post.bannerGradient || "from-[#18D6D1]/20 via-[#18D6D1]/5 to-transparent";
              const categoryColor = post.categoryColor || "#18D6D1";
              const tagBg =
                post.tagBg || "bg-[#18D6D1]/10 text-[#00a6a0] border-[#18D6D1]/30";
              const postDate = formatDate(post.publishedAt || post.createdAt);

              return (
                <article
                  key={post.id}
                  id={post.slug || String(post.id)}
                  className="flex flex-col bg-card rounded-3xl border border-border/80 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-1 group"
                >
                  <div
                    className={`relative h-48 bg-gradient-to-br ${bannerGradient} flex items-center justify-center border-b border-border/60 overflow-hidden`}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-background/80 backdrop-blur-sm border border-border/60 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-8 h-8" style={{ color: categoryColor }} />
                    </div>
                    <div className="absolute top-4 left-4">
                      <span
                        className={`inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${tagBg}`}
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                      >
                        {post.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {postDate}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {post.readTime}
                        </span>
                      </div>

                      <h2 className="text-xl font-bold text-foreground leading-snug group-hover:text-primary transition-colors mb-3 font-heading">
                        <Link href={`/blog/${post.slug || post.id}`} className="hover:underline">
                          {post.title}
                        </Link>
                      </h2>

                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="pt-6 mt-6 border-t border-border/50 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-medium">
                        UNO COMPRAS Magazine
                      </span>
                      <Link
                        href={`/blog/${post.slug || post.id}`}
                        className="inline-flex items-center gap-1 text-xs font-subheading font-medium text-[#FF6A00] hover:text-[#e65f00] transition-colors"
                      >
                        <span>Leer artículo</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-border bg-card p-14 text-center">
            <BookOpen className="w-10 h-10 mx-auto text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              No se encontraron artículos en esta categoría.
            </p>
          </div>
        )}
      </div>
    </StorefrontTemplate>
  );
}
