import Link from "next/link";
import { ArrowRight, Sparkles, MessageCircle } from "lucide-react";
import { Magnet } from "@/presentation/atoms/Magnet";
import { AiRobotStage } from "@/presentation/organisms/AiRobotStage";

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-[#05080C]">
      {/* Luces y ambiente decorativo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_30%,rgba(40,127,240,0.25),transparent_65%),radial-gradient(ellipse_at_20%_80%,rgba(66,199,232,0.12),transparent_55%)]"
      />
      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-8 px-5 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.15fr_1fr] lg:gap-12 lg:py-24">
        <div className="max-w-2xl">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#42C7E8]/25 bg-[#42C7E8]/5 px-3.5 py-2 text-xs font-medium text-[#42C7E8] backdrop-blur-sm">
            <Sparkles size={14} aria-hidden="true" /> IA especializada para tu negocio
          </p>
          <h1 className="text-[clamp(2.5rem,5.5vw,4.8rem)] font-black leading-[1.05] tracking-tight">
            <span className="hero-heading block">Menos tareas.</span>
            <span className="text-[#42C7E8]">
              Más pos<span data-punto-i>i</span>bilidades.
            </span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-[#91A7BC] sm:text-lg">
            Encuentra agentes de IA para ventas, atención al cliente y operaciones. Explora qué pueden aportar a tu equipo, a tu ritmo.
          </p>
          <div className="mt-8">
            <div className="flex flex-wrap items-center gap-3">
              <Magnet strength={3.5} padding={50}>
                <Link
                  href="/agentes"
                  className="inline-flex items-center justify-center gap-2.5 rounded-full bg-[#287FF0] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:bg-[#216bd0] hover:shadow-[0_0_25px_rgba(40,127,240,0.45)] hover:scale-[1.02]"
                >
                  Explorar agentes <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </Magnet>
              <Link
                href="/chat"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#42C7E8]/40 bg-[#42C7E8]/5 px-5 py-3.5 text-sm font-semibold text-[#EAF2F8] transition-all duration-300 hover:bg-[#42C7E8]/15 hover:border-[#42C7E8]"
              >
                <MessageCircle size={16} aria-hidden="true" className="text-[#42C7E8]" />
                Chat guiado
              </Link>
              <Link
                href="/solicitar-demo"
                className="inline-flex items-center justify-center rounded-full border border-[#1a3353] px-5 py-3.5 text-sm font-semibold text-[#91A7BC] transition-colors hover:border-[#42C7E8]/40 hover:text-[#EAF2F8]"
              >
                Conocer la demo
              </Link>
            </div>
          </div>
          <p className="mt-5 text-xs text-[#91A7BC]">
            Exploración sin registro · Agentes propios · Asesoría a medida
          </p>
        </div>
        {/* Hueco reservado: el robot va superpuesto a toda la sección, pero
            la rejilla necesita que esta columna siga ocupando su sitio. */}
        <div aria-hidden="true" className="aspect-[1316/1195] w-full max-w-[460px] lg:max-w-none" />
      </div>

      {/* Encima del hero entero: la coreografía sale de la órbita y se acerca
          al titular, así que no puede vivir dentro de una columna. Va detrás
          del texto en el orden de pintado y sin puntero, para no tapar los
          botones. */}
      <AiRobotStage className="absolute inset-0 z-0" />
    </section>
  );
}
