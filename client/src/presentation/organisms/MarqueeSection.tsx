import {
  MessageSquare,
  Bot,
  Zap,
  Shield,
  Database,
  Code2,
  BarChart3,
  Layers,
  Sparkles,
  Cpu,
} from "lucide-react";

interface MarqueeItemRow1 {
  name: string;
  category: string;
  icon: typeof MessageSquare;
  color?: string;
}

interface MarqueeItemRow2 {
  name: string;
  category: string;
  icon: typeof Bot;
  highlight: string;
}

const ROW_1: readonly MarqueeItemRow1[] = [
  { name: "WhatsApp", category: "Canal", icon: MessageSquare, color: "#25D366" },
  { name: "Slack", category: "Colaboración", icon: MessageSquare, color: "#E01E5A" },
  { name: "HubSpot", category: "CRM", icon: Layers, color: "#FF7A59" },
  { name: "Google Sheets", category: "Datos", icon: Database, color: "#0F9D58" },
  { name: "Notion", category: "Documentación", icon: Layers, color: "#FFFFFF" },
  { name: "GitHub", category: "Desarrollo", icon: Code2, color: "#42C7E8" },
  { name: "Figma", category: "Diseño", icon: Sparkles, color: "#F24E1E" },
  { name: "Salesforce", category: "Enterprise", icon: Layers, color: "#00A1E0" },
  { name: "Zendesk", category: "Soporte", icon: MessageSquare, color: "#03363D" },
  { name: "Stripe", category: "Finanzas", icon: BarChart3, color: "#635BFF" },
];

const ROW_2: readonly MarqueeItemRow2[] = [
  { name: "Atención 24/7", category: "Soporte", icon: Bot, highlight: "Cero esperas" },
  { name: "Calificación de leads", category: "Ventas", icon: Zap, highlight: "En tiempo real" },
  { name: "Reportes automatizados", category: "Analytics", icon: BarChart3, highlight: "Métricas clave" },
  { name: "Pair programming", category: "Desarrollo", icon: Code2, highlight: "Revisión ágil" },
  { name: "Monitoreo continuo", category: "Infraestructura", icon: Shield, highlight: "Detección temprana" },
  { name: "Filtrado de talento", category: "RRHH", icon: Cpu, highlight: "Candidatos top" },
  { name: "Contabilidad guiada", category: "Finanzas", icon: Database, highlight: "Facturas y balances" },
  { name: "Copywriting de impacto", category: "Marketing", icon: Sparkles, highlight: "Campañas listas" },
];

export function MarqueeSection() {
  return (
    <section
      className="relative overflow-hidden border-y border-[#1a3353] bg-[#05080C] py-16 sm:py-20"
      aria-labelledby="marquee-title"
    >
      {/* Sombras de desvanecimiento en extremos */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#05080C] to-transparent sm:w-40"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#05080C] to-transparent sm:w-40"
        aria-hidden="true"
      />

      <div className="mb-10 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#42C7E8]">
          Ecosistema conectado
        </p>
        <h2 id="marquee-title" className="text-2xl font-bold text-[#EAF2F8] sm:text-3xl">
          Integraciones y capacidades en movimiento
        </h2>
        <p className="mt-2 text-sm text-[#91A7BC]">
          Herramientas y funciones ilustrativas disponibles en el catálogo de agentes
        </p>
      </div>

      <div className="space-y-4">
        {/* Fila 1: Integraciones (Desplazamiento horizontal fluido con pausa en hover) */}
        <div className="flex w-max animate-marquee-ltr pause-on-hover gap-4">
          {[...ROW_1, ...ROW_1].map((item, idx) => (
            <div
              key={`${item.name}-${idx}`}
              className="flex shrink-0 items-center gap-3 rounded-2xl border border-[#1a3353] bg-[#0B1D34]/70 px-5 py-3.5 shadow-md backdrop-blur-md transition-all hover:border-[#42C7E8]/60 hover:shadow-[0_0_20px_rgba(66,199,232,0.15)]"
            >
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#05080C]"
                style={{ color: item.color || "#42C7E8" }}
              >
                <item.icon size={18} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#EAF2F8]">{item.name}</p>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#91A7BC]">
                  {item.category}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Fila 2: Especialidades de Agentes (Desplazamiento inverso fluido) */}
        <div className="flex w-max animate-marquee-rtl pause-on-hover gap-4">
          {[...ROW_2, ...ROW_2].map((item, idx) => (
            <div
              key={`${item.name}-${idx}`}
              className="flex shrink-0 items-center gap-3 rounded-2xl border border-[#287FF0]/30 bg-[#0B1D34]/40 px-5 py-3.5 shadow-md backdrop-blur-md transition-all hover:border-[#287FF0] hover:shadow-[0_0_20px_rgba(40,127,240,0.2)]"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#287FF0]/15 text-[#42C7E8]">
                <item.icon size={18} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#EAF2F8]">{item.name}</p>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#42C7E8]">
                  {item.highlight}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-[#91A7BC]">
        Integraciones y capacidades ilustrativas para la versión de demostración
      </p>
    </section>
  );
}
