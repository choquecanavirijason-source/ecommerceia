"use client";

import { Bot } from "lucide-react";
import Link from "next/link";
import { AgentCarousel } from "@/presentation/organisms/AgentCarousel";
import { agentCategories, filterAgents } from "@/demo/agents";
import { SectionEyebrow } from "@/presentation/atoms/SectionEyebrow";

export function FeaturedAgentsSection({
  activeCategory,
  onCategoryChange,
}: {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}) {
  const filteredAgents = filterAgents("", activeCategory);
  // La portada muestra una selección, sin montar cientos de tarjetas.
  const featuredAgents = filteredAgents.slice(0, 12);
  const quickFilters = ["Todos", ...agentCategories.map(category => category.name)];

  return (
    <section className="bg-[#0B1D34] py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <SectionEyebrow icon={Bot} className="text-[#42C7E8]">
              {activeCategory === "Todos" ? "Nuestros Agentes" : "Explorando Categoría"}
            </SectionEyebrow>
            <h2 className="text-3xl font-black text-[#EAF2F8] uppercase mt-2">
              {activeCategory === "Todos" ? "Catálogo de Agentes" : activeCategory}
            </h2>
          </div>
          <select aria-label="Filtrar agentes por categoría"
            value={activeCategory}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="w-full sm:w-64 rounded-xl border border-[#1a3353] bg-[#05080C] px-4 py-3 text-sm font-semibold text-[#EAF2F8] outline-none focus:border-[#42C7E8]"
          >
            {quickFilters.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        
        <AgentCarousel agents={featuredAgents} />
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-[#91A7BC]">{featuredAgents.length} de {filteredAgents.length} agentes · {activeCategory === "Todos" ? "Todas las categorías" : activeCategory}</p>
          <Link href={activeCategory === "Todos" ? "/agentes" : `/agentes?categoria=${encodeURIComponent(activeCategory)}`} className="font-semibold text-[#42C7E8] hover:underline">Explorar el catálogo completo →</Link>
        </div>
        
        {filteredAgents.length === 0 && (
          <div className="rounded-3xl border border-[#1a3353] bg-[#05080C] p-14 text-center">
            <Bot className="w-12 h-12 mx-auto text-[#91A7BC] mb-4 opacity-50" />
            <p className="text-[#91A7BC]">No hay agentes en esta categoría.</p>
          </div>
        )}
      </div>
    </section>
  );
}
