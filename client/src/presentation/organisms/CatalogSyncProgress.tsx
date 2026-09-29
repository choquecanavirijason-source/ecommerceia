"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, RefreshCw, X } from "lucide-react";
import { useCompareStore } from "@/infrastructure/state/compareStore";
import { useCatalogSync } from "@/presentation/hooks/useCatalogSync";
import { CatalogSyncModal } from "@/presentation/organisms/CatalogSyncModal";

const number = (value: number) => value.toLocaleString("es-AR");
const control = "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary cursor-pointer";

export function CatalogSyncProgress() {
  const sync = useCatalogSync();
  // Customers/guests neither see the panel nor mount the administrator modal.
  if (!sync.isAdmin) return null;

  return <>
    <CatalogSyncModal key={sync.adminId} />
    <ProgressPanel key={`${sync.adminId}:${sync.data?.id}`} />
  </>;
}

function ProgressPanel() {
  const sync = useCatalogSync();
  const data = sync.data;
  const pathname = usePathname() ?? "/";
  const compareCount = useCompareStore((state) => state.items.length);
  const [minimized, setMinimized] = useState(false);
  const storageKey = `catalog-sync-dismissed:${sync.adminId}:${data?.id}`;
  const [dismissed, setDismissed] = useState<string | null>(() => {
    try { return window.sessionStorage.getItem(storageKey); } catch { return null; }
  });

  if (!data || sync.isModalOpen || dismissed === data.status) return null;
  const active = data.status === "scanning" || data.status === "applying";
  // Keep recent results, without showing an old notification at every login.
  if (!active && data.status !== "ready" && Date.now() - new Date(data.updated_at).getTime() > 10 * 60 * 1000) return null;

  const scanning = data.status === "scanning";
  const applied = data.status === "applied";
  const done = scanning ? data.progress.pages_done : data.progress.images_done;
  const total = scanning ? data.progress.pages_total : data.progress.images_total;
  const saving = data.status === "applying" && total > 0 && done >= total;
  const percentage = total > 0 ? Math.min(100, Math.round(done / total * 100)) : null;
  const attention = data.stalled || !!sync.error || data.status === "failed";
  const title = sync.error ? "Sin conexión con el progreso" : data.stalled ? "Esperando al servicio de actualización"
    : scanning ? "Consultando catálogo" : saving ? "Guardando cambios…" : data.status === "applying" ? "Preparando productos"
    : data.status === "ready" ? "Consulta lista para revisar" : applied ? "Catálogo actualizado"
    : data.status === "cancelled" ? "Consulta detenida" : "No se pudo completar";
  const compareVisible = compareCount > 0 && !pathname.startsWith("/admin") && !pathname.startsWith("/cuenta");

  function dismiss() {
    setDismissed(data!.status);
    try { window.sessionStorage.setItem(storageKey, data!.status); } catch { /* Closing still works without storage. */ }
  }

  return <aside aria-label="Progreso de actualización del catálogo"
    className={`fixed right-4 z-40 w-[calc(100%-2rem)] max-w-sm overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-xl ${compareVisible ? "bottom-32" : "bottom-[max(1rem,env(safe-area-inset-bottom))]"}`}>
    <div className="flex items-center gap-2 border-b border-border px-3 py-2">
      {attention ? <AlertCircle aria-hidden="true" className="h-5 w-5 shrink-0 text-amber-600" />
        : active ? <RefreshCw aria-hidden="true" className="h-5 w-5 shrink-0 animate-spin motion-reduce:animate-none text-primary" />
        : <CheckCircle2 aria-hidden="true" className={`h-5 w-5 shrink-0 ${applied ? "text-emerald-600" : "text-primary"}`} />}
      <p aria-live="polite" className="min-w-0 flex-1 text-sm font-semibold">{title}</p>
      <button type="button" className={control} onClick={() => setMinimized(!minimized)} aria-expanded={!minimized}
        aria-controls="catalog-progress-body" aria-label={minimized ? "Expandir progreso" : "Minimizar progreso"}>
        {minimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {!active && <button type="button" className={control} onClick={dismiss} aria-label="Ocultar resultado"><X className="h-4 w-4" /></button>}
    </div>
    {minimized ? active && <progress aria-label="Avance del catálogo" max={100} value={saving ? undefined : percentage ?? undefined} className="block h-1 w-full accent-primary" />
      : <div id="catalog-progress-body" className="space-y-3 p-4">
        {sync.error ? <p className="text-sm text-muted-foreground">No podemos consultar el avance. El servidor puede seguir trabajando; lo comprobaremos al recuperar la conexión.</p>
          : data.stalled ? <p className="text-sm text-muted-foreground">Hace unos minutos que no hay avances. El progreso guardado se conserva. Abrí el detalle para intentar retomarlo.</p>
          : active ? <>
            <progress aria-label={scanning ? "Páginas consultadas" : "Preparación de productos"} max={100} value={saving ? undefined : percentage ?? undefined} className="block h-2 w-full accent-primary" />
            <p className="text-sm tabular-nums">{saving ? "Guardando la actualización en tu tienda." : total === 0 ? "Esperando que comience el procesamiento…"
              : `${number(done)} de ${number(total)} ${scanning ? "páginas consultadas" : "productos preparados"} · ${percentage}%`}</p>
            <p className="text-xs text-muted-foreground">Podés seguir navegando. {scanning ? "Tu catálogo todavía no cambia." : "Primero preparamos las imágenes y después guardamos los cambios."}</p>
          </> : data.status === "ready" ? <p className="text-sm text-muted-foreground">Revisá los cambios encontrados antes de actualizar tu tienda. Todavía no se guardó ningún cambio.</p>
            : applied ? <p className="text-sm text-muted-foreground">{number(data.counts?.create ?? 0)} agregados · {number(data.counts?.update ?? 0)} actualizados · {number(data.counts?.deactivate ?? 0)} ocultados.</p>
              : <p className="text-sm text-muted-foreground">{data.status === "cancelled" ? "La consulta se detuvo sin modificar tu catálogo." : "Abrí el detalle para revisar qué pasó y cómo continuar."}</p>}
        <button type="button" onClick={sync.openDetails} className="min-h-10 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer">
          {data.status === "ready" ? "Revisar cambios" : "Ver detalle"}
        </button>
      </div>}
  </aside>;
}
