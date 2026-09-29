"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, Flame, Sparkles, Tag } from "lucide-react";
import { StorefrontTemplate } from "@/presentation/templates/StorefrontTemplate";
import { SectionEyebrow } from "@/presentation/atoms/SectionEyebrow";
import { CountdownTimer } from "@/presentation/molecules/CountdownTimer";
import { ProductCard } from "@/presentation/organisms/ProductCard";
import { LoadMoreButton } from "@/presentation/molecules/LoadMoreButton";
import { useInfiniteProducts } from "@/presentation/hooks/useInfiniteProducts";
import { useCart } from "@/presentation/hooks/useCart";

const FLASH_DEAL_DURATION_SECS = 4 * 3600 + 23 * 60 + 45;

export default function OfertasPage() {
  const router = useRouter();
  const { addToCart } = useCart();

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteProducts({
    isFlashDeal: true,
    pageSize: 16,
  });

  const products = data?.pages.flatMap((page) => page.items) ?? [];
  const total = data?.pages[0]?.total ?? products.length;

  const upcomingEndDates = products
    .map((d) => d.flashDealEndsAt)
    .filter((d): d is string => Boolean(d) && new Date(d as string).getTime() > Date.now())
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  const targetEndDate = upcomingEndDates[0];

  return (
    <StorefrontTemplate>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </Link>
        </div>

        {/* Hero Banner de Ofertas */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#FF6A00] to-[#e65f00] text-white p-6 sm:p-10 mb-10 shadow-lg">
          <div className="relative z-10 max-w-2xl">
            <span
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-sm"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              <Flame className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" /> Promociones Exclusivas
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-heading tracking-tight mb-3">
              Descubrí Nuestras Mejores Ofertas
            </h1>

            <p className="text-white/90 text-sm sm:text-base leading-relaxed mb-6">
              Aprovechá precios rebajados en herramientas, hogar y más. Envíos rápidos a todo el país y pago 100% seguro.
            </p>

            <div className="inline-flex flex-col sm:flex-row sm:items-center gap-4 bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/15">
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <Clock className="w-4 h-4 text-yellow-300" />
                <span className="font-semibold">Ofertas Flash por tiempo limitado:</span>
              </div>
              <CountdownTimer targetDate={targetEndDate} targetSecs={FLASH_DEAL_DURATION_SECS} />
            </div>
          </div>

          {/* Decoración gráfica */}
          <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full border-[16px] border-[#18D6D1]/40 pointer-events-none" />
        </div>

        {/* Encabezado del catálogo de ofertas */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <SectionEyebrow icon={Tag}>Catálogo de rebajas</SectionEyebrow>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading mt-1">
              Productos en Promoción
            </h2>
            <div className="w-12 h-1 bg-[#FF6A00] rounded-full mt-2" />
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {isLoading ? "Cargando ofertas…" : `${products.length} productos con descuento`}
          </p>
        </div>

        {/* Listado de productos */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse rounded-2xl border border-border bg-card overflow-hidden">
                <div className="h-44 bg-secondary" />
                <div className="p-4 space-y-2">
                  <div className="h-3 w-1/3 rounded bg-secondary" />
                  <div className="h-4 w-3/4 rounded bg-secondary" />
                  <div className="h-3 w-1/2 rounded bg-secondary" />
                  <div className="mt-3 h-9 w-full rounded-xl bg-secondary" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                  onSelect={(p) => router.push(`/productos/${p.id}`)}
                />
              ))}
            </div>

            <LoadMoreButton
              hasMore={hasNextPage}
              isLoading={isFetchingNextPage}
              onLoadMore={() => fetchNextPage()}
            />
          </>
        ) : (
          <div className="rounded-3xl border border-border bg-card p-12 text-center max-w-lg mx-auto">
            <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-bold text-foreground">No hay ofertas activas en este momento</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 mb-6">
              Suscribite a nuestro boletín para que te avisemos cuando lancemos nuevas promociones flash.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-[#FF6A00] text-white px-6 py-2.5 rounded-full font-subheading font-medium text-sm hover:bg-[#e65f00] transition-colors"
            >
              Volver a la tienda <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </StorefrontTemplate>
  );
}
