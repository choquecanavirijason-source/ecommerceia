"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { getIndustrySolutions, type IndustrySolution } from "@/application/agents/solutions";
import { agents } from "@/demo/agents";

const solutions = getIndustrySolutions(agents);

export function SolutionsMenu() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { e.preventDefault(); close(); }
    }
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) close();
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick, true);
    };
  }, [open, close]);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen(prev => !prev)}
        className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider hover:text-[#42C7E8] aria-expanded:text-[#42C7E8] transition-colors"
      >
        Soluciones
        <ChevronDown size={14} aria-hidden="true" className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <SolutionsPanel solutions={solutions} onNavigate={close} />}
    </div>
  );
}

function SolutionsPanel({ solutions, onNavigate }: { solutions: IndustrySolution[]; onNavigate: () => void }) {
  return (
    <div
      role="menu"
      className="absolute left-1/2 top-full z-50 mt-3 w-[min(90vw,640px)] -translate-x-1/2 animate-in fade-in slide-in-from-top-2 duration-200 rounded-2xl border border-[#1a3353] bg-[#0B1D34]/95 p-5 shadow-2xl backdrop-blur-xl lg:left-0 lg:translate-x-0"
    >
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#42C7E8]">
        Soluciones por industria
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {solutions.map(solution => (
          <Link
            key={solution.name}
            href={`/agentes?industria=${encodeURIComponent(solution.name)}`}
            role="menuitem"
            onClick={onNavigate}
            className="group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-[#123352]"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#287FF0]/15 text-[#42C7E8] transition-transform group-hover:scale-110">
              <solution.icon size={20} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#EAF2F8] group-hover:text-[#42C7E8]">{solution.name}</p>
              <p className="mt-0.5 text-xs leading-snug text-[#91A7BC] line-clamp-2">{solution.description}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#91A7BC]">
                {solution.count} {solution.count === 1 ? "agente" : "agentes"}
              </p>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#1a3353] pt-4">
        <Link
          href="/agentes"
          role="menuitem"
          onClick={onNavigate}
          className="text-xs font-semibold text-[#42C7E8] hover:underline"
        >
          Ver catálogo completo →
        </Link>
        <Link
          href="/solicitar-demo"
          role="menuitem"
          onClick={onNavigate}
          className="rounded-full bg-[#287FF0] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#216bd0]"
        >
          Solicitar demo
        </Link>
      </div>
    </div>
  );
}
