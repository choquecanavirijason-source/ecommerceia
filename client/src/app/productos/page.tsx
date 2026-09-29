"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Filter, Package, Search, Sparkles, Star, Zap } from "lucide-react";
import { StorefrontTemplate } from "@/presentation/templates/StorefrontTemplate";
import { SectionEyebrow } from "@/presentation/atoms/SectionEyebrow";
import { ProductCard } from "@/presentation/organisms/ProductCard";
import { LoadMoreButton } from "@/presentation/molecules/LoadMoreButton";
import { useInfiniteProducts } from "@/presentation/hooks/useInfiniteProducts";
import { useCategories } from "@/presentation/hooks/useCatalog";
import { useCart } from "@/presentation/hooks/useCart";

export default function ProductosPage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const { data: categories } = useCategories();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [specialFilter, setSpecialFilter] = useState<"all" | "featured" | "flash">("all");

  const activeSlug =
    selectedCategory === "Todos"
      ? undefined
      : categories?.find((c) => c.name === selectedCategory)?.slug;

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteProducts({
    search: search.trim() || undefined,
    category: activeSlug,
    isFeatured: specialFilter === "featured" ? true : undefined,
    isFlashDeal: specialFilter === "flash" ? true : undefined,
    pageSize: 16,
  });

  const products = data?.pages.flatMap((page) => page.items) ?? [];
  const total = data?.pages[0]?.total ?? products.length;

  return (
    <StorefrontTemplate>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        {/* Encabezado */}
        <div className="mb-8">
          <SectionEyebrow icon={Package}>Catálogo Completo</SectionEyebrow>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-2">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-foreground font-heading tracking-tight">
                Todos los Productos
              </h1>
              <div className="w-16 h-1 bg-[#18D6D1] rounded-full mt-2.5" />
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isLoading ? "Buscando productos…" : `${total} producto${total === 1 ? "" : "s"} disponible${total === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="bg-card rounded-2xl border border-border p-4 sm:p-5 mb-8 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre o palabra clave…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-60 px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-medium outline-none focus:border-primary"
            >
              <option value="Todos">Todas las categorías</option>
              {(categories ?? []).map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Chips de filtro rápido */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
            <span className="text-xs font-semibold text-muted-foreground mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filtrar:
            </span>

            <button
              type="button"
              onClick={() => setSpecialFilter("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-subheading font-medium transition-all cursor-pointer ${
                specialFilter === "all"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              Todos los productos
            </button>

            <button
              type="button"
              onClick={() => setSpecialFilter("featured")}
              className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-subheading font-medium transition-all cursor-pointer ${
                specialFilter === "featured"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-secondary text-muted-foreground hover:text-amber-600"
              }`}
            >
              <Star className="w-3 h-3 fill-current" /> Destacados
            </button>

            <button
              type="button"
              onClick={() => setSpecialFilter("flash")}
              className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-subheading font-medium transition-all cursor-pointer ${
                specialFilter === "flash"
                  ? "bg-[#FF6A00] text-white shadow-xs"
                  : "bg-secondary text-muted-foreground hover:text-[#FF6A00]"
              }`}
            >
              <Zap className="w-3 h-3 fill-current" /> Ofertas Flash
            </button>
          </div>
        </div>

        {/* Grilla de productos */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
          <div className="rounded-3xl border border-border bg-card p-14 text-center max-w-lg mx-auto">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-lg font-bold text-foreground font-heading">No se encontraron productos</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 mb-6">
              Probá ajustando los términos de búsqueda o eliminando los filtros seleccionados.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("Todos");
                setSpecialFilter("all");
              }}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-subheading font-medium text-xs sm:text-sm shadow-xs cursor-pointer"
            >
              Restablecer filtros
            </button>
          </div>
        )}
      </div>
    </StorefrontTemplate>
  );
}
