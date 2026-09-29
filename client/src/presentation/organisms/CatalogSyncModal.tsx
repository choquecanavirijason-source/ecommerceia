"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, RefreshCw } from "lucide-react";
import { Modal } from "@/presentation/molecules/Modal";
import { useCategories } from "@/presentation/hooks/useCatalog";
import { useCatalogSync, type CatalogSyncFilter, type CatalogSyncItem } from "@/presentation/hooks/useCatalogSync";

const number = (value: number) => value.toLocaleString("es-AR");
const money = (value: string | null | undefined) => value == null ? "Sin dato" : `$ ${Number(value).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const button = "inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
const primary = `${button} !bg-primary !text-white !border-primary`;
const input = "rounded-xl border border-border bg-white p-2.5 text-sm max-w-full min-w-0";
const groups = [
  { key: "create", title: "Para agregar", description: "Aparecen en la web y se proponen como nuevos en tu tienda." },
  { key: "update", title: "Para actualizar", description: "Ya están en tu tienda. Se revisarán sus datos e imágenes." },
  { key: "deactivate", title: "Para revisar y ocultar", description: "Ya no aparecen en la web. Podrían estar descontinuados." },
  { key: "unchanged", title: "Sin cambios", description: "Coinciden con la información consultada." },
] as const;
const issueHelp: Record<string, string> = {
  category: "No encontramos una categoría equivalente. Podés elegirla en «Corregir información pendiente».",
  stock: "La web no informa una cantidad por bulto válida. Completala solo si la conocés; de lo contrario, dejá este producto para después.",
  price: "El precio de la web no se pudo interpretar. Dejá este producto para después hasta verificarlo.",
  name: "El nombre está vacío o no es válido. Dejá este producto para después hasta verificarlo.",
  identity: "No pudimos identificar con seguridad qué producto local corresponde a este código. Dejalo para después y pedí una revisión.",
  conflict: "El mismo código tiene datos distintos en las páginas consultadas. Dejalo para después hasta verificarlo.",
};

function reason(item: CatalogSyncItem) {
  if (item.skipped) return "Se dejó para después. Esta actualización no modificó el producto.";
  if (item.issues.includes("identity")) return "Este código requiere una revisión antes de agregar o actualizar el producto.";
  if (item.action === "deactivate") return "Está en tu tienda, pero no apareció al recorrer el catálogo externo completo. Se propone ocultarlo, sin eliminarlo.";
  if (item.action === "create") return "Encontramos este código en la web y no tiene un producto local identificado. Se propone agregarlo.";
  if (item.action === "unchanged") return "La información coincide con tu tienda. No necesita cambios.";
  const changed: string[] = [];
  if (item.before) {
    if (item.before.name !== item.payload.name) changed.push("nombre");
    if (item.payload.price !== null && Number(item.before.price) !== Number(item.payload.price)) changed.push("precio");
    if (item.payload.stock !== null && item.before.stock !== item.payload.stock) changed.push("cantidad");
    if (item.payload.category_id !== null && item.before.category_id !== item.payload.category_id) changed.push("categoría");
    if (!item.before.is_active) changed.push("estado visible");
  }
  return changed.length ? `La información consultada cambia: ${changed.join(", ")}. También se revisarán las imágenes.`
    : "Los datos visibles pueden coincidir. Se revisarán las imágenes y se guardará la identificación para futuras consultas.";
}

function SyncThumbnail({ src }: { src?: string }) {
  const [failed, setFailed] = useState(false);
  return src && !failed
    ? <img src={src} alt="" className="h-12 w-12 shrink-0 rounded-lg object-contain" onError={() => setFailed(true)} />
    : <span className="flex h-12 w-12 shrink-0 items-center rounded-lg bg-muted p-1 text-center text-[10px] text-muted-foreground">Sin imagen</span>;
}

export function CatalogSyncButton() {
  const sync = useCatalogSync();
  if (!sync.isAdmin) return null;
  const active = sync.data && ["scanning", "applying"].includes(sync.data.status);
  return <button type="button" className={button} disabled={sync.start.isPending || sync.recovering} onClick={sync.openDetails}>
    <RefreshCw className={`h-4 w-4 shrink-0 ${active ? "animate-spin" : ""}`} /> Actualizar catálogo
  </button>;
}

export function CatalogSyncModal() {
  const [confirming, setConfirming] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [stocks, setStocks] = useState<Record<number, string>>({});
  const [stockError, setStockError] = useState("");
  const [now, setNow] = useState(0);
  const top = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const sync = useCatalogSync();
  const open = sync.isModalOpen;
  const setOpen = sync.setModalOpen;
  const { data: categories } = useCategories();
  const data = sync.data;
  const ready = data?.status === "ready";
  const applied = data?.status === "applied";
  const active = data && ["scanning", "applying"].includes(data.status);
  const busy = sync.start.isPending || sync.apply.isPending || sync.resolve.isPending || sync.cancel.isPending;
  const unsaved = Object.values(mappings).some(Boolean) || Object.values(stocks).some((value) => value !== "");
  const pending = data?.counts?.pending ?? 0;
  const expired = ready && !!data?.expires_at && now >= new Date(data.expires_at).getTime();
  const eligible = data?.summary?.eligible;
  const hasChanges = !!eligible && eligible.create + eligible.update + eligible.deactivate > 0;
  const error = sync.start.error || sync.resolve.error || sync.apply.error || sync.cancel.error || sync.error;
  const canContinue = ready && !!eligible && !busy && !sync.isFetching && !expired && !unsaved;

  useEffect(() => {
    if (!open || !ready) return;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [open, ready, data?.expires_at]);

  function changeStep(value: boolean) {
    setConfirming(value);
    setDetailsOpen(false);
    top.current?.scrollIntoView({ block: "start" });
  }

  function start(fresh: boolean) {
    if (fresh && unsaved && !window.confirm("Volver a consultar descarta las correcciones que todavía no guardaste. ¿Continuar?")) return;
    setConfirming(false);
    setMappings({});
    setStocks({});
    setDetailsOpen(false);
    setStockError("");
    sync.begin(fresh);
  }

  function showGroup(filter: CatalogSyncFilter) {
    sync.setFilter(filter);
    sync.setPage(1);

  }

  async function saveResolutions() {
    const stockValues = Object.entries(stocks).filter(([, value]) => value !== "");
    if (stockValues.some(([, value]) => !/^\d+$/.test(value) || Number(value) > 2147483647)) {
      setStockError("Ingresá cantidades enteras, sin decimales, entre 0 y 2147483647.");
      return;
    }
    setStockError("");
    try {
      await sync.resolve.mutateAsync({
        mappings: Object.entries(mappings).filter(([, value]) => value !== "").map(([external_category, value]) => ({ external_category, category_id: Number(value) })),
        stocks: stockValues.map(([item_id, value]) => ({ item_id: Number(item_id), stock: Number(value) })),
      });
      setMappings({});
      setStocks({});
    } catch { /* The error is displayed in the window. */ }
  }

  const categoryName = (id: number | null | undefined) => categories?.find((category) => category.id === id)?.name ?? "Sin asignar";

  if (!sync.isAdmin) return null;

  return <>
    <Modal isOpen={open} onClose={() => setOpen(false)} title="Actualizar catálogo" maxWidth={detailsOpen ? "5xl" : "2xl"}
      subtitle={data?.status === "applying" ? "La actualización está en curso." : applied ? "Los cambios ya se guardaron." : confirming ? "Confirmá los cambios que se guardarán en tu tienda." : "Revisá el resumen antes de guardar los cambios."}
      bodyClassName="!p-4 sm:!p-6" closeOnBackdropClick={false}
      footer={<div className="w-full space-y-2">
        {ready && unsaved && <p className="text-xs text-muted-foreground" role="status">Guardá las correcciones para actualizar el resumen.</p>}
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" className={button} onClick={() => confirming && ready ? changeStep(false) : setOpen(false)}>{confirming && ready ? "Volver" : "Cerrar"}</button>
          {ready && expired ? <button type="button" className={primary} disabled={busy} onClick={() => start(true)}>Consultar de nuevo</button>
            : ready && !confirming && unsaved ? <button type="button" className={primary} disabled={busy} onClick={saveResolutions}>Guardar correcciones</button>
            : ready && hasChanges && <button type="button" className={primary} disabled={!canContinue} onClick={() => confirming ? sync.apply.mutate(pending > 0) : changeStep(true)}>
              {sync.apply.isPending ? "Enviando…" : confirming ? "Confirmar actualización" : "Continuar"}<ArrowRight className="h-4 w-4 shrink-0" />
            </button>}
        </div>
      </div>}>
      <div ref={top} className="scroll-mt-4" />
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error.message}</p>}
      {stockError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{stockError}</p>}
      {sync.start.isPending && <p role="status">Buscando una consulta reciente o iniciando una nueva…</p>}
      {active && data.stalled && <div role="alert" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900 space-y-2">
        <p>No registramos avances en los últimos 3 minutos. El servicio que procesa el catálogo puede estar detenido. El avance guardado se conserva.</p>
        <p>Podés intentar retomar el proceso. Si sigue igual, pedile al responsable del sistema que revise el servicio de actualización.</p>
        <button type="button" className={button} disabled={busy} onClick={() => start(false)}>Intentar retomar</button>
      </div>}
      {data?.status === "scanning" && <section role="status" className="rounded-2xl bg-secondary/10 p-5 space-y-3">
        <h3 className="font-semibold">Estamos leyendo el catálogo de la web</h3>
        <progress aria-label="Avance de la consulta" className="w-full accent-primary" value={data.progress.pages_done} max={Math.max(1, data.progress.pages_total)} />
        <p className="text-sm">{number(data.progress.products)} productos encontrados hasta ahora.</p>
        <p className="text-sm text-muted-foreground">{data.progress.pages_total > 0 ? `${number(data.progress.pages_done)} de ${number(data.progress.pages_total)} páginas revisadas.` : "Esperando que el servidor comience la lectura."}</p>
        <p className="text-sm text-muted-foreground">Puede tardar unos minutos. Podés ir a la tienda o cerrar esta ventana y volver: el servidor continúa mientras el servicio de actualización esté encendido. Tu tienda todavía no cambia.</p>
        <details className="text-xs"><summary className="cursor-pointer text-muted-foreground">Opciones de la consulta</summary><button type="button" className={`${button} mt-2`} disabled={busy} onClick={() => sync.cancel.mutate()}>Detener consulta</button></details>
      </section>}
      {data?.status === "applying" && <section role="status" className="rounded-2xl bg-secondary/10 p-5 space-y-3">
        <h3 className="font-semibold">Estamos preparando y guardando tu actualización</h3>
        <p className="text-sm">Primero preparamos las imágenes; después guardamos los cambios juntos. Esto puede tardar varios minutos.</p>
        <progress aria-label="Avance de la actualización" className="w-full accent-primary" value={data.progress.images_done} max={Math.max(1, data.progress.images_total)} />
        <p className="text-sm">{number(data.progress.images_done)} de {number(data.progress.images_total)} productos preparados.</p>
        <p className="text-sm text-muted-foreground">La actualización ya fue confirmada. Cerrar esta ventana no la cancela.</p>
      </section>}
      {data?.error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{data.error}</p>}
      {applied && <section role="status" className="rounded-2xl bg-emerald-50 p-5 text-emerald-900 space-y-2">
        <h3 className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-5 w-5" />Tu catálogo ya está actualizado</h3>
        <p className="text-sm">{number(data.counts?.create ?? 0)} agregados · {number(data.counts?.update ?? 0)} actualizados · {number(data.counts?.deactivate ?? 0)} ocultados.</p>
        <p className="text-sm">{number(data.counts?.skipped ?? 0)} quedaron para después. Los existentes conservaron sus datos; los nuevos pendientes no se agregaron.</p>
      </section>}
      {data?.status === "cancelled" && <p className="rounded-xl bg-muted p-4 text-sm">Consulta descartada. No se guardaron cambios en tu catálogo.</p>}
      {ready && expired && <p role="alert" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">La consulta venció. Volvé a consultar antes de confirmar: los precios y productos de la web pueden haber cambiado.</p>}

      {ready && eligible && <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">{!hasChanges ? "No hay cambios listos para aplicar" : confirming ? "¿Confirmás los cambios?" : "Resumen de cambios"}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{confirming ? "Se guardarán todos los cambios de este resumen." : "Tu catálogo todavía no se modificó."}</p>
        </div>
        <dl className="divide-y divide-border rounded-2xl border border-border px-4">
          {[["Productos nuevos", eligible.create], ["Productos a actualizar", eligible.update], ["Productos que se ocultarán", eligible.deactivate]].map(([label, count]) => <div key={label} className="flex items-center justify-between gap-4 py-3"><dt className="text-sm">{label}</dt><dd className="text-xl font-bold tabular-nums">{number(Number(count))}</dd></div>)}
        </dl>
        {eligible.deactivate > 0 && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Los {number(eligible.deactivate)} productos que ya no aparecen en la web se ocultarán de tu tienda. No se eliminan.</p>}
        {pending > 0 && <p className="text-sm text-muted-foreground"><strong>Dejaremos {number(pending)} productos para después</strong> porque tienen datos por revisar. Los existentes no cambian y los nuevos no se agregan.</p>}
        {confirming && <p className="text-xs text-muted-foreground">La actualización incluye todo el resumen, aunque hayas consultado una lista filtrada. Si querés revisar algo, elegí «Volver».</p>}
        {!confirming && <button type="button" className="text-sm font-semibold text-primary underline underline-offset-4" aria-expanded={detailsOpen} aria-controls="catalog-sync-details" onClick={() => setDetailsOpen(!detailsOpen)}>{detailsOpen ? "Ocultar detalles" : "Ver detalles (opcional)"}</button>}
      </section>}

      {(ready || applied) && !confirming && data?.summary && (detailsOpen || applied) && <div id="catalog-sync-details" className="space-y-4">
        <details className="rounded-xl bg-muted p-3 text-sm">
          <summary className="cursor-pointer font-semibold">¿De dónde salen los resultados?</summary>
          <p className="mt-2">{number(data.summary.external)} productos encontrados en la web + {number(data.summary.absent)} productos locales ausentes = {number(data.summary.compared)} resultados comparados.</p>
          <p className="mt-2 text-xs text-muted-foreground">Recorremos «Todas» y cada categoría. Algunos productos solo aparecen en su categoría y cada código se cuenta una vez. El resumen principal incluye solo los que se pueden procesar; los pendientes quedan fuera.</p>
          <p className="mt-2 text-xs text-muted-foreground">Consulta del {data.scanned_at ? new Date(data.scanned_at).toLocaleString("es-AR") : "—"}. Reutilizamos las consultas recientes para evitar esperas.</p>
        </details>
        {ready && pending > 0 && <details className="rounded-xl border border-border p-3">
          <summary className="cursor-pointer text-sm font-semibold">Corregir información pendiente (opcional)</summary>
          <p className="my-3 text-xs text-muted-foreground">No hace falta resolver estos productos para actualizar los demás. Si conocés los datos correctos, podés completarlos y guardar las correcciones.</p>
          <button type="button" className={button} onClick={() => { showGroup("pending"); list.current?.scrollIntoView({ block: "start" }); }}>Ver productos pendientes</button>
          {data.unmapped.length > 0 && <fieldset className="mt-4 space-y-3">
            <legend className="mb-2 text-sm font-semibold">Elegir categorías de tu tienda</legend>
            {data.unmapped.map((name) => <label key={name} className="flex flex-col gap-1.5 text-sm sm:flex-row sm:items-center sm:justify-between">
              <span>{name || "Productos sin categoría en la web"}</span>
              <select className={`${input} sm:w-64`} value={mappings[name] ?? ""} onChange={(event) => setMappings({ ...mappings, [name]: event.target.value })}>
                <option value="">Elegí una categoría</option>
                {categories?.filter((category) => category.name).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </label>)}
          </fieldset>}
        </details>}
        <section ref={list} className="scroll-mt-4 space-y-3 rounded-2xl border border-border p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-semibold">Detalle de la comparación</h3>
            <select aria-label="Filtrar resultados" className={input} value={sync.filter} onChange={(event) => showGroup(event.target.value as CatalogSyncFilter)}>
              <option value="all">Todos los resultados</option><option value="create">Para agregar</option><option value="update">Para actualizar</option>
              <option value="deactivate">Posibles descontinuados</option><option value="pending">Con información pendiente</option><option value="unchanged">Sin cambios</option>
            </select>
          </div>
          <p className="text-xs text-muted-foreground">El filtro solo cambia esta lista. No selecciona qué productos se guardarán.</p>
          {sync.filter === "deactivate" && <p className="rounded-xl bg-amber-50 p-3 text-sm">Estos productos no aparecieron en la web. Revisalos antes de confirmar: todos los de esta lista se ocultarán, sin eliminarlos.</p>}
          <p role="status" className="text-xs text-muted-foreground">{sync.isFetching ? "Cargando resultados…" : `${number(data.pagination.total)} resultados en esta lista`}</p>
          <div aria-busy={sync.isFetching} className={sync.isPlaceholderData ? "opacity-50 pointer-events-none" : ""}>
            {!data.items.length && <p className="rounded-xl bg-muted p-4 text-sm">No hay productos en este grupo.</p>}
            <div className="space-y-3">{data.items.map((item) => <article key={item.id} className="rounded-xl border border-border p-3 text-sm space-y-3">
              <div className="flex items-start gap-3"><SyncThumbnail key={item.payload.source_images[0] ?? item.id} src={item.payload.source_images[0]} /><div className="min-w-0"><strong className="break-words">{item.payload.name}</strong><p className="mt-1 text-xs text-muted-foreground">Código {item.supplier_sku} · {item.skipped ? "Dejado para después" : groups.find((group) => group.key === item.action)?.title ?? "En revisión"}</p></div></div>
              <p className="text-xs text-muted-foreground"><strong>¿Por qué aparece aquí?</strong> {reason(item)}</p>
              {item.issues.length > 0 && <ul className="space-y-1 rounded-xl bg-amber-50 p-3 text-xs text-amber-900">{item.issues.map((issue) => <li key={issue}>{issueHelp[issue] ?? "Este producto necesita una revisión antes de actualizarse."}</li>)}</ul>}
              <details><summary className="cursor-pointer text-xs font-semibold text-primary">Comparar datos actuales y propuestos</summary>
                <table className="mt-2 w-full table-fixed text-left text-xs"><thead><tr><th className="w-1/4 py-2">Dato</th><th className="px-1 py-2">En tu tienda</th><th className="px-1 py-2">Propuesta</th></tr></thead><tbody>
                  {[
                    ["Nombre", item.before?.name ?? "No existe", item.payload.name],
                    ["Precio", money(item.before?.price), money(item.payload.price)],
                    ["Cantidad", item.before ? number(item.before.stock) : "No existe", item.payload.stock === null ? "Falta confirmar" : number(item.payload.stock)],
                    ["Categoría", item.before ? categoryName(item.before.category_id) : "No existe", item.payload.category_id ? categoryName(item.payload.category_id) : "Falta elegir"],
                    ["Visible", item.before ? (item.before.is_active ? "Sí" : "No") : "No existe", item.action === "deactivate" ? "No" : "Sí"],
                  ].map(([label, before, after]) => <tr key={label} className="border-t border-border align-top"><th className="py-2 font-medium">{label}</th><td className="break-words px-1 py-2">{before}</td><td className="break-words px-1 py-2">{item.skipped ? "Sin aplicar" : after}</td></tr>)}
                </tbody></table>
                {item.issues.length > 0 && !item.skipped && <p className="mt-2 text-xs text-amber-800">Esta propuesta no se aplicará mientras el producto tenga pendientes.</p>}
              </details>
              {ready && item.issues.includes("stock") && <label className="flex flex-wrap items-center gap-2 text-xs">Cantidad por bulto, si la conocés:
                <input type="number" min="0" max="2147483647" step="1" aria-label={`Cantidad por bulto ${item.supplier_sku}`} className={`${input} w-32`} value={stocks[item.id] ?? ""} onChange={(event) => setStocks({ ...stocks, [item.id]: event.target.value })} />
              </label>}
            </article>)}</div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2"><button type="button" className={button} disabled={sync.isFetching || sync.page <= 1} onClick={() => showPage(sync.page - 1)}>Anterior</button><span className="text-xs">Página {data.pagination.page} de {data.pagination.last_page}</span><button type="button" className={button} disabled={sync.isFetching || sync.page >= data.pagination.last_page} onClick={() => showPage(sync.page + 1)}>Siguiente</button></div>
        </section>
        <details className="rounded-xl bg-muted p-3 text-xs text-muted-foreground"><summary className="cursor-pointer font-semibold">¿Qué datos se van a actualizar?</summary><p className="mt-2">Nombre, precio, categoría, imágenes, cantidad y visibilidad. La cantidad por bulto se usa como stock: no indica disponibilidad real en la web. Se conservan la identidad del producto, sus descripciones manuales y el proveedor asignado.</p><p className="mt-2">La ausencia en la web puede indicar una descontinuación, pero no la confirma. Al actualizar se ocultan todos los ausentes; esta ventana no permite elegirlos individualmente.</p></details>
      </div>}
      {!active && !confirming && !sync.start.isPending && (!ready || detailsOpen) && <div className="flex flex-wrap items-center gap-3 border-t border-border pt-3">
        <button type="button" className={button} disabled={busy} onClick={() => start(true)}>Volver a consultar la web</button>
        {ready && <button type="button" className="text-xs text-muted-foreground underline underline-offset-4" disabled={busy} onClick={() => sync.cancel.mutate()}>Descartar esta revisión</button>}
        <p className="text-xs text-muted-foreground">Una nueva consulta empieza otra revisión. No actualiza tu tienda automáticamente.</p>
      </div>}
    </Modal>
  </>;

  function showPage(page: number) {
    sync.setPage(page);
    list.current?.scrollIntoView({ block: "start" });
  }
}
