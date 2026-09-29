"use client";

import { SortableHeader } from "@/presentation/atoms/SortableHeader";
import { useTableSort } from "@/presentation/hooks/useTableSort";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronLeft, ChevronRight, Eye, EyeOff, Mail, Trash2, XCircle } from "lucide-react";
import { Button } from "@/presentation/atoms/button";
import { apiRequest, ApiError } from "@/infrastructure/http/client";

interface Subscriber {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminSuscriptoresPage() {
  const router = useRouter();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { sortParams, headerProps } = useTableSort(() => setPage(1));
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [refreshVersion, setRefreshVersion] = useState(0);
  const loadVersion = useRef(0);

  const loadSubscribers = useCallback(async () => {
    const requestVersion = ++loadVersion.current;
    setIsLoading(true);
    setError("");
    try {
      const q = new URLSearchParams({
        page: String(page),
        limit: "15",
      });
      if (search) q.set("search", search);
      if (sortParams.sort) {
        q.set("sort", sortParams.sort);
        q.set("direction", sortParams.direction ?? "asc");
      }

      const res = await apiRequest<{
        data: Subscriber[];
        current_page: number;
        last_page: number;
        total: number;
      }>(`/admin/subscribers?${q.toString()}`, { auth: true });

      // Una respuesta anterior no debe reemplazar el orden elegido más recientemente.
      if (requestVersion !== loadVersion.current) return;
      setSubscribers(res.data || []);
      setLastPage(res.last_page || 1);
      setTotal(res.total || 0);
    } catch (err) {
      if (requestVersion !== loadVersion.current) return;
      setError(err instanceof ApiError ? err.message : "No se pudieron cargar los suscriptores.");
    } finally {
      if (requestVersion === loadVersion.current) setIsLoading(false);
    }
  }, [page, search, sortParams.sort, sortParams.direction]);

  useEffect(() => {
    loadSubscribers();
    return () => { loadVersion.current += 1; };
  }, [loadSubscribers, refreshVersion]);

  const handleToggleActive = async (sub: Subscriber) => {
    try {
      await apiRequest(`/admin/subscribers/${sub.id}/toggle`, {
        method: "PATCH",
        auth: true,
      });
      setRefreshVersion((version) => version + 1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al cambiar estado.");
    }
  };

  const handleDelete = async (sub: Subscriber) => {
    if (!window.confirm(`¿Eliminar al suscriptor ${sub.email}?`)) return;
    try {
      await apiRequest(`/admin/subscribers/${sub.id}`, {
        method: "DELETE",
        auth: true,
      });
      setRefreshVersion((version) => version + 1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al eliminar el suscriptor.");
    }
  };

  return (
    <div className="space-y-6">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Panel administrador</p>
            <h1 className="mt-2 text-3xl font-black text-foreground">Comunidad y Newsletter</h1>
            <p className="text-sm text-muted-foreground">Usuarios suscritos a promociones, descuentos y novedades</p>
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
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-black text-foreground">Lista de Suscriptores</h2>
                <p className="text-xs text-muted-foreground">
                  {total} email{total === 1 ? "" : "s"} registrado{total === 1 ? "" : "s"}
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
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary sm:w-72"
                placeholder="Buscar por email…"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <SortableHeader label="Correo Electrónico" column="email" {...headerProps} className="px-5 py-3 font-semibold" align="left" />
                  <SortableHeader label="Fecha de Suscripción" column="created_at" {...headerProps} className="px-5 py-3 font-semibold" align="left" />
                  <SortableHeader label="Estado" column="is_active" {...headerProps} className="px-5 py-3 font-semibold" align="left" />
                  <th className="px-5 py-3 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">
                      Cargando suscriptores…
                    </td>
                  </tr>
                ) : subscribers.length > 0 ? (
                  subscribers.map((sub) => (
                    <tr key={sub.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                      <td className="px-5 py-3 font-semibold text-foreground">
                        {sub.email}
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {new Date(sub.created_at).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${
                            sub.is_active
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-neutral-200 bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          {sub.is_active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {sub.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            title={sub.is_active ? "Pausar suscripción" : "Reactivar suscripción"}
                            onClick={() => handleToggleActive(sub)}
                            className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:border-primary hover:text-primary cursor-pointer"
                          >
                            {sub.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            title="Eliminar de la lista"
                            onClick={() => handleDelete(sub)}
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
                    <td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">
                      No hay suscriptores registrados aún.
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
  );
}
