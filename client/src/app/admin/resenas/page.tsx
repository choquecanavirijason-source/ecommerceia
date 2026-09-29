"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Check, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MessageSquare, 
  Star, 
  Trash2, 
  X, 
  XCircle 
} from "lucide-react";
import { 
  useAdminReviews, 
  useReviewStats, 
  useToggleReviewApproval, 
  useDeleteReview 
} from "@/presentation/hooks/useAdminReviews";
import { StarRating } from "@/presentation/molecules/StarRating";
import { ApiError } from "@/infrastructure/http/client";

export default function AdminReviewsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdminReviews({
    status: statusFilter,
    rating: ratingFilter,
    page,
  });

  const { data: stats } = useReviewStats();
  const toggleApprovalMutation = useToggleReviewApproval();
  const deleteMutation = useDeleteReview();

  const handleDelete = async (id: number, userName: string) => {
    if (!window.confirm(`¿Eliminar la reseña de "${userName}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Error al eliminar reseña.");
    }
  };

  const reviews = data?.data ?? [];
  const totalPages = data?.meta?.last_page ?? 1;

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-heading">
            Moderación de Reseñas
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Supervisá, aprobá y moderá las opiniones y calificaciones de los clientes
          </p>
        </div>

        {/* Stats KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-border p-4 shadow-xs">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold mb-1">
              <MessageSquare className="w-4 h-4" />
              <span>Total Reseñas</span>
            </div>
            <p className="text-2xl font-black text-gray-900">{stats?.total ?? 0}</p>
          </div>

          <div className="bg-white rounded-2xl border border-border p-4 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Aprobadas</span>
            </div>
            <p className="text-2xl font-black text-emerald-600">{stats?.approved ?? 0}</p>
          </div>

          <div className="bg-white rounded-2xl border border-border p-4 shadow-xs">
            <div className="flex items-center gap-2 text-amber-500 text-xs font-semibold mb-1">
              <Clock className="w-4 h-4" />
              <span>Pendientes</span>
            </div>
            <p className="text-2xl font-black text-amber-500">{stats?.pending ?? 0}</p>
          </div>

          <div className="bg-white rounded-2xl border border-border p-4 shadow-xs">
            <div className="flex items-center gap-2 text-primary text-xs font-semibold mb-1">
              <Star className="w-4 h-4" />
              <span>Promedio General</span>
            </div>
            <p className="text-2xl font-black text-primary">
              {stats?.averageRating ? stats.averageRating.toFixed(1) : "0.0"} ★
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-border p-4 mb-6 shadow-xs flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-primary focus:bg-white"
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendientes de moderación</option>
            <option value="approved">Aprobadas</option>
          </select>

          <select
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setPage(1);
            }}
            className="text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-primary focus:bg-white"
          >
            <option value="">Todas las calificaciones</option>
            <option value="5">5 estrellas ★★★★★</option>
            <option value="4">4 estrellas ★★★★☆</option>
            <option value="3">3 estrellas ★★★☆☆</option>
            <option value="2">2 estrellas ★★☆☆☆</option>
            <option value="1">1 estrella  ★☆☆☆☆</option>
          </select>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-xs">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground">Cargando reseñas...</div>
          ) : reviews.length === 0 ? (
            <div className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-800">No hay reseñas para mostrar</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Las reseñas de clientes aparecerán aquí para moderación y publicación.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {reviews.map((r) => (
                <div key={r.id} className="p-4 sm:p-6 hover:bg-gray-50/50 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <StarRating rating={r.rating} small />
                      <span className="text-xs font-bold text-gray-900">
                        {r.productName || "Producto desconocido"}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString("es-AR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {r.title && (
                      <h4 className="text-sm font-bold text-gray-900">{r.title}</h4>
                    )}

                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      "{r.comment}"
                    </p>

                    <div className="text-xs text-muted-foreground">
                      Por: <span className="font-semibold text-gray-800">{r.userName}</span>
                      {r.userEmail && <span> ({r.userEmail})</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleApprovalMutation.mutate(r.id)}
                      disabled={toggleApprovalMutation.isPending}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        r.isApproved
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                      }`}
                    >
                      {r.isApproved ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Aprobada</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pendiente (Aprobar)</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(r.id, r.userName)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      title="Eliminar reseña"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Página {page} de {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-2 rounded-lg border border-border disabled:opacity-40 hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 rounded-lg border border-border disabled:opacity-40 hover:bg-gray-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
  );
}
