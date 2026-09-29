"use client";

import { SortableHeader } from "@/presentation/atoms/SortableHeader";
import { useTableSort } from "@/presentation/hooks/useTableSort";
import { Button } from "@/presentation/atoms/button";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Clock,
  DollarSign,
  ExternalLink,
  Filter,
  LayoutGrid,
  List,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  Sparkles,
  Store,
  Users,
  X,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/presentation/atoms/alert-dialog";
import { useAdminOrders, useAdminStats } from "@/presentation/hooks/useOrders";
import { formatPrice } from "@/shared/lib/format";
import { ORDER_STATUS_CLASSES, ORDER_STATUS_LABELS, formatOrderDate } from "@/shared/lib/orderStatus";
import { ORDER_STATUSES, type Order, type OrderStatus } from "@/domain/entities/Order";

function StatusSelect({
  value,
  onChange,
  disabled,
}: {
  value: OrderStatus;
  onChange: (status: OrderStatus) => void;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value as OrderStatus)}
      className="rounded-xl border border-neutral-200 bg-white px-2.5 py-1 text-xs font-semibold outline-none focus:border-[#FF6A00] cursor-pointer"
    >
      {ORDER_STATUSES.map((status) => (
        <option key={status} value={status}>
          {ORDER_STATUS_LABELS[status]}
        </option>
      ))}
    </select>
  );
}

function AdminDashboardContent() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "todos">("todos");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { sortParams, headerProps } = useTableSort(() => setPage(1));
  const [pendingStatus, setPendingStatus] = useState<{
    orderId: number;
    orderNumber: string;
    status: OrderStatus;
  } | null>(null);

  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: ordersData, isLoading: ordersLoading, updateStatus, isUpdating } = useAdminOrders({
    status: statusFilter,
    search,
    page,
    ...sortParams,
  });

  const orders: Order[] = ordersData?.items ?? [];
  const totalPages = Math.max(1, ordersData?.lastPage ?? 1);

  return (
    <div className="space-y-8 select-none">
        
        {/* CABECERA: TÍTULO Y ACCIONES RÁPIDAS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#0F172A] flex items-center justify-center text-[#18D6D1]">
                <Store className="w-5 h-5" />
              </div>
              <h1
                className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Panel Administrador
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 pl-1">
              Gestión operativa de órdenes, productos y métricas de UNO COMPRAS.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              href="/admin/productos"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6A00] hover:bg-[#e65f00] text-white rounded-full text-xs font-bold tracking-wider uppercase transition-all shadow-sm active:scale-95"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              <Plus className="w-4 h-4" /> Nuevo Producto
            </Link>
          </div>
        </div>

        {/* 1. SECCIÓN: QUICK ACCESS / TARJETAS FOLDER ADMIN */}
        <div className="space-y-3.5">
          <h2
            className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500 pl-1"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Métricas Principales
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Folder 1: Pedidos Totales (Naranja destacado) */}
            <div className="bg-gradient-to-br from-[#FF6A00] to-orange-600 text-white rounded-[26px] p-5 shadow-lg shadow-orange-500/20 flex flex-col justify-between min-h-[150px]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/80" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Órdenes Totales
                </span>
                <ShoppingCart className="w-4 h-4 text-white/90" />
              </div>
              <div className="my-2">
                <p className="text-3xl font-black text-white">
                  {statsLoading ? "…" : stats?.totalOrders ?? 0}
                </p>
                <p className="text-xs text-white/80 mt-1">Registradas en el sistema</p>
              </div>
              <Link href="/admin/productos" className="text-[11px] font-semibold text-white/90 hover:underline flex items-center justify-between">
                <span>Ver pedidos</span>
                <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
              </Link>
            </div>

            {/* Folder 2: Productos Activos */}
            <div className="bg-white border border-neutral-200/80 rounded-[26px] p-5 shadow-xs flex flex-col justify-between min-h-[150px] hover:border-[#18D6D1] transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Catálogo
                </span>
                <Package className="w-4 h-4 text-[#00a6a0]" />
              </div>
              <div className="my-2">
                <p className="text-3xl font-black text-neutral-900">
                  {statsLoading ? "…" : stats?.totalProducts ?? 0}
                </p>
                <p className="text-xs text-neutral-500 mt-1">Productos publicados</p>
              </div>
              <Link href="/admin/productos" className="text-[11px] font-semibold text-[#00a6a0] hover:underline flex items-center justify-between">
                <span>Gestionar catálogo</span>
                <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
              </Link>
            </div>

            {/* Folder 3: Suscriptores */}
            <div className="bg-white border border-neutral-200/80 rounded-[26px] p-5 shadow-xs flex flex-col justify-between min-h-[150px] hover:border-[#FF6A00] transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Comunidad
                </span>
                <Users className="w-4 h-4 text-[#FF6A00]" />
              </div>
              <div className="my-2">
                <p className="text-3xl font-black text-neutral-900">
                  {statsLoading ? "…" : stats?.totalClients ?? 0}
                </p>
                <p className="text-xs text-neutral-500 mt-1">Usuarios & Clientes</p>
              </div>
              <Link href="/admin/suscriptores" className="text-[11px] font-semibold text-[#FF6A00] hover:underline flex items-center justify-between">
                <span>Ver suscriptores</span>
                <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
              </Link>
            </div>

            {/* Folder 4: Ofertas & Blog */}
            <div className="bg-white border border-neutral-200/80 rounded-[26px] p-5 shadow-xs flex flex-col justify-between min-h-[150px] hover:border-neutral-400 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Contenidos
                </span>
                <Sparkles className="w-4 h-4 text-neutral-700" />
              </div>
              <div className="my-2">
                <p className="text-base font-bold text-neutral-900" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Blog & Ofertas
                </p>
                <p className="text-xs text-neutral-500 mt-1">Artículos y promociones flash</p>
              </div>
              <Link href="/admin/blog" className="text-[11px] font-semibold text-neutral-700 hover:underline flex items-center justify-between">
                <span>Administrar blog</span>
                <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
              </Link>
            </div>

          </div>
        </div>

        {/* 2. SECCIÓN: TABLA DE GESTIÓN DE PEDIDOS */}
        <div className="space-y-4">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-xs">
            <div className="flex items-center gap-3">
              <h2
                className="text-sm font-bold uppercase tracking-wider text-neutral-800"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Órdenes de Compra
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-xs font-extrabold">
                {ordersData?.total ?? 0}
              </span>
            </div>

            {/* Buscador */}
            <div className="flex-1 max-w-xs relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Buscar por cliente o código..."
                className="w-full pl-9 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-full text-xs text-neutral-800 placeholder-neutral-400 outline-none focus:bg-white focus:border-[#FF6A00]"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => { setSearch(""); setPage(1); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Filtros por estado */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {(["todos", ...ORDER_STATUSES] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => { setStatusFilter(st); setPage(1); }}
                  className={'px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ' + (statusFilter === st ? "bg-[#0F172A] text-white font-bold" : "bg-neutral-100 text-neutral-500 hover:text-neutral-800")}
                >
                  {st === "todos" ? "Todos" : ORDER_STATUS_LABELS[st]}
                </button>
              ))}
            </div>
          </div>

          {/* TABLA ADMIN */}
          {ordersLoading ? (
            <div className="bg-white rounded-3xl border border-neutral-200/80 p-8 space-y-3 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-neutral-100 rounded-2xl" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-neutral-200 p-12 text-center text-neutral-400">
              No hay pedidos que coincidan con los filtros.
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-100 text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-400 bg-neutral-50/50">
                      <SortableHeader label="Código & Cliente" column="order_number" {...headerProps} className="py-3.5 px-5" align="left" sortLabel="Código del pedido" />
                      <SortableHeader label="Fecha" column="created_at" {...headerProps} className="py-3.5 px-4" align="left" />
                      <SortableHeader label="Items" column="items_count" {...headerProps} className="py-3.5 px-4" align="left" />
                      <SortableHeader label="Total" column="total" {...headerProps} className="py-3.5 px-4 text-right" align="right" />
                      <SortableHeader label="Cambiar Estado" column="status" {...headerProps} className="py-3.5 px-5 text-center" align="center" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-xs">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-neutral-100 text-neutral-600 flex items-center justify-center shrink-0">
                              <Package className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-mono font-bold text-neutral-900 block">
                                {order.orderNumber}
                              </span>
                              <span className="text-[11px] text-neutral-400">
                                {order.user?.name ?? "Cliente"} · {order.user?.email ?? ""}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-neutral-500 whitespace-nowrap">
                          {formatOrderDate(order.createdAt)}
                        </td>

                        <td className="py-3.5 px-4 text-neutral-600 whitespace-nowrap">
                          {order.items.length} {order.items.length === 1 ? "artículo" : "artículos"}
                        </td>

                        <td className="py-3.5 px-4 text-right font-bold text-neutral-900 whitespace-nowrap">
                          {formatPrice(order.total)}
                        </td>

                        <td className="py-3.5 px-5 text-center whitespace-nowrap">
                          <StatusSelect
                            value={order.status}
                            disabled={isUpdating}
                            onChange={(newStatus) => {
                              if (newStatus !== order.status) {
                                setPendingStatus({
                                  orderId: order.id,
                                  orderNumber: order.orderNumber,
                                  status: newStatus,
                                });
                              }
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {!ordersLoading && totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 px-5 py-3 text-xs text-muted-foreground">
              <span>Página {page} de {totalPages} · {ordersData?.total ?? 0} pedidos</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Anterior</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Siguiente</Button>
              </div>
            </div>
          )}
        </div>

        {/* DIÁLOGO DE CONFIRMACIÓN DE CAMBIO DE ESTADO */}
        {pendingStatus && (
          <AlertDialog
            open={!!pendingStatus}
            onOpenChange={(open) => {
              if (!open) setPendingStatus(null);
            }}
          >
            <AlertDialogContent className="rounded-3xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Cambiar estado del pedido</AlertDialogTitle>
                <AlertDialogDescription>
                  ¿Deseas cambiar el estado del pedido <strong>{pendingStatus.orderNumber}</strong> a{" "}
                  <strong>{ORDER_STATUS_LABELS[pendingStatus.status]}</strong>?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-full">Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="rounded-full bg-[#FF6A00] hover:bg-[#e65f00] text-white"
                  onClick={async () => {
                    await updateStatus({
                      id: pendingStatus.orderId,
                      status: pendingStatus.status,
                    });
                    setPendingStatus(null);
                  }}
                >
                  Confirmar Cambio
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

      </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={null}>
      <AdminDashboardContent />
    </Suspense>
  );
}
