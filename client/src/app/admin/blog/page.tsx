"use client";

import { SortableHeader } from "@/presentation/atoms/SortableHeader";
import { useTableSort } from "@/presentation/hooks/useTableSort";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Eye, EyeOff, Pencil, Plus, Trash2, X, XCircle } from "lucide-react";
import { Button } from "@/presentation/atoms/button";
import { PostFormModal } from "./form";
import { apiRequest, ApiError } from "@/infrastructure/http/client";
import type { Post } from "@/domain/entities/Post";

interface AdminPost {
  id: number;
  slug: string;
  title: string;
  category: string;
  category_color?: string;
  excerpt: string;
  read_time: string;
  is_published: boolean;
  published_at?: string;
  created_at?: string;
}

export default function AdminBlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const { sortParams, headerProps } = useTableSort(() => setPage(1));
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [loadingPost, setLoadingPost] = useState(false);

  const openCreateModal = () => {
    setEditingPost(null);
    setModalOpen(true);
  };

  const openEditModal = async (postId: number) => {
    setLoadingPost(true);
    setModalOpen(true);
    try {
      const res = await apiRequest<{ data: any }>(`/admin/posts/${postId}`, { auth: true });
      const p = res.data;
      setEditingPost({
        id: p.id,
        slug: p.slug,
        title: p.title,
        category: p.category,
        categoryColor: p.category_color || "#18D6D1",
        tagBg: p.tag_bg,
        excerpt: p.excerpt,
        content: p.content,
        image: p.image,
        readTime: p.read_time,
        icon: p.icon,
        bannerGradient: p.banner_gradient,
        isPublished: p.is_published,
      });
    } catch {
      setError("No se pudo cargar el artículo seleccionado.");
      setModalOpen(false);
    } finally {
      setLoadingPost(false);
    }
  };

  const [refreshVersion, setRefreshVersion] = useState(0);
  const loadVersion = useRef(0);

  const loadPosts = useCallback(async () => {
    const requestVersion = ++loadVersion.current;
    setIsLoading(true);
    setError("");
    try {
      const q = new URLSearchParams({
        page: String(page),
        limit: "10",
      });
      if (search) q.set("search", search);
      if (sortParams.sort) {
        q.set("sort", sortParams.sort);
        q.set("direction", sortParams.direction ?? "asc");
      }
      if (categoryFilter) q.set("category", categoryFilter);

      const res = await apiRequest<{
        data: AdminPost[];
        meta?: { last_page: number; total: number };
      }>(`/admin/posts?${q.toString()}`, { auth: true });

      // Una respuesta anterior no debe reemplazar el orden elegido más recientemente.
      if (requestVersion !== loadVersion.current) return;
      setPosts(res.data || []);
      if (res.meta) {
        setLastPage(res.meta.last_page);
        setTotal(res.meta.total);
      }
    } catch (err) {
      if (requestVersion !== loadVersion.current) return;
      setError(err instanceof ApiError ? err.message : "No se pudieron cargar los artículos.");
    } finally {
      if (requestVersion === loadVersion.current) setIsLoading(false);
    }
  }, [page, search, categoryFilter, sortParams.sort, sortParams.direction]);

  useEffect(() => {
    loadPosts();
    return () => { loadVersion.current += 1; };
  }, [loadPosts, refreshVersion]);

  const handleTogglePublish = async (post: AdminPost) => {
    try {
      await apiRequest(`/admin/posts/${post.id}/toggle`, {
        method: "PATCH",
        auth: true,
      });
      setRefreshVersion((version) => version + 1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al cambiar estado de publicación.");
    }
  };

  const handleDelete = async (post: AdminPost) => {
    if (!window.confirm(`¿Eliminar el artículo "${post.title}"?`)) return;
    try {
      await apiRequest(`/posts/${post.id}`, {
        method: "DELETE",
        auth: true,
      });
      setRefreshVersion((version) => version + 1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al eliminar el artículo.");
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Panel administrador</p>
            <h1 className="mt-2 text-3xl font-black text-foreground">Blog y Artículos</h1>
            <p className="text-sm text-muted-foreground">Gestioná guías, novedades y consejos de compra</p>
          </div>

          <div className="flex gap-3">
            <Button onClick={openCreateModal}>
              <Plus className="w-4 h-4" /> Nuevo artículo
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex flex-col gap-4 border-b border-border p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-black text-foreground">Publicaciones</h2>
                <p className="text-xs text-muted-foreground">
                  {total} artículo{total === 1 ? "" : "s"} registrado{total === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary sm:w-64"
                placeholder="Buscar por título o contenido…"
              />
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary sm:w-48"
              >
                <option value="">Todas las categorías</option>
                <option value="Herramientas">Herramientas</option>
                <option value="Guía UNO">Guía UNO</option>
                <option value="Hogar y Taller">Hogar y Taller</option>
                <option value="Tecnología">Tecnología</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <SortableHeader label="Título" column="title" {...headerProps} className="px-5 py-3 font-semibold" align="left" />
                  <SortableHeader label="Categoría" column="category" {...headerProps} className="px-5 py-3 font-semibold" align="left" />
                  <SortableHeader label="Lectura" column="read_time" {...headerProps} className="px-5 py-3 font-semibold" align="left" sortLabel="Minutos de lectura" />
                  <SortableHeader label="Estado" column="is_published" {...headerProps} className="px-5 py-3 font-semibold" align="left" />
                  <SortableHeader label="Publicación" column="published_at" {...headerProps} className="px-5 py-3 font-semibold" align="left" />
                  <th className="px-5 py-3 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                      Cargando artículos…
                    </td>
                  </tr>
                ) : posts.length > 0 ? (
                  posts.map((post) => (
                    <tr key={post.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                      <td className="px-5 py-3">
                        <p className="font-bold text-foreground max-w-sm line-clamp-1">{post.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{post.excerpt}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground border border-border">
                          {post.category}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground text-xs">{post.read_time}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${
                            post.is_published
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                        >
                          {post.is_published ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {post.is_published ? "Publicado" : "Borrador"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {post.published_at ? new Date(post.published_at).toLocaleDateString("es-ES") : "Sin publicar"}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            title="Editar artículo"
                            onClick={() => openEditModal(post.id)}
                            className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:border-primary hover:text-primary cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            title={post.is_published ? "Cambiar a borrador" : "Publicar artículo"}
                            onClick={() => handleTogglePublish(post)}
                            className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:border-primary hover:text-primary cursor-pointer"
                          >
                            {post.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            title="Eliminar artículo"
                            onClick={() => handleDelete(post)}
                            className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:border-red-300 hover:text-red-600 cursor-pointer"
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
                      No se encontraron artículos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {lastPage > 1 && (
            <div className="flex items-center justify-between border-t border-border px-5 py-3">
              <span className="text-xs text-muted-foreground">
                Página {page} de {lastPage}
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= lastPage}
                  onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                >
                  Siguiente <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Modal Crear / Editar Artículo */}
      <PostFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingPost(null);
        }}
        post={editingPost}
        isLoading={loadingPost}
        onSuccess={() => setRefreshVersion((version) => version + 1)}
      />
    </>
  );
}
