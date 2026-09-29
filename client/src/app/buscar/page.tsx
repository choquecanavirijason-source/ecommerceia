"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PackageSearch, Search } from "lucide-react";
import { StorefrontTemplate } from "@/presentation/templates/StorefrontTemplate";
import { ProductCard } from "@/presentation/organisms/ProductCard";
import { LoadMoreButton } from "@/presentation/molecules/LoadMoreButton";
import { useInfiniteProducts } from "@/presentation/hooks/useInfiniteProducts";
import { useCart } from "@/presentation/hooks/useCart";

function BuscarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.trim() ?? "";
  const isOfertas = searchParams.get("ofertas") === "true";

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteProducts({
    search: q || undefined,
    isFlashDeal: isOfertas ? true : undefined,
    enabled: !!q || isOfertas,
  });
  const products = data?.pages.flatMap((page) => page.items) ?? [];
  const total = data?.pages[0]?.total ?? products.length;
  const { addToCart } = useCart();

  return (
    <StorefrontTemplate>
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-2">
            <Search className="w-4 h-4" /> {isOfertas ? "Promociones" : "Búsqueda"}
          </p>
          <h1 className="text-2xl md:text-3xl font-black text-foreground mt-2 font-heading">
            {q ? `Resultados para "${q}"` : isOfertas ? "Productos en Oferta" : "Buscar productos"}
          </h1>
          <div className="w-12 h-1 bg-[#18D6D1] rounded-full mt-2" />
          <p className="text-sm text-muted-foreground mt-2">
            {q
              ? isLoading
                ? "Buscando productos…"
                : `${total} resultado${total === 1 ? "" : "s"}`
              : isOfertas
              ? "Aprovechá nuestras promociones con precios exclusivos por tiempo limitado."
              : "Escribí lo que buscás en la barra de búsqueda"}
          </p>
        </div>

        {!q && !isOfertas ? (
          <div className="rounded-2xl border border-border bg-card p-14 text-center">
            <Search className="w-10 h-10 mx-auto text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">Ingresá un término para buscar productos.</p>
          </div>
        ) : isLoading ? (
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
        ) : products && products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
          <div className="rounded-2xl border border-border bg-card p-14 text-center">
            <PackageSearch className="w-10 h-10 mx-auto text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              No encontramos productos que coincidan con &quot;{q}&quot;. Probá con otro término.
            </p>
          </div>
        )}
      </section>
    </StorefrontTemplate>
  );
}

export default function BuscarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <BuscarContent />
    </Suspense>
  );
}