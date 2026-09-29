"use client";

import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/presentation/hooks/useCart";
import { useInfiniteProducts } from "@/presentation/hooks/useInfiniteProducts";
import { SectionEyebrow } from "@/presentation/atoms/SectionEyebrow";
import { CountdownTimer } from "@/presentation/molecules/CountdownTimer";
import { LoadMoreButton } from "@/presentation/molecules/LoadMoreButton";
import { ProductCard } from "@/presentation/organisms/ProductCard";

const FLASH_DEAL_DURATION_SECS = 4 * 3600 + 23 * 60 + 45;

export function FlashDealsSection() {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteProducts({
    isFlashDeal: true,
    pageSize: 12,
  });
  const deals = data?.pages.flatMap((page) => page.items) ?? [];
  const { addToCart } = useCart();
  const router = useRouter();

  // Buscar la fecha de fin más próxima entre los productos de oferta flash
  const upcomingEndDates = deals
    .map((d) => d.flashDealEndsAt)
    .filter((d): d is string => Boolean(d) && new Date(d as string).getTime() > Date.now())
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  const targetEndDate = upcomingEndDates[0];

  return (
    <section id="ofertas" className="max-w-7xl mx-auto px-4 py-10">
      <div className="bg-card rounded-3xl border border-border p-6 md:p-8 relative overflow-hidden">
        {/* Sello de marca: Medios círculos / arcos decorativos */}
        <div
          className="absolute -top-16 -right-16 w-56 h-56 rounded-full border-[14px] border-[#FF6A00]/15 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full border-[12px] border-[#18D6D1]/20 pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <SectionEyebrow icon={Clock} tone="accent">Tiempo limitado</SectionEyebrow>
            <h2 className="text-2xl font-black text-foreground font-heading mt-1">Ofertas Flash</h2>
            <div className="w-12 h-1 bg-[#FF6A00] rounded-full mt-2" />
            <p className="text-sm text-muted-foreground mt-2">Termina en:</p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <CountdownTimer targetDate={targetEndDate} targetSecs={FLASH_DEAL_DURATION_SECS} />
            <Link
              href="/ofertas"
              className="inline-flex items-center gap-1.5 border-2 border-[#18D6D1] text-[#00a6a0] hover:bg-[#18D6D1]/10 px-4 py-2 rounded-full font-subheading font-medium text-xs transition-all shadow-sm self-start sm:self-auto"
            >
              Ver todas <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
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
        ) : deals.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {deals.map((product) => (
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
          <p className="text-sm text-muted-foreground text-center py-10">
            Todavía no hay ofertas disponibles.
          </p>
        )}
      </div>
    </section>
  );
}
