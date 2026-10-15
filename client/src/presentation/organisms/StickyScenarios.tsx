import Link from "next/link";
import { ArrowRight, CheckCircle, Cog, MessageSquare, Sparkles } from "lucide-react";

interface Scenario {
  number: string;
  category: string;
  title: string;
  subtitle: string;
  agentSlug: string;
  agentName: string;
  steps: {
    label: string;
    text: string;
    icon: typeof MessageSquare;
  }[];
}

const SCENARIOS: Scenario[] = [
  {
    number: "01",
    category: "Ventas & Conversión",
    title: "Captura y Calificación de Leads",
    subtitle: "Identifica intención de compra y prepara propuestas listas para revisión humana.",
    agentSlug: "salesbot-pro",
    agentName: "SalesBot Pro",
    steps: [
      {
        label: "Entrada del cliente",
        text: "\"Hola, nos gustaría cotizar un plan para 25 personas y conectar nuestro CRM.\"",
        icon: MessageSquare,
      },
      {
        label: "Procesamiento del agente",
        text: "Analiza el presupuesto estimado, verifica herramientas compatibles y clasifica como Lead Calificado.",
        icon: Cog,
      },
      {
        label: "Resultado preparado",
        text: "Ficha enviada al equipo comercial con propuesta preliminar lista para aprobación.",
        icon: CheckCircle,
      },
    ],
  },
  {
    number: "02",
    category: "Soporte al Cliente",
    title: "Atención Continua 24/7 sin Esperas",
    subtitle: "Resuelve dudas frecuentes por WhatsApp o Slack y escala casos complejos con contexto.",
    agentSlug: "support-genius",
    agentName: "Support Genius",
    steps: [
      {
        label: "Entrada del cliente",
        text: "\"Mi pedido no ha llegado y el código de seguimiento me da error.\"",
        icon: MessageSquare,
      },
      {
        label: "Procesamiento del agente",
        text: "Consulta el estado en la base logística y verifica incidencias de transporte.",
        icon: Cog,
      },
      {
        label: "Resultado preparado",
        text: "Notificación al usuario con nueva fecha estimada y aviso al operador si requiere intervención.",
        icon: CheckCircle,
      },
    ],
  },
  {
    number: "03",
    category: "Operaciones & Datos",
    title: "Análisis y Reportes Automatizados",
    subtitle: "Extrae métricas de múltiples fuentes y genera resúmenes listos para toma de decisiones.",
    agentSlug: "data-miner-x",
    agentName: "Data Miner X",
    steps: [
      {
        label: "Entrada del equipo",
        text: "\"Genera el reporte de conversión semanal comparado con el mes anterior.\"",
        icon: MessageSquare,
      },
      {
        label: "Procesamiento del agente",
        text: "Agrupa ventas, calcula variación porcentual e identifica los canales con mayor crecimiento.",
        icon: Cog,
      },
      {
        label: "Resultado preparado",
        text: "Resumen ejecutivo con gráficos de tendencias y tres alertas de oportunidad prioritarias.",
        icon: CheckCircle,
      },
    ],
  },
];

export function StickyScenarios() {
  return (
    <section
      className="relative bg-[#05080C] px-4 py-20 sm:px-6 sm:py-28"
      aria-labelledby="sticky-scenarios-title"
    >
      <div className="mx-auto max-w-6xl">
        {/* Encabezado de la sección */}
        <div className="mb-14 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#42C7E8]">
            Demostración en tres actos
          </p>
          <h2
            id="sticky-scenarios-title"
            className="hero-heading text-[clamp(2rem,5vw,3.5rem)] font-black uppercase leading-tight tracking-tight"
          >
            Cómo operan los agentes
          </h2>
          <p className="mt-3 text-sm text-[#91A7BC] sm:text-base">
            Casos de uso preparados para ilustrar el flujo de entrada, procesamiento y resultado.
          </p>
        </div>

        {/* Tarjetas apilables en scroll (Sticky Stacking Cards) */}
        <div className="relative space-y-10 pb-16">
          {SCENARIOS.map((scenario, index) => (
            <div
              key={scenario.number}
              className="sticky top-20 z-10 transition-transform duration-300 sm:top-24"
              style={{
                top: `calc(5rem + ${index * 20}px)`,
              }}
            >
              <div className="overflow-hidden rounded-3xl border-2 border-[#1a3353] bg-[#0B1D34]/95 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-[#42C7E8]/60 sm:p-10">
                {/* Fila superior de la tarjeta */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#1a3353] pb-6">
                  <div className="flex items-center gap-4">
                    <span className="font-heading text-4xl font-black text-[#42C7E8] sm:text-5xl">
                      {scenario.number}
                    </span>
                    <div>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#42C7E8]/30 bg-[#42C7E8]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#42C7E8]">
                        <Sparkles size={12} aria-hidden="true" />
                        {scenario.category}
                      </span>
                      <h3 className="mt-1 text-xl font-bold text-[#EAF2F8] sm:text-2xl">
                        {scenario.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/agentes/${scenario.agentSlug}`}
                      className="inline-flex items-center gap-2 rounded-full border-2 border-[#D7E2EA]/40 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#EAF2F8] transition-colors hover:border-[#42C7E8] hover:text-[#42C7E8]"
                    >
                      Ver {scenario.agentName}
                      <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                  </div>
                </div>

                <p className="mt-4 text-sm text-[#91A7BC]">{scenario.subtitle}</p>

                {/* Pasos: Entrada -> Procesamiento -> Resultado */}
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {scenario.steps.map((step, stepIndex) => (
                    <div
                      key={step.label}
                      className="group flex flex-col justify-between rounded-2xl border border-[#1a3353] bg-[#05080C] p-5 transition-all hover:border-[#42C7E8]/50 hover:shadow-[0_0_20px_rgba(66,199,232,0.1)]"
                    >
                      <div>
                        <div className="mb-3 flex items-center gap-2">
                          <div className="flex size-8 items-center justify-center rounded-lg bg-[#287FF0]/15 text-[#42C7E8] transition-transform group-hover:scale-110">
                            <step.icon size={16} aria-hidden="true" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#91A7BC]">
                            Paso {stepIndex + 1} · {step.label}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed text-[#EAF2F8]">{step.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-6 text-right text-[11px] text-[#91A7BC]">
                  Flujo ilustrativo preparado · Sin ejecución de agentes en producción
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
