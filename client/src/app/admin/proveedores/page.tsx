"use client";

import { SortableHeader } from "@/presentation/atoms/SortableHeader";
import { useTableSort } from "@/presentation/hooks/useTableSort";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Globe, 
  Mail, 
  Pencil, 
  Phone, 
  Plus, 
  Search, 
  Trash2, 
  Truck, 
  X 
} from "lucide-react";
import { Button } from "@/presentation/atoms/button";
import { 
  useAdminSuppliers, 
  useToggleSupplierStatus, 
  useDeleteSupplier 
} from "@/presentation/hooks/useSuppliers";
import { Supplier } from "@/domain/entities/Supplier";
import { ApiError } from "@/infrastructure/http/client";
import { SupplierForm } from "./form";

const PAGE_SIZE = 10;

export default function AdminSuppliersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const { sortParams, headerProps } = useTableSort(() => setPage(1));

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const { data, isLoading } = useAdminSuppliers({
    search,
    status: statusFilter,
    page,
    ...sortParams,
  });

  const toggleStatusMutation = useToggleSupplierStatus();
  const deleteMutation = useDeleteSupplier();

  const openCreateModal = () => {
    setEditingSupplier(null);
    setModalOpen(true);
  };

  const openEditModal = (s: Supplier) => {
    setEditingSupplier(s);
    setModalOpen(true);
  };

  const handleToggleStatus = async (s: Supplier) => {
    try {
      await toggleStatusMutation.mutateAsync(s.id);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Error al cambiar estado.");
    }
  };

  const handleDelete = async (s: Supplier) => {
    if (!window.confirm(`¿Eliminar el proveedor "${s.name}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(s.id);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Error al eliminar proveedor.");
    }
  };

  const suppliers = data?.data ?? [];
  const totalPages = data?.meta?.last_page ?? 1;

  return (
    <>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-heading">
              Proveedores y Marcas
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Administrá los fabricantes, distribuidores y contactos oficiales de tus productos
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-[#FF6A00] hover:bg-[#e65f00] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Nuevo Proveedor
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white rounded-2xl border border-border p-4 mb-6 shadow-xs flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por nombre, CUIT/RUT, contacto o email..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary focus:bg-white transition-all"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-primary focus:bg-white"
          >
            <option value="">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>

        {/* Table / Cards */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-xs">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground">Cargando proveedores...</div>
          ) : suppliers.length === 0 ? (
            <div className="p-12 text-center">
              <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-800">No se encontraron proveedores</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Probá con otro término de búsqueda o creá tu primer proveedor.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-gray-50 text-xs font-bold uppercase text-muted-foreground tracking-wider">
                    <SortableHeader label="Proveedor / CUIT" column="name" {...headerProps} className="py-3.5 px-4" align="left" sortLabel="Nombre del proveedor" />
                    <SortableHeader label="Contacto" column="contact_name" {...headerProps} className="py-3.5 px-4" align="left" />
                    <SortableHeader label="Canales" column="email" {...headerProps} className="py-3.5 px-4" align="left" sortLabel="Correo del proveedor" />
                    <SortableHeader label="Productos" column="products_count" {...headerProps} className="py-3.5 px-4 text-center" align="center" />
                    <SortableHeader label="Estado" column="is_active" {...headerProps} className="py-3.5 px-4 text-center" align="center" />
                    <th className="py-3.5 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {suppliers.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-4 px-4 font-semibold text-gray-900">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF6A00] flex items-center justify-center shrink-0 font-bold">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block">{s.name}</span>
                            {s.code && (
                              <span className="text-xs text-muted-foreground">CUIT/RUT: {s.code}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-gray-600">
                        {s.contactName ? (
                          <span>{s.contactName}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Sin asignar</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-xs space-y-1">
                        {s.email && (
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span>{s.email}</span>
                          </div>
                        )}
                        {s.phone && (
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span>{s.phone}</span>
                          </div>
                        )}
                        {s.website && (
                          <div className="flex items-center gap-1.5 text-primary">
                            <Globe className="w-3.5 h-3.5 shrink-0" />
                            <a href={s.website} target="_blank" rel="noreferrer" className="hover:underline">
                              Sitio Web
                            </a>
                          </div>
                        )}
                        {!s.email && !s.phone && !s.website && (
                          <span className="text-muted-foreground italic">—</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-secondary text-foreground">
                          {s.productsCount}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleStatusMutation.mutate(s.id)}
                          className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full transition-all ${
                            s.isActive
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${s.isActive ? "bg-emerald-600" : "bg-gray-400"}`} />
                          {s.isActive ? "Activo" : "Inactivo"}
                        </button>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(s)}
                            className="p-1.5 text-gray-500 hover:text-primary hover:bg-orange-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(s)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

      {/* Modal Crear / Editar Proveedor */}
      <SupplierForm
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingSupplier(null);
        }}
        supplier={editingSupplier}
      />
    </>
  );
}
