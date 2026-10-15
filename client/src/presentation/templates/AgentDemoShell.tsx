"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AgentLogo } from "@/presentation/atoms/AgentLogo";
import { SolutionsMenu } from "@/presentation/organisms/SolutionsMenu";
import { Search, MessageCircle } from "lucide-react";

const links = [
  { href: "/agentes", label: "Explorar agentes" },
  { href: "/solicitar-demo", label: "Solicitar demo" },
  { href: "/solicitar-cotizacion", label: "Solicitar cotización" },
];

export function AgentDemoShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return <div className="min-h-screen bg-[#05080C] text-[#EAF2F8]">
    <a href="#contenido-principal" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-[#287FF0] focus:p-3">Saltar al contenido</a>
    <header className="sticky top-0 z-40 border-b border-[#1a3353] bg-[#05080C]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" aria-label="Inicio">
          <AgentLogo />
        </Link>
        <nav aria-label="Navegación principal" className="order-last flex w-full flex-wrap items-center justify-center gap-x-5 gap-y-3 rounded-3xl border border-[#287FF0]/30 bg-[#0B1D34]/50 px-4 py-3 lg:order-none lg:w-auto">
          {links.map(link => <Link key={link.href} href={link.href} aria-current={pathname?.startsWith(link.href) ? "page" : undefined} className="text-xs font-bold uppercase tracking-wider hover:text-[#42C7E8] aria-[current=page]:text-[#42C7E8]">{link.label}</Link>)}
          <SolutionsMenu />
          <Link href="/chat" aria-current={pathname === "/chat" ? "page" : undefined} className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider hover:text-[#42C7E8] aria-[current=page]:text-[#42C7E8]">
            <MessageCircle size={14} aria-hidden="true" />
            Chat
          </Link>
        </nav>
        <Link href="/agentes#buscar-agentes" aria-label="Buscar agentes" className="inline-flex min-h-11 items-center gap-2 text-sm text-[#42C7E8]"><Search size={16} aria-hidden="true" /><span>Buscar<span className="hidden sm:inline"> agentes</span></span></Link>
      </div>
    </header>
    <p className="bg-[#0B1D34] px-4 py-2 text-center text-xs text-[#91A7BC]">Demo con datos de prueba · Sin envíos ni compras</p>
    <main id="contenido-principal" className="scroll-mt-44 lg:scroll-mt-24">{children}</main>
    <footer className="mx-auto flex max-w-7xl flex-wrap justify-between gap-4 border-t border-[#1a3353] px-4 py-8 text-sm text-[#91A7BC]">
      <p>Catálogo de agentes propios · Versión de demostración</p>
      <div className="flex flex-wrap gap-4">
        <Link href="/agentes" className="text-[#42C7E8]">Explorar agentes</Link>
        <Link href="/chat" className="text-[#42C7E8]">Chat guiado</Link>
      </div>
    </footer>
  </div>;
}
