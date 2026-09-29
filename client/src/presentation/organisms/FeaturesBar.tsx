import { Cpu, ShieldCheck, Zap } from "lucide-react";

const BRAND_PILLARS = [
  {
    icon: Zap,
    title: "EXPLORA POR OBJETIVO",
    desc: "Encuentra un agente para la tarea que necesitas resolver.",
    bg: "bg-[#287FF0]/20",
    iconColor: "text-[#42C7E8]",
  },
  {
    icon: ShieldCheck,
    title: "CONOCE CADA SOLUCIÓN",
    desc: "Revisa su propuesta antes de dar el siguiente paso.",
    bg: "bg-[#42C7E8]/20",
    iconColor: "text-[#42C7E8]",
  },
  {
    icon: Cpu,
    title: "AVANZA A TU RITMO",
    desc: "Empieza por una necesidad y amplía cuando tenga sentido.",
    bg: "bg-[#287FF0]/20",
    iconColor: "text-[#42C7E8]",
  },
];

export function FeaturesBar() {
  return (
    <section className="bg-[#05080C] border-y border-[#1a3353] py-5 sm:py-6 relative overflow-hidden">
      {/* Sello de marca sutil en los extremos */}
      <div
        className="absolute -top-10 -left-10 w-24 h-24 rounded-full border-[6px] border-[#42C7E8]/10 pointer-events-none hidden md:block"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-10 -right-10 w-24 h-24 rounded-full border-[6px] border-[#287FF0]/15 pointer-events-none hidden md:block"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 divide-y md:divide-y-0 md:divide-x divide-[#1a3353]">
          {BRAND_PILLARS.map(({ icon: Icon, title, desc, bg, iconColor }) => (
            <div
              key={title}
              className="flex items-center gap-4 pt-4 md:pt-0 first:pt-0 md:px-6 first:pl-0 last:pr-0 group"
            >
              <div
                className={`w-12 h-12 rounded-full ${bg} ${iconColor} flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(66,199,232,0.3)]`}
              >
                <Icon className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h4
                  className="text-xs sm:text-sm font-bold tracking-[0.12em] text-[#EAF2F8] uppercase font-heading"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {title}
                </h4>
                <p className="text-xs text-[#91A7BC] mt-0.5 font-reading">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
