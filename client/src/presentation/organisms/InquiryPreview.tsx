"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { findAgent } from "@/demo/agents";

export function InquiryPreview({ type }: { type: "demo" | "cotización" }) {
  const params = useSearchParams();
  const slug = params.get("agente");
  const agent = slug ? findAgent(slug) : undefined;

  return <section className="mx-auto max-w-3xl px-4 py-16">
    <p className="text-sm font-bold uppercase tracking-widest text-[#42C7E8]">Vista de demostración</p>
    <h1 className="mt-3 text-4xl font-black">Solicitar {type}</h1>
    <div className="my-8 rounded-3xl border border-[#1a3353] bg-[#0B1D34] p-6">
      {agent ? <p>Agente seleccionado: <strong>{agent.name}</strong></p> : <p>{slug ? "El agente indicado no existe en esta demo. Selecciona uno desde el catálogo." : "Consulta general, sin agente seleccionado."}</p>}
      <p className="mt-4 text-[#91A7BC]">El formulario de solicitudes estará disponible en la siguiente etapa. Esta vista no envía ni guarda datos y no reserva reuniones.</p>
    </div>
    <Link href={agent ? `/agentes/${agent.slug}` : "/agentes"} className="text-[#42C7E8] underline">{agent ? "Volver a la ficha" : "Explorar agentes"}</Link>
  </section>;
}
