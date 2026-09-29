"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowRight,
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Image as ImageIcon, 
  Pencil, 
  Plus, 
  Trash2, 
  X 
} from "lucide-react";
import { 
  useAdminBanners, 
  useToggleBannerStatus, 
  useDeleteBanner,
  type BannerData
} from "@/presentation/hooks/useAdminBanners";
import { ApiError } from "@/infrastructure/http/client";
import { BannerForm } from "./form";

export default function AdminBannersPage() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerData | null>(null);

  const { data: banners, isLoading } = useAdminBanners({ position: "hero" });
  const toggleMutation = useToggleBannerStatus();
  const deleteMutation = useDeleteBanner();

  const openCreateModal = () => {
    setEditingBanner(null);
    setModalOpen(true);
  };

  const openEditModal = (b: BannerData) => {
    setEditingBanner(b);
    setModalOpen(true);
  };

  const handleDelete = async (b: BannerData) => {
    if (!b.id) return;
    if (!window.confirm(`¿Eliminar el banner "${b.title}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(b.id);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Error al eliminar banner.");
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-heading">
              Banners Principales (Hero Slider)
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Configurá los títulos, subtítulos, llamadas a la acción e imágenes que se muestran en la portada
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-[#FF6A00] hover:bg-[#e65f00] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Nuevo Banner
          </button>
        </div>

        {/* List of Banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full p-12 text-center text-muted-foreground">
              Cargando banners...
            </div>
          ) : (banners?.length ?? 0) === 0 ? (
            <div className="col-span-full bg-white rounded-3xl border border-border p-12 text-center">
              <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-800">No hay banners configurados</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Creá tu primer banner para mostrarlo en el carrusel de inicio.
              </p>
            </div>
          ) : (
            banners?.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-3xl border border-border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Live Mini Preview of Banner */}
                  <div
                    className={`relative h-44 bg-gradient-to-br ${b.bg} p-4 overflow-hidden flex flex-col justify-between`}
                  >
                    {/* Semicírculo inferior característico */}
                    <div
                      className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full border-[8px] pointer-events-none opacity-25"
                      style={{ borderColor: b.accent || "#FF6A00" }}
                    />

                    <div className="absolute right-0 top-0 w-1/2 h-full overflow-hidden">
                      <img
                        src={b.image}
                        alt=""
                        className="w-full h-full object-cover opacity-80"
                      />
                    </div>

                    <div className="relative z-10 max-w-[60%]">
                      {b.subtitle && (
                        <span
                          className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1"
                          style={{
                            backgroundColor: `${b.accent}20`,
                            color: b.accent,
                          }}
                        >
                          {b.subtitle}
                        </span>
                      )}
                      <h4
                        className="font-black text-sm leading-tight line-clamp-2"
                        style={{ color: b.accent }}
                      >
                        {b.title}
                      </h4>
                    </div>

                    <div className="relative z-10">
                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-white px-3 py-1 rounded-full shadow-xs"
                        style={{ backgroundColor: b.accent || "#FF6A00" }}
                      >
                        {b.cta || "Comprá ahora"}
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>

                  {/* Banner Info Details */}
                  <div className="p-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Orden de aparición: <strong>#{b.order}</strong></span>
                      <button
                        type="button"
                        onClick={() => b.id && toggleMutation.mutate(b.id)}
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] transition-colors ${
                          b.isActive
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {b.isActive ? "Activo" : "Inactivo"}
                      </button>
                    </div>

                    {b.desc && (
                      <p className="text-gray-600 line-clamp-2 leading-relaxed">
                        {b.desc}
                      </p>
                    )}

                    <div className="text-muted-foreground truncate">
                      Enlace: <span className="font-semibold text-gray-700">{b.linkUrl}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-3 border-t border-border bg-gray-50/50 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(b)}
                    className="p-1.5 text-gray-500 hover:text-primary hover:bg-orange-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(b)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Crear / Editar Banner */}
      <BannerForm
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingBanner(null);
        }}
        banner={editingBanner}
        defaultOrder={(banners?.length ?? 0) + 1}
      />
    </>
  );
}
