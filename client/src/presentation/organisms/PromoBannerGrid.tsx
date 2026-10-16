import Link from "next/link";
import { ArrowRight, MessageCircle, Layers, Sparkles } from "lucide-react";

const ACTION_BANNERS = [
  {
    tag: "Asistente guiado",
    title: "Encuentra el agente ideal",
    desc: "Describe tu necesidad en lenguaje cotidiano y recibe sugerencias inmediatas del catálogo.",
    cta: "Abrir chat guiado",
    href: "/chat",
    icon: MessageCircle,
    glow: "rgba(66,199,232,0.15)",
    borderHover: "hover:border-[#42C7E8]/60",
    badgeBg: "bg-[#42C7E8]/10 text-[#42C7E8] border-[#42C7E8]/30",
  },
  {
    tag: "Catálogo estructurado",
    title: "Soluciones por industria",
    desc: "Filtra por comercio, tecnología, finanzas y más. Conoce nivel de autonomía y herramientas compatibles.",
    cta: "Explorar catálogo",
    href: "/agentes",
    icon: Layers,
    glow: "rgba(40,127,240,0.15)",
    borderHover: "hover:border-[#287FF0]/60",
    badgeBg: "bg-[#287FF0]/10 text-[#42C7E8] border-[#287FF0]/30",
  },
  {
    tag: "Demostración personalizada",
    title: "Evalúa la viabilidad",
    desc: "Coordinemos una sesión para analizar la integración de agentes en los procesos de tu negocio.",
    cta: "Solicitar demo",
    href: "/solicitar-demo",
    icon: Sparkles,
    glow: "rgba(66,199,232,0.12)",
    borderHover: "hover:border-[#42C7E8]/60",
    badgeBg: "bg-[#42C7E8]/10 text-[#42C7E8] border-[#42C7E8]/30",
  },
];

export function PromoBannerGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12" aria-labelledby="useful-actions-title">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#42C7E8]">
          Próximos pasos
        </p>
        <h2 id="useful-actions-title" className="mt-1 text-2xl font-bold text-[#EAF2F8] sm:text-3xl">
          Empieza a explorar las posibilidades
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {ACTION_BANNERS.map(banner => (
          <Link
            key={banner.title}
            href={banner.href}
            className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#1a3353] bg-[#0B1D34]/50 p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${banner.borderHover}`}
          >
            {/* Glow decorativo */}
            <div
              className="pointer-events-none absolute -right-12 -top-12 size-36 rounded-full blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-40"
              style={{ backgroundColor: banner.glow }}
              aria-hidden="true"
            />

            <div>
              <div className="mb-4 flex items-center justify-between">
                <span className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${banner.badgeBg}`}>
                  {banner.tag}
                </span>
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#05080C] text-[#42C7E8] transition-transform duration-300 group-hover:scale-110">
                  <banner.icon size={20} aria-hidden="true" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-[#EAF2F8] group-hover:text-[#42C7E8] transition-colors">
                {banner.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#91A7BC]">
                {banner.desc}
              </p>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-[#42C7E8]">
              <span>{banner.cta}</span>
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </div>
          </Link>
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-[#91A7BC]">
        Catálogo de demostración · Opciones y enlaces diseñados para explorar las propuestas de agentes
      </p>
    </section>
  );
}
