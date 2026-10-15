"use client";

import Link from "next/link";
import { ArrowRight, Bot, Cpu, Shield, Sparkles } from "lucide-react";
import { AnimatedText } from "@/presentation/atoms/AnimatedText";
import { Magnet } from "@/presentation/atoms/Magnet";

export function ManifestoSection() {
  return (
    <section
      className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-[#05080C] px-5 py-24 sm:px-8 md:px-12"
      aria-labelledby="manifesto-title"
    >
      {/* 4 Elementos decorativos flotantes en las esquinas */}
      {/* Esquina superior izquierda */}
      <div
        className="pointer-events-none absolute left-[4%] top-[8%] hidden sm:block"
        aria-hidden="true"
      >
        <div className="flex size-14 items-center justify-center rounded-2xl border border-[#42C7E8]/30 bg-[#0B1D34]/70 text-[#42C7E8] shadow-[0_0_30px_rgba(66,199,232,0.2)] backdrop-blur-md transition-transform duration-700 hover:rotate-6">
          <Bot size={28} />
        </div>
      </div>

      {/* Esquina inferior izquierda */}
      <div
        className="pointer-events-none absolute bottom-[10%] left-[6%] hidden sm:block"
        aria-hidden="true"
      >
        <div className="flex size-16 items-center justify-center rounded-3xl border border-[#287FF0]/30 bg-[#0B1D34]/70 text-[#287FF0] shadow-[0_0_30px_rgba(40,127,240,0.2)] backdrop-blur-md">
          <Shield size={32} />
        </div>
      </div>

      {/* Esquina superior derecha */}
      <div
        className="pointer-events-none absolute right-[4%] top-[8%] hidden sm:block"
        aria-hidden="true"
      >
        <div className="flex size-16 items-center justify-center rounded-3xl border border-[#42C7E8]/30 bg-[#0B1D34]/70 text-[#42C7E8] shadow-[0_0_30px_rgba(66,199,232,0.2)] backdrop-blur-md">
          <Sparkles size={32} />
        </div>
      </div>

      {/* Esquina inferior derecha */}
      <div
        className="pointer-events-none absolute bottom-[10%] right-[6%] hidden sm:block"
        aria-hidden="true"
      >
        <div className="flex size-14 items-center justify-center rounded-2xl border border-[#287FF0]/30 bg-[#0B1D34]/70 text-[#42C7E8] shadow-[0_0_30px_rgba(40,127,240,0.2)] backdrop-blur-md">
          <Cpu size={28} />
        </div>
      </div>

      {/* Luz ambiental central */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(66,199,232,0.08),transparent_60%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#42C7E8]">
          Visión y propuesta de valor
        </p>

        <h2
          id="manifesto-title"
          className="hero-heading text-[clamp(2.5rem,7vw,5.5rem)] font-black uppercase leading-none tracking-tight"
        >
          Autonomía con control
        </h2>

        {/* Párrafo con revelación palabra a palabra en scroll */}
        <div className="mx-auto my-10 max-w-2xl sm:my-14">
          <AnimatedText
            text="La nueva generación de software no espera instrucciones pasivas: anticipa consultas, califica oportunidades y resuelve tareas repetitivas en segundo plano. Diseñamos agentes de IA con autonomía configurable para que tu equipo decida en todo momento el nivel de supervisión requerido."
            mode="words"
            className="text-base sm:text-xl font-medium leading-relaxed"
          />
        </div>

        {/* Botón con efecto Magnet */}
        <div className="flex justify-center">
          <Magnet strength={4} padding={80}>
            <Link
              href="/agentes"
              className="inline-flex items-center gap-3 rounded-full bg-[#287FF0] px-8 py-4 text-sm font-bold text-white shadow-[0_0_25px_rgba(40,127,240,0.4)] transition-all hover:bg-[#216bd0] hover:shadow-[0_0_35px_rgba(66,199,232,0.5)] hover:scale-105"
            >
              Explorar el catálogo <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </Magnet>
        </div>
      </div>
    </section>
  );
}
