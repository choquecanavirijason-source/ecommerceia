"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    id: "faq-funcionamiento",
    question: "¿Cómo funcionan los agentes de IA?",
    answer:
      "Cada agente está especializado en un rol concreto (ventas, soporte al cliente, análisis de métricas o generación de contenido). Operan mediante flujos guiados y niveles de autonomía configurables según las políticas de tu equipo.",
  },
  {
    id: "faq-demo-vs-real",
    question: "¿Los agentes de este catálogo están activos?",
    answer:
      "Esta plataforma es una demo interactiva con datos locales de muestra para validar la experiencia de catálogo y descubrimiento. Las respuestas del chat y los escenarios son ilustrativos y no ejecutan modelos ni servicios en producción.",
  },
  {
    id: "faq-integraciones",
    question: "¿Qué herramientas pueden conectarse con los agentes?",
    answer:
      "Los perfiles de los agentes ilustran compatibilidad con canales como WhatsApp, Slack, Google Sheets y sistemas CRM. Las conexiones reales se configuran durante la etapa de implementación técnica a medida.",
  },
  {
    id: "faq-autonomia",
    question: "¿Qué nivel de supervisión requieren?",
    answer:
      "Depende de la configuración elegida: Asistido (el agente sugiere y un humano decide), Aprobación previa (el agente prepara la acción y requiere confirmación), o Autónomo supervisado (ejecución directa con monitoreo y alertas).",
  },
  {
    id: "faq-probar",
    question: "¿Cómo puedo solicitar una demostración o propuesta para mi empresa?",
    answer:
      "Puedes explorar el catálogo, utilizar el Chat guiado para encontrar el agente adecuado a tu caso de uso y pulsar en 'Solicitar demo' o 'Solicitar cotización' para coordinar una sesión personalizada.",
  },
];

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  return (
    <section className="bg-[#05080C] py-16 sm:py-20" aria-labelledby="faq-title">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#42C7E8]">
            Preguntas frecuentes
          </p>
          <h2 id="faq-title" className="text-2xl font-bold text-[#EAF2F8] sm:text-3xl">
            Todo lo que necesitas saber
          </h2>
          <p className="mt-3 text-sm text-[#91A7BC]">
            Respuestas sobre el funcionamiento de los agentes y el alcance de esta demo.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map(faq => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="overflow-hidden rounded-2xl border border-[#1a3353] bg-[#0B1D34]/40 transition-colors hover:border-[#42C7E8]/40"
              >
                <button
                  type="button"
                  id={`btn-${faq.id}`}
                  aria-expanded={isOpen}
                  aria-controls={`panel-${faq.id}`}
                  onClick={() => toggle(faq.id)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left text-sm font-semibold text-[#EAF2F8] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#42C7E8]"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    size={18}
                    aria-hidden="true"
                    className={`shrink-0 text-[#42C7E8] transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  id={`panel-${faq.id}`}
                  role="region"
                  aria-labelledby={`btn-${faq.id}`}
                  hidden={!isOpen}
                  className={`px-5 pb-5 pt-1 text-sm leading-relaxed text-[#91A7BC] ${
                    isOpen ? "block" : "hidden"
                  }`}
                >
                  <p>{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-[#91A7BC]">
          Información ilustrativa correspondiente a la versión de demostración.
        </p>
      </div>
    </section>
  );
}
