"use client";

import { SortableHeader } from "@/presentation/atoms/SortableHeader";
import { useTableSort } from "@/presentation/hooks/useTableSort";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronLeft, ChevronRight, Pencil, Plus, Search, Tags, Trash2, X } from "lucide-react";
import { Button } from "@/presentation/atoms/button";
import { useAdminCategories } from "@/presentation/hooks/useAdminCategories";
import { ApiError } from "@/infrastructure/http/client";
import { cn } from "@/shared/lib/utils";
import { CategoryIcon } from "@/shared/lib/categoryIcons";
import { CategoryForm, CategoryModalData } from "./form";

const PAGE_SIZE = 10;

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [editingCategory, setEditingCategory] = useState<CategoryModalData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { sortParams, headerProps } = useTableSort(() => setPage(1));

  const { data, isLoading, remove, isRemoving } = useAdminCategories({
    search,
    page,
    limit: PAGE_SIZE,
    ...sortParams,
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const openEditModal = (id: number, currentName: string, iconName?: string) => {
    setEditingCategory({ id, name: currentName, iconName });
    setModalOpen(true);
  };

  const handleEdit = (id: number, currentName: string, iconName?: string) => {
    openEditModal(id, currentName, iconName);
  };

  const handleDelete = async (id: number, categoryName: string) => {
    if (!window.confirm(`¿Eliminar la categoría "${categoryName}"? Esta acción no se puede deshacer.`)) return;
    try {
      await remove(id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo eliminar la categoría.");
    }
  };

  const totalPages = Math.max(1, data?.lastPage ?? 1);

  return (
    <>
      <div className="space-y-6">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Panel administrador</p>
            <h1 className="mt-2 text-3xl font-black text-foreground">Categorías</h1>
            <p className="text-sm text-muted-foreground">Creá, editá y eliminá las categorías del catálogo</p>
          </div>

          <div className="flex gap-3">
            <Button onClick={openCreateModal}>
              <Plus className="w-4 h-4" /> Nueva categoría
            </Button>
          </div>
        </div>

        <section className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex flex-col gap-4 border-b border-border p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Tags className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-black text-foreground">Listado</h2>
                <p className="text-xs text-muted-foreground">
                  {isLoading ? "Cargando…" : `${data?.total ?? 0} categoría${(data?.total ?? 0) === 1 ? "" : "s"}`}
                </p>
              </div>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:border-primary sm:w-64"
                placeholder="Buscar categoría…"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <SortableHeader label="Categoría" column="name" {...headerProps} className="px-5 py-3 font-semibold" align="left" />
                  <SortableHeader label="Slug" column="slug" {...headerProps} className="px-5 py-3 font-semibold" align="left" />
                  <SortableHeader label="Productos" column="products_count" {...headerProps} className="px-5 py-3 font-semibold" align="left" />
                  <th className="px-5 py-3 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">Cargando categorías…</td>
                  </tr>
                ) : data && data.items.length > 0 ? (
                  data.items.map((category) => (
                    <tr
                      key={category.id}
                      className={cn("border-b border-border last:border-0 hover:bg-muted/40", editingCategory?.id === category.id && "bg-primary/5")}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-9 h-9 rounded-lg flex items-center justify-center"
                            style={{ background: category.color }}
                          >
                            <CategoryIcon name={category.iconName} fallback={category.icon} className="w-4 h-4 text-foreground/70" />
                          </span>
                          <span className="font-semibold text-foreground">{category.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{category.slug ?? "—"}</td>
                      <td className="px-5 py-3 font-semibold text-foreground">{category.count}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            title="Editar categoría"
                            onClick={() => handleEdit(Number(category.id), category.name, category.iconName)}
                            className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            title="Eliminar categoría"
                            disabled={isRemoving}
                            onClick={() => handleDelete(Number(category.id), category.name)}
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
                    <td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">
                      {search ? "No hay categorías que coincidan con la búsqueda." : "No hay categorías todavía."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-5 py-4 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              {data
                ? `${(data.currentPage - 1) * PAGE_SIZE + 1}–${Math.min(data.currentPage * PAGE_SIZE, data.total)} de ${data.total} categorías`
                : ""}
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

      {/* Modal Crear / Editar Categoría */}
      <CategoryForm
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
      />
    </>
  );
}