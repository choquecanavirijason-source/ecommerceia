"use client";

import Link from "next/link";
import { ArrowRight, Bot } from "lucide-react";
import { SectionEyebrow } from "@/presentation/atoms/SectionEyebrow";
import { agentCategories } from "@/demo/agents";

const AGENT_CATEGORIES = agentCategories.map((category, index) => ({
  ...category, icon: Bot, color: index % 2 === 0 ? "#287FF0" : "#42C7E8",
}));

export function CategorySection({
  activeCategory,
  onCategoryChange,
}: {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <SectionEyebrow icon={Bot} className="text-[#42C7E8]">Explora por función</SectionEyebrow>
          <h2 className="text-2xl font-black text-[#EAF2F8] font-heading mt-1 uppercase">
            ¿Dónde necesitas apoyo?
          </h2>
          <div className="w-12 h-1 bg-[#42C7E8] rounded-full mt-2 shadow-[0_0_10px_rgba(66,199,232,0.5)]" />
        </div>
        <Link
          href="/agentes"
          className="inline-flex items-center gap-2 self-start sm:self-auto border-2 border-[#42C7E8] text-[#42C7E8] hover:bg-[#42C7E8]/10 px-5 py-2 rounded-full font-subheading font-medium text-xs sm:text-sm transition-all duration-200 shadow-[0_0_15px_rgba(66,199,232,0.1)] active:scale-95"
        >
          Ver catálogo <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {AGENT_CATEGORIES.map((category) => {
          const isActive = activeCategory === category.name;
          return (
            <button
              key={category.name}
              aria-pressed={isActive}
              onClick={() => onCategoryChange(isActive ? "Todos" : category.name)}
              className={`flex min-w-0 flex-col items-start gap-2 p-3 sm:flex-row sm:items-center sm:gap-3 sm:p-4 rounded-2xl border transition-all duration-300 text-left ${
                isActive
                  ? "border-[#42C7E8] bg-[#42C7E8]/10 shadow-[0_0_20px_rgba(66,199,232,0.2)]"
                  : "border-[#1a3353] bg-[#0B1D34]/50 hover:bg-[#0B1D34] hover:border-[#42C7E8]/50"
              }`}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${category.color}20`, color: category.color }}
              >
                <category.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 max-w-full">
                <p className={`break-words text-sm font-bold ${isActive ? "text-[#42C7E8]" : "text-[#EAF2F8]"} font-subheading`}>
                  {category.name}
                </p>
                <p className="text-[10px] text-[#91A7BC] uppercase font-bold tracking-wider mt-0.5">
                  {category.count} {category.count === 1 ? "agente" : "agentes"}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
