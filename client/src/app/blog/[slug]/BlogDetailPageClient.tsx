"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Home,
  Share2,
  ShieldCheck,
  Sparkles,
  Tag,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { StorefrontTemplate } from "@/presentation/templates/StorefrontTemplate";
import { SectionEyebrow } from "@/presentation/atoms/SectionEyebrow";
import { usePost } from "@/presentation/hooks/usePosts";

const ICON_COMPONENTS: Record<string, LucideIcon> = {
  Wrench,
  ShieldCheck,
  Home,
  Sparkles,
  BookOpen,
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return "Publicación reciente";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function BlogDetailPageClient() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const router = useRouter();

  const { data: post, isLoading } = usePost(slug || "");

  if (isLoading) {
    return (
      <StorefrontTemplate>
        <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse space-y-6">
          <div className="h-4 w-32 bg-secondary rounded" />
          <div className="h-10 w-3/4 bg-secondary rounded" />
          <div className="h-64 w-full bg-secondary rounded-3xl" />
          <div className="h-4 w-full bg-secondary rounded" />
          <div className="h-4 w-5/6 bg-secondary rounded" />
        </div>
      </StorefrontTemplate>
    );
  }

  if (!post) {
    return (
      <StorefrontTemplate>
        <div className="max-w-3xl mx-auto px-4 py-24 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <h1 className="text-2xl font-black text-foreground font-heading">Artículo no encontrado</h1>
          <p className="text-sm text-muted-foreground mt-2 mb-6">
            El artículo que estás buscando no existe o fue despublicado.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-subheading font-medium px-6 py-2.5 rounded-full text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al blog
          </Link>
        </div>
      </StorefrontTemplate>
    );
  }

  const Icon = (post.icon && ICON_COMPONENTS[post.icon]) || BookOpen;
  const bannerGradient = post.bannerGradient || "from-[#18D6D1]/20 via-[#18D6D1]/5 to-transparent";
  const categoryColor = post.categoryColor || "#18D6D1";
  const tagBg = post.tagBg || "bg-[#18D6D1]/10 text-[#00a6a0] border-[#18D6D1]/30";
  const postDate = formatDate(post.publishedAt || post.createdAt);

  return (
    <StorefrontTemplate>
      <article className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Blog
          </Link>
        </div>

        {/* Header con etiquetas y metadata */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span
              className={`inline-block text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border ${tagBg}`}
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {post.category}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> {postDate}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> {post.readTime}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground font-heading tracking-tight leading-tight mb-4">
            {post.title}
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed border-l-4 border-primary pl-4 py-1 italic">
            {post.excerpt}
          </p>
        </header>

        {/* Banner gráfico */}
        <div
          className={`relative rounded-3xl bg-gradient-to-br ${bannerGradient} h-64 sm:h-80 flex items-center justify-center border border-border/80 overflow-hidden mb-10 shadow-xs`}
        >
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-background/90 backdrop-blur-sm border border-border/80 flex items-center justify-center shadow-md">
            <Icon className="w-12 h-12 sm:w-14 sm:h-14" style={{ color: categoryColor }} />
          </div>
        </div>

        {/* Contenido principal del artículo */}
        <div className="prose prose-neutral max-w-none space-y-6 text-foreground/90 font-body text-base leading-relaxed">
          {post.content.split("\n\n").map((parr, idx) => (
            <p key={idx} className="leading-relaxed text-neutral-700">
              {parr}
            </p>
          ))}
        </div>

        {/* Autor y pie de nota */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center font-heading font-black text-primary text-sm">
              UNO
            </div>
            <div>
              <p className="font-heading font-bold text-sm text-foreground">Redacción UNO COMPRAS</p>
              <p className="text-xs text-muted-foreground">Consejos y guías para tu hogar y proyectos</p>
            </div>
          </div>

          <Link
            href="/categorias"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-subheading font-medium text-xs sm:text-sm hover:opacity-95 transition-all shadow-sm self-start sm:self-auto"
          >
            Ver catálogo de productos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </article>
    </StorefrontTemplate>
  );
}
