import { Bot } from "lucide-react";

/** Identidad temporal; sustituir aquí cuando exista marca definitiva. */
export function AgentLogo() {
  return <span className="inline-flex items-center gap-3">
    <span className="flex size-11 items-center justify-center rounded-2xl border border-[#42C7E8]/40 bg-gradient-to-br from-[#287FF0]/30 to-[#42C7E8]/10 text-[#42C7E8]">
      <Bot className="size-6" aria-hidden="true" />
    </span>
    <span className="leading-tight"><span className="block text-lg font-bold tracking-tight text-[#EAF2F8]">AGENTES<span className="text-[#42C7E8]">.IA</span></span><span className="block text-[10px] uppercase tracking-[0.22em] text-[#91A7BC]">Tu equipo digital</span></span>
  </span>;
}
