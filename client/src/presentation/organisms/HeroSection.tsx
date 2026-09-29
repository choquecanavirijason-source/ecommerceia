import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-[#05080C]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_30%,rgba(40,127,240,0.22),transparent_60%)]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-5 py-10 sm:px-6 sm:py-16 lg:grid-cols-[1.15fr_1fr] lg:gap-12 lg:py-20">
        <div className="max-w-2xl">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#42C7E8]/25 bg-[#42C7E8]/5 px-3 py-2 text-xs font-medium text-[#42C7E8]"><Sparkles size={14} aria-hidden="true" /> IA especializada para tu negocio</p>
          <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[1.08] tracking-tight text-[#EAF2F8]">Menos tareas.<br /><span className="text-[#42C7E8]">Más posibilidades.</span></h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-[#91A7BC] sm:text-lg">Encuentra agentes de IA para ventas, atención al cliente y operaciones. Explora qué pueden aportar a tu equipo, a tu ritmo.</p>
          <div className="mt-8 flex items-center gap-4">
            <div aria-hidden="true" className="pointer-events-none relative hidden size-28 shrink-0 sm:block motion-safe:animate-[bounce_3s_infinite]">
              <Image src="/assets/robot-hand.jpg" alt="" fill sizes="112px" className="object-cover mix-blend-screen" style={{ maskImage: "radial-gradient(circle, black 35%, transparent 72%)", WebkitMaskImage: "radial-gradient(circle, black 35%, transparent 72%)" }} />
            </div>
            <div className="flex flex-wrap gap-3">
            <Link href="/agentes" className="inline-flex items-center justify-center gap-3 rounded-full bg-[#287FF0] px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#216bd0]">Explorar agentes <ArrowRight size={18} aria-hidden="true" /></Link>
            <Link href="/solicitar-demo" className="inline-flex items-center justify-center rounded-full border border-[#42C7E8]/40 px-6 py-3.5 text-sm font-semibold text-[#EAF2F8] transition-colors hover:bg-[#42C7E8]/10">Conocer la demo</Link>
            </div>
          </div>
          <p className="mt-5 text-xs text-[#91A7BC]">Exploración sin registro · Agentes propios · Asesoría a medida</p>
        </div>
        <div className="relative mx-auto w-full max-w-[460px] lg:max-w-none">
          <div className="relative aspect-[5/4] sm:aspect-square">
            <div className="absolute inset-0 motion-safe:animate-[pulse_4s_ease-in-out_infinite]" style={{ maskImage: "linear-gradient(to bottom, black 75%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 75%, transparent 100%)" }}>
              <Image src="/assets/robot-demo.jpg" alt="Robot que representa a los agentes de inteligencia artificial" fill sizes="(max-width: 640px) 90vw, (max-width: 1024px) 460px, 45vw" className="object-contain object-bottom mix-blend-lighten drop-shadow-[0_0_40px_rgba(40,127,240,0.25)]" priority />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
