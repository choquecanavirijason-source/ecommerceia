import Link from "next/link";
import { ArrowRight } from "lucide-react";

const BANNERS = [
  {
    title: "Agentes por función",
    sub: "Encuentra tu punto de partida",
    cta: "Explorar",
    href: "/agentes",
    bg: "from-[#287FF0]/40 to-[#0B1D34]",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=300&fit=crop",
  },
  {
    title: "Soluciones para tu equipo",
    sub: "Conversemos sobre tu objetivo",
    cta: "Consultar propuesta",
    href: "/solicitar-cotizacion",
    bg: "from-[#42C7E8]/40 to-[#0B1D34]",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop",
  },
  {
    title: "Conoce la demo",
    sub: "Explora las posibilidades",
    cta: "Ver detalle",
    href: "/solicitar-demo",
    bg: "from-[#287FF0]/20 to-[#42C7E8]/30",
    image: "https://images.unsplash.com/photo-1655635643532-fa9ba2648cbe?w=400&h=300&fit=crop",
  },
];

export function PromoBannerGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-6 bg-[#05080C]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {BANNERS.map(({ title, sub, cta, href, bg, image }) => (
          <Link
            key={title}
            href={href}
            className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${bg} min-h-[180px] flex items-center p-6 group shadow-xs hover:shadow-[0_0_20px_rgba(66,199,232,0.15)] transition-all duration-300 hover:-translate-y-0.5 border border-[#1a3353] hover:border-[#42C7E8]/50`}
          >
            {/* Sello de marca: Medios círculos / arcos decorativos */}
            <div
              className="absolute -top-12 -right-12 w-32 h-32 rounded-full border-[10px] border-[#42C7E8]/10 pointer-events-none transition-transform duration-500 group-hover:scale-110"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full border-[6px] border-[#287FF0]/10 pointer-events-none"
              aria-hidden="true"
            />

            <div className="relative z-10">
              <p className="text-[#42C7E8] text-xs font-bold uppercase tracking-widest mb-1">{sub}</p>
              <h3 className="text-[#EAF2F8] font-black text-lg leading-tight mb-3 font-heading">{title}</h3>
              <span className="bg-[#42C7E8]/10 border border-[#42C7E8]/30 backdrop-blur text-[#42C7E8] text-xs font-bold px-4 py-2 rounded-full group-hover:bg-[#42C7E8] group-hover:text-[#05080C] transition-all inline-flex items-center gap-1.5 font-subheading">
                {cta} <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
            <img
              src={image}
              alt={title}
              className="absolute right-0 top-0 w-1/2 h-full object-cover opacity-20 group-hover:opacity-30 group-hover:scale-105 transition-all duration-500 mix-blend-screen"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
