"use client";

import { useState } from "react";
import { agentCategories, filterAgents } from "@/demo/agents";
import { AgentCarousel } from "@/presentation/organisms/AgentCarousel";

export function AgentCatalogue() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const results = filterAgents(query, category);

  return <section className="mx-auto max-w-7xl px-4 py-12 sm:py-20">
    <p className="text-sm font-bold uppercase tracking-widest text-[#42C7E8]">Nuestros agentes</p>
    <h1 className="mt-3 text-3xl font-black sm:text-5xl">Encuentra tu próximo aliado de IA</h1>
    <p className="mt-4 text-[#91A7BC]">Explora los agentes de ejemplo y abre su ficha para conocer su propuesta.</p>
    <div className="my-8 grid gap-4 sm:grid-cols-[1fr_240px]">
      <label className="text-sm">Buscar agentes
        <input id="buscar-agentes" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Nombre, función o categoría" className="mt-2 block w-full scroll-mt-44 rounded-xl border border-[#1a3353] bg-[#0B1D34] p-3 focus:border-[#42C7E8]" />
      </label>
      <label className="text-sm">Categoría
        <select value={category} onChange={event => setCategory(event.target.value)} className="mt-2 block w-full rounded-xl border border-[#1a3353] bg-[#0B1D34] p-3 focus:border-[#42C7E8]">
          <option value="Todos">Todas las categorías</option>
          {agentCategories.map(item => <option key={item.name} value={item.name}>{item.name} ({item.count})</option>)}
        </select>
      </label>
    </div>
    <p role="status" className="mb-5 text-sm text-[#91A7BC]">{results.length} agentes encontrados</p>
    <AgentCarousel agents={results} />
    {results.length === 0 && <div className="rounded-3xl border border-[#1a3353] bg-[#0B1D34] p-10 text-center">
      <p>No hay agentes que coincidan con tu búsqueda.</p>
      <button onClick={() => { setQuery(""); setCategory("Todos"); }} className="mt-4 text-[#42C7E8] underline">Limpiar filtros</button>
    </div>}
  </section>;
}
