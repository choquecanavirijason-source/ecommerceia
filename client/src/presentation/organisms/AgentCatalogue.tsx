"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { agents, agentCategories, agentCollections } from "@/demo/agents";
import { defaultDiscoveryFilters, discoverAgents, readDiscoveryFilters, discoverySearchParams, type DiscoveryFilters } from "@/application/agents/discovery";
import { AgentCard } from "@/presentation/molecules/AgentCard";
import { autonomyLabels, pricingLabels } from "@/presentation/molecules/agentLabels";
import { AgentCollections } from "./AgentCollections";

const industries = [...new Set(agents.flatMap(agent => agent.industries))].sort();
const integrations = [...new Set(agents.flatMap(agent => agent.integrations))].sort();
const options = (values: readonly string[]) => values.map(value => [value, value] as const);
const controlClass = "mt-2 block min-h-11 w-full min-w-0 rounded-xl border border-[#1a3353] bg-[#0B1D34] p-3 focus:border-[#42C7E8]";
const buttonClass = "min-h-11 rounded-xl border border-[#287FF0]/40 px-4 py-2 text-sm font-semibold text-[#42C7E8] hover:bg-[#287FF0]/10 disabled:cursor-not-allowed disabled:opacity-40";

function FilterSelect({ label, value, choices, onChange }: {
  label: string; value: string; choices: readonly (readonly [string, string])[]; onChange: (value: string) => void;
}) {
  return <label className="min-w-0 text-sm">{label}
    <select value={value} onChange={event => onChange(event.target.value)} className={controlClass}>
      <option value="">Todas las opciones</option>
      {value && !choices.some(([key]) => key === value) && <option value={value}>{value} (no disponible)</option>}
      {choices.map(([key, title]) => <option key={key} value={key}>{title}</option>)}
    </select>
  </label>;
}

export function AgentCatalogue() {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const filters = readDiscoveryFilters(params);
  const results = discoverAgents(agents, agentCollections, filters);
  const collection = agentCollections.find(item => item.slug === filters.collection);
  const navigate = (next: DiscoveryFilters) => {
    const query = discoverySearchParams(next).toString();
    startTransition(() => router.push(`/agentes${query ? `?${query}` : ""}`, { scroll: false }));
  };
  const update = (changes: Partial<DiscoveryFilters>) => navigate({ ...filters, page: 1, ...changes });
  const hasFilters = discoverySearchParams({ ...filters, page: 1, sort: "relevance" }).size > 0;

  return <section className="mx-auto max-w-7xl px-4 py-12 sm:py-20">
    <p className="text-sm font-bold uppercase tracking-widest text-[#42C7E8]">Nuestros agentes</p>
    <h1 className="mt-3 text-3xl font-black sm:text-5xl">Encuentra tu próximo aliado de IA</h1>
    <p className="mt-4 text-[#91A7BC]">Busca una tarea, explora una colección o combina filtros para encontrar tu agente.</p>
    <p className="mt-4 rounded-xl border border-[#1a3353] bg-[#0B1D34] p-3 text-sm text-[#91A7BC]">Demo: integraciones, autonomía y modalidades de precio son ejemplos. No hay conexiones activas, ejecución ni cobros.</p>
    <AgentCollections collections={agentCollections} selectedSlug={filters.collection} />
    <div className="my-6 rounded-2xl border border-[#1a3353] p-4 sm:p-6">
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <form role="search" onSubmit={event => {
          event.preventDefault();
          update({ query: String(new FormData(event.currentTarget).get("q") ?? "").trim() });
        }} className="min-w-0">
          <label htmlFor="buscar-agentes" className="text-sm">Buscar agentes</label>
          <div className="flex flex-wrap items-end gap-2">
            <input key={params.toString()} id="buscar-agentes" name="q" type="search" defaultValue={filters.query}
              placeholder="Ej. atención WhatsApp" className={`${controlClass} flex-1 basis-40 scroll-mt-44`} />
            <button type="submit" className={buttonClass}>Buscar</button>
          </div>
        </form>
        <FilterSelect label="Categoría" value={filters.category} choices={agentCategories.map(item => [item.name, `${item.name} (${item.count})`])} onChange={category => update({ category })} />
      </div>
      <details className="mt-5" open={Boolean(filters.industry || filters.integration || filters.autonomy || filters.pricing)}>
        <summary className="cursor-pointer py-3 text-sm font-semibold text-[#42C7E8]">Filtros avanzados</summary>
        <div className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FilterSelect label="Industria" value={filters.industry} choices={options(industries)} onChange={industry => update({ industry })} />
          <FilterSelect label="Integración de ejemplo" value={filters.integration} choices={options(integrations)} onChange={integration => update({ integration })} />
          <FilterSelect label="Autonomía" value={filters.autonomy} choices={Object.entries(autonomyLabels)} onChange={autonomy => update({ autonomy: autonomy as DiscoveryFilters["autonomy"] })} />
          <FilterSelect label="Modalidad de precio" value={filters.pricing} choices={Object.entries(pricingLabels)} onChange={pricing => update({ pricing: pricing as DiscoveryFilters["pricing"] })} />
        </div>
      </details>
      {filters.collection && <p className="mt-4 text-sm text-[#42C7E8]">Colección: {collection?.title ?? "No disponible"} <button className="ml-2 min-h-11 underline" onClick={() => update({ collection: "" })}>Quitar colección</button></p>}
      {hasFilters && <button className={`${buttonClass} mt-4`} onClick={() => navigate(defaultDiscoveryFilters)}>Limpiar filtros</button>}
    </div>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
      <p role="status" className="text-sm text-[#91A7BC]">{pending ? "Actualizando resultados…" : `${results.total} agentes encontrados · Página ${results.page} de ${results.pages}`}</p>
      <label className="flex flex-wrap items-center gap-2 text-sm">Ordenar por
        <select value={filters.sort} onChange={event => update({ sort: event.target.value as DiscoveryFilters["sort"] })} className={`${controlClass} !mt-0 !w-auto`}>
          <option value="relevance">{filters.query ? "Relevancia" : "Selección del equipo"}</option>
          <option value="name">Nombre A–Z</option>
        </select>
      </label>
    </div>
    <div aria-busy={pending} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {results.items.map(agent => <AgentCard key={agent.slug} agent={agent} />)}
    </div>
    {results.total === 0 && <div className="rounded-3xl border border-[#1a3353] bg-[#0B1D34] p-8 text-center">
      <p>No hay agentes que coincidan con esta combinación.</p>
      <button onClick={() => navigate(defaultDiscoveryFilters)} className={`${buttonClass} mt-4`}>Ver todos los agentes</button>
    </div>}
    {results.pages > 1 && <nav aria-label="Páginas del catálogo" className="mt-8 flex flex-wrap items-center justify-center gap-3">
      <button disabled={pending || results.page === 1} onClick={() => update({ page: results.page - 1 })} className={buttonClass}>Anterior</button>
      <span className="text-sm text-[#91A7BC]">{results.page} / {results.pages}</span>
      <button disabled={pending || results.page === results.pages} onClick={() => update({ page: results.page + 1 })} className={buttonClass}>Siguiente</button>
    </nav>}
  </section>;
}
