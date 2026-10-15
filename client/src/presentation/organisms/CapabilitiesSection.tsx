import { Bot, Zap, Shield, Globe, Clock, Users } from "lucide-react";

const capabilities = [
  { icon: Bot, title: "Agentes especializados", desc: "Cada agente diseñado para un objetivo concreto: ventas, soporte, análisis y más." },
  { icon: Zap, title: "Automatización inteligente", desc: "Reduce tareas repetitivas y libera tiempo para lo que importa." },
  { icon: Shield, title: "Supervisión a tu medida", desc: "Elige el nivel de autonomía: asistido, con aprobación o autónomo." },
  { icon: Globe, title: "Integraciones preparadas", desc: "Diseñados para conectar con herramientas como Slack, WhatsApp y más." },
  { icon: Clock, title: "Disponibilidad continua", desc: "Agentes que pueden operar fuera del horario de tu equipo." },
  { icon: Users, title: "Escalabilidad flexible", desc: "Empieza con un agente y amplía según tus necesidades." },
];

export function CapabilitiesSection() {
  return (
    <section className="bg-[#0B1D34] py-16 sm:py-20" aria-labelledby="capabilities-title">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#42C7E8]">Capacidades</p>
          <h2 id="capabilities-title" className="text-2xl font-bold text-[#EAF2F8] sm:text-3xl">
            ¿Qué pueden hacer los agentes?
          </h2>
          <p className="mt-3 text-sm text-[#91A7BC]">
            Funcionalidades ilustrativas del catálogo de demo.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map(cap => (
            <div key={cap.title} className="group rounded-2xl border border-[#1a3353] bg-[#05080C] p-6 transition-all hover:border-[#42C7E8]/50 hover:shadow-[0_0_20px_rgba(66,199,232,0.1)]">
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-[#287FF0]/15 text-[#42C7E8] transition-transform group-hover:scale-110">
                <cap.icon size={24} aria-hidden="true" />
              </div>
              <h3 className="text-base font-bold text-[#EAF2F8]">{cap.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#91A7BC]">{cap.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-[#91A7BC]">
          Las capacidades descritas son ejemplos ilustrativos de la demo.
        </p>
      </div>
    </section>
  );
}
