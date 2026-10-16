"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Layers } from "lucide-react";
import { AnimatedIcon } from "@/presentation/atoms/AnimatedIcon";
import styles from "@/presentation/templates/AgentNavigation.module.css";
import { getIndustrySolutions, type IndustrySolution } from "@/application/agents/solutions";
import { agents } from "@/demo/agents";

const solutions = getIndustrySolutions(agents);

export function SolutionsMenu() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

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
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick, true);
    };
  }, [open, close]);

  return (
    <div ref={containerRef} onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
    }}>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        data-icon-trigger
        onClick={() => setOpen(prev => !prev)}
        className={styles.item}
      >
        <AnimatedIcon icon={Layers} motion="lift" size={16} />Soluciones
        <ChevronDown size={14} aria-hidden="true" className={`transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <SolutionsPanel id={panelId} solutions={solutions} onNavigate={() => setOpen(false)} />}
    </div>
  );
}

function SolutionsPanel({ id, solutions, onNavigate }: { id: string; solutions: IndustrySolution[]; onNavigate: () => void }) {
  return (
    <div
      id={id}
      className={styles.panel}
    >
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#42C7E8]">
        Soluciones por industria
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {solutions.map(solution => (
          <Link
            key={solution.name}
            href={`/agentes?industria=${encodeURIComponent(solution.name)}`}
            data-icon-trigger
            onClick={onNavigate}
            className="group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-[#123352]"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#287FF0]/15 text-[#42C7E8]">
              <AnimatedIcon icon={solution.icon} motion={solution.name === "Servicios" ? "wave" : "lift"} />
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
          onClick={onNavigate}
          className="text-xs font-semibold text-[#42C7E8] hover:underline"
        >
          Ver catálogo completo →
        </Link>
        <Link
          href="/solicitar-demo"
          onClick={onNavigate}
          className="rounded-full bg-[#287FF0] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#216bd0]"
        >
          Solicitar demo
        </Link>
      </div>
    </div>
  );
}
