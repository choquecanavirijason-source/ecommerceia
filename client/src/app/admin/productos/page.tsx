"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "sonner";
import { CheckCircle2, ChevronLeft, ChevronRight, Download, Eye, EyeOff, Package, Pencil, Plus, Star, Trash2, X, XCircle, Zap } from "lucide-react";
import { Button } from "@/presentation/atoms/button";
import { SortableHeader } from "@/presentation/atoms/SortableHeader";
import { useTableSort } from "@/presentation/hooks/useTableSort";
import { ProductFormModal } from "./form";
import { useAdminProducts } from "@/presentation/hooks/useAdminProducts";
import { useExportProducts } from "@/presentation/hooks/useExportProducts";
import { useCategories } from "@/presentation/hooks/useCatalog";
import { ApiError } from "@/infrastructure/http/client";
import { formatPrice } from "@/shared/lib/format";
import { container } from "@/infrastructure/container";
import type { Product } from "@/domain/entities/Product";
import { CatalogSyncButton } from "@/presentation/organisms/CatalogSyncModal";

const PAGE_SIZE = 8;

export default function AdminProductsPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState<boolean | "">("");
  const [specialFilter, setSpecialFilter] = useState<"all" | "featured" | "flash">("all");
  const [page, setPage] = useState(1);
  const { sort, headerProps } = useTableSort(() => setPage(1));

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);

  const { data, isLoading, refetch, toggleActive, isToggling, remove, isRemoving } = useAdminProducts({
    search,
    category: categoryFilter,
    isActive: activeFilter,
    page,
    sort: sort?.column,
    direction: sort?.direction,
    isFeatured: specialFilter === "featured" ? true : undefined,
    isFlashDeal: specialFilter === "flash" ? true : undefined,
  });

  const { exportExcel, isExporting } = useExportProducts();
  const { data: categories } = useCategories();

  const openCreateModal = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleOpenEdit = async (id: number) => {
    setModalOpen(true);
    setLoadingProduct(true);
    try {
      const full = await container.getProductById.execute(id);
      setEditingProduct(full);
    } catch {
      setError("No se pudo cargar la información del producto.");
      setModalOpen(false);
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      await toggleActive({ id, isActive: !isActive });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo actualizar el producto.");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`¿Eliminar el producto "${name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await remove(id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo eliminar el producto.");
    }
  };

  const totalPages = Math.max(1, data?.lastPage ?? 1);

  return (
    <>
      <Toaster richColors />
      <div className="space-y-6">
        <div className="mb-6 flex flex-col flex-wrap gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Panel administrador</p>
            <h1 className="mt-2 text-3xl font-black text-foreground">Productos</h1>
            <p className="text-sm text-muted-foreground">Buscá, filtrá y gestioná el catálogo</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={isExporting}
              onClick={() =>
                exportExcel({
                  search,
                  category: categoryFilter,
                  isActive: activeFilter,
                  isFeatured: specialFilter === "featured" ? true : undefined,
                  isFlashDeal: specialFilter === "flash" ? true : undefined,
                  sort: sort?.column,
                  direction: sort?.direction,
                })
              }
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {isExporting ? "Generando…" : "Descargar Excel"}
            </button>
            <CatalogSyncButton />
            <Button onClick={openCreateModal}>
              <Plus className="w-4 h-4" /> Nuevo producto
            </Button>
          </div>
        </div>

        {error ? (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        ) : null}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-border/80 pb-3 overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              setSpecialFilter("all");
              setPage(1);
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${specialFilter === "all"
              ? "bg-primary text-white shadow-sm"
              : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border"
              }`}
          >
            <Package className="w-4 h-4" />
            <span>Todos los productos</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSpecialFilter("featured");
              setPage(1);
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${specialFilter === "featured"
              ? "bg-amber-500 text-white shadow-sm"
              : "bg-card text-muted-foreground hover:text-amber-600 hover:bg-amber-50/50 border border-border"
              }`}
          >
            <Star className={`w-4 h-4 ${specialFilter === "featured" ? "fill-white" : "fill-amber-500 text-amber-500"}`} />
            <span>Destacados Home</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSpecialFilter("flash");
              setPage(1);
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${specialFilter === "flash"
              ? "bg-[#FF6A00] text-white shadow-sm"
              : "bg-card text-muted-foreground hover:text-[#FF6A00] hover:bg-orange-50/50 border border-border"
              }`}
          >
            <Zap className={`w-4 h-4 ${specialFilter === "flash" ? "fill-white" : "fill-[#FF6A00] text-[#FF6A00]"}`} />
            <span>Ofertas Flash</span>
          </button>
        </div>

        <section className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex flex-col gap-4 border-b border-border p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-black text-foreground">
                  {specialFilter === "featured"
                    ? "Productos Destacados"
                    : specialFilter === "flash"
                      ? "Ofertas Flash Activas"
                      : "Catálogo General"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {data ? `${data.total} producto${data.total === 1 ? "" : "s"}` : "Cargando…"}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary sm:w-56"
                placeholder="Buscar producto…"
              />
              <select
                value={categoryFilter}
                onChange={(event) => {
                  setCategoryFilter(event.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary sm:w-48"
              >
                <option value="">Todas las categorías</option>
                {(categories ?? []).map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
              <select
                value={String(activeFilter)}
                onChange={(event) => {
                  const value = event.target.value;
                  setActiveFilter(value === "" ? "" : value === "true");
                  setPage(1);
                }}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary sm:w-40"
              >
                <option value="">Todos los estados</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <SortableHeader label="Producto" column="name" {...headerProps} />
                  <SortableHeader label="Categoría" column="category" {...headerProps} />
                  <SortableHeader label="Precio" column="price" {...headerProps} />
                  <SortableHeader label="Stock" column="stock" {...headerProps} />
                  <SortableHeader label="Estado" column="status" {...headerProps} />
                  <th className="px-5 py-3 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">Cargando productos…</td>
                  </tr>
                ) : data && data.items.length > 0 ? (
                  data.items.map((product) => (
                    <tr key={product.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-12 w-12 rounded-lg border border-border object-cover"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="max-w-[240px] truncate font-semibold text-foreground">{product.name}</p>
                              {product.isFeatured ? (
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/15 text-amber-600 px-2 py-0.5 text-[10px] font-bold">
                                  <Star className="w-2.5 h-2.5 fill-current" /> Destacado
                                </span>
                              ) : null}
                              {product.isFlashDeal ? (
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-[#FF6A00]/15 text-[#FF6A00] px-2 py-0.5 text-[10px] font-bold">
                                  <Zap className="w-2.5 h-2.5 fill-current" /> Flash
                                </span>
                              ) : null}
                            </div>
                            <p className="text-xs text-muted-foreground">{product.sku ?? "Sin SKU"}</p>
                            {product.isFlashDeal && product.flashDealEndsAt ? (
                              <p className="text-[11px] text-[#FF6A00] font-medium mt-0.5">
                                ⚡ Termina: {new Date(product.flashDealEndsAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{product.category || "—"}</td>
                      <td className="px-5 py-3">
                        <p className="font-bold text-foreground">{formatPrice(product.price)}</p>
                        {product.originalPrice ? (
                          <p className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</p>
                        ) : null}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`font-semibold ${(product.stock ?? 0) > 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {product.stock ?? 0}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${product.isActive
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-red-200 bg-red-50 text-red-700"
                            }`}
                        >
                          {product.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {product.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            title="Editar producto"
                            onClick={() => handleOpenEdit(product.id)}
                            className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:border-primary hover:text-primary cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            title={product.isActive ? "Desactivar producto" : "Activar producto"}
                            disabled={isToggling}
                            onClick={() => handleToggleActive(product.id, product.isActive ?? true)}
                            className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
                          >
                            {product.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            title="Eliminar producto"
                            disabled={isRemoving}
                            onClick={() => handleDelete(product.id, product.name)}
                            className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:border-red-300 hover:text-red-600 disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                      No hay productos que coincidan con los filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-5 py-4 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              {data ? `${(data.currentPage - 1) * PAGE_SIZE + 1}–${Math.min(data.currentPage * PAGE_SIZE, data.total)} de ${data.total} productos` : ""}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-foreground transition-colors hover:border-primary disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>
              <span className="text-xs font-semibold text-muted-foreground">
                Página {data?.currentPage ?? 1} de {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-foreground transition-colors hover:border-primary disabled:opacity-40"
              >
                Siguiente <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Modal Crear / Editar Producto */}
      <ProductFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        isLoading={loadingProduct}
        onSuccess={refetch}
      />
    </>
  );
}
