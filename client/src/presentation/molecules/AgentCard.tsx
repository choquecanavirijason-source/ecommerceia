import { autonomyLabels, pricingLabels } from "./agentLabels";
import Image from "next/image";
import Link from "next/link";
import type { Agent } from "@/domain/entities/Agent";

export function AgentCard({ agent }: { agent: Agent }) {
  return (
    <article className="group flex h-full flex-col rounded-3xl border border-[#1a3353] bg-[#05080C] overflow-hidden hover:border-[#42C7E8]/50 hover:shadow-[0_0_20px_rgba(66,199,232,0.15)] transition-all duration-300">
      <Link href={`/agentes/${agent.slug}`} aria-label={`Ver ficha de ${agent.name}`} className="block relative h-48 w-full bg-[#0B1D34] overflow-hidden">
        <Image src={agent.img} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05080C] to-transparent opacity-80" />
        <span className="absolute top-3 right-3 bg-[#42C7E8]/20 border border-[#42C7E8]/50 text-[#42C7E8] text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">{agent.cat}</span>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-[#EAF2F8] mb-1 group-hover:text-[#42C7E8] transition-colors"><Link href={`/agentes/${agent.slug}`}>{agent.name}</Link></h3>
        <p className="text-xs text-[#91A7BC] mb-4 line-clamp-2 min-h-8">{agent.desc}</p>
        <div className="mb-4 space-y-2 text-xs text-[#91A7BC]">
          <p className="text-[#42C7E8]">{pricingLabels[agent.pricing.model]} · Ejemplo</p>
          <p>{autonomyLabels[agent.autonomy]}</p>
          <p>Integraciones de ejemplo: {agent.integrations.join(" · ")}</p>
        </div>
        <Link href={`/solicitar-demo?agente=${agent.slug}`} className="mt-auto block w-full text-center bg-[#287FF0]/10 hover:bg-[#287FF0]/20 border border-[#287FF0]/30 text-[#42C7E8] text-xs font-bold py-2.5 rounded-xl uppercase tracking-wider transition-colors">Solicitar demo</Link>
      </div>
    </article>
  );
}
