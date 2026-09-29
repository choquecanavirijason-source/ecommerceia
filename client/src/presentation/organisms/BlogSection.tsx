"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Calendar, Clock, Home, ShieldCheck, Sparkles, Wrench, type LucideIcon } from "lucide-react";
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

export function BlogSection() {
  const { data: posts, isLoading } = usePosts({ limit: 3 });

  return (
    <section id="blog" className="max-w-7xl mx-auto px-4 py-10 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <SectionEyebrow icon={BookOpen}>Novedades & Guías</SectionEyebrow>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading mt-1">
            Blog UNO COMPRAS
          </h2>
          <div className="w-12 h-1 bg-[#18D6D1] rounded-full mt-2" />
        </div>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 self-start sm:self-auto border-2 border-[#18D6D1] text-[#00a6a0] hover:bg-[#18D6D1]/10 px-5 py-2 rounded-full font-subheading font-medium text-xs sm:text-sm transition-all duration-200 shadow-sm active:scale-95"
        >
          Ver todos los artículos <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="animate-pulse rounded-3xl border border-border/80 bg-card overflow-hidden">
              <div className="h-44 bg-secondary" />
              <div className="p-6 space-y-3">
                <div className="h-3 w-1/3 rounded bg-secondary" />
                <div className="h-5 w-3/4 rounded bg-secondary" />
                <div className="h-3 w-full rounded bg-secondary" />
                <div className="h-3 w-2/3 rounded bg-secondary" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(posts ?? []).map((post) => {
            const Icon = (post.icon && ICON_COMPONENTS[post.icon]) || BookOpen;
            const bannerGradient = post.bannerGradient || "from-[#18D6D1]/20 via-[#18D6D1]/5 to-transparent";
            const categoryColor = post.categoryColor || "#18D6D1";
            const tagBg = post.tagBg || "bg-[#18D6D1]/10 text-[#00a6a0] border-[#18D6D1]/30";
            const postDate = formatDate(post.publishedAt || post.createdAt);

            return (
              <article
                key={post.id}
                className="flex flex-col bg-card rounded-3xl border border-border/80 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-1 group"
              >
                {/* Header con gradiente e icono temático */}
                <div
                  className={`relative h-44 bg-gradient-to-br ${bannerGradient} flex items-center justify-center border-b border-border/60 overflow-hidden`}
                >
                  {/* Sello de marca: Medios círculos / arcos decorativos */}
                  <div
                    className="absolute -top-10 -right-10 w-28 h-28 rounded-full border-[8px] border-current opacity-15 pointer-events-none transition-transform duration-500 group-hover:scale-110"
                    style={{ color: categoryColor }}
                    aria-hidden="true"
                  />
                  <div
                    className="absolute -bottom-10 -left-10 w-20 h-20 rounded-full border-[6px] border-current opacity-10 pointer-events-none"
                    style={{ color: categoryColor }}
                    aria-hidden="true"
                  />

                  <div className="w-16 h-16 rounded-2xl bg-background/80 backdrop-blur-sm border border-border/60 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8" style={{ color: categoryColor }} />
                  </div>
                  {/* Categoría pill flotante */}
                  <div className="absolute top-4 left-4">
                    <span
                      className={`inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${tagBg}`}
                      style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Contenido del post */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground/80" />
                        {postDate}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground/80" />
                        {post.readTime}
                      </span>
                    </div>

                    <h3
                      className="text-lg font-bold text-foreground leading-snug group-hover:text-primary transition-colors mb-2 font-heading"
                    >
                      {post.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="pt-5 mt-4 border-t border-border/50">
                    <Link
                      href={`/blog/${post.slug || post.id}`}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-subheading font-medium text-[#FF6A00] hover:text-[#e65f00] transition-colors"
                    >
                      <span>Leer artículo</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

