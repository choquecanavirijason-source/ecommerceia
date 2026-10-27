"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AgentLogo } from "@/presentation/atoms/AgentLogo";
import { SolutionsMenu } from "@/presentation/organisms/SolutionsMenu";
import { Search, MessageCircle, Compass, Play, FileText } from "lucide-react";
import { AnimatedIcon } from "@/presentation/atoms/AnimatedIcon";
import { SessionNav } from "@/presentation/molecules/SessionNav";
import styles from "./AgentNavigation.module.css";

const links = [
  { href: "/agentes", label: "Explorar agentes", icon: Compass, motion: "wave" },
  { href: "/solicitar-demo", label: "Solicitar demo", icon: Play, motion: "lift" },
  { href: "/solicitar-cotizacion", label: "Solicitar cotización", icon: FileText, motion: "draw" },
] as const;

export function AgentDemoShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return <div className="min-h-screen bg-[#05080C] text-[#EAF2F8]">
    <a href="#contenido-principal" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-[#287FF0] focus:p-3">Saltar al contenido</a>
    <header className={styles.header}>
      <div className={styles.bar}>
        <Link href="/" aria-label="Inicio">
          <AgentLogo />
        </Link>
        <nav aria-label="Navegación principal" className={styles.nav}>
          {links.map(link => <Link key={link.href} href={link.href} data-icon-trigger aria-current={pathname?.startsWith(link.href) ? "page" : undefined} className={styles.item}>
            <AnimatedIcon icon={link.icon} motion={link.motion} size={16} />{link.label}
          </Link>)}
          <SolutionsMenu />
          <Link href="/chat" data-icon-trigger aria-current={pathname?.replace(/\/$/, "") === "/chat" ? "page" : undefined} className={styles.item}>
            <AnimatedIcon icon={MessageCircle} size={16} />
            Chat
          </Link>
        </nav>
        <div className={`${styles.search} flex items-center gap-3`}>
          <Link href="/agentes#buscar-agentes" data-icon-trigger aria-label="Buscar agentes" className={styles.item}><AnimatedIcon icon={Search} motion="scan" size={16} /><span>Buscar</span></Link>
          <SessionNav />
        </div>
      </div>
    </header>
    <p className="bg-[#0B1D34] px-4 py-2 text-center text-xs text-[#91A7BC]">Demo con datos de prueba · Sin envíos ni compras</p>
    <main id="contenido-principal" className="scroll-mt-48 xl:scroll-mt-24">{children}</main>
    <footer className="mx-auto flex max-w-7xl flex-wrap justify-between gap-4 border-t border-[#1a3353] px-4 py-8 text-sm text-[#91A7BC]">
      <p>Catálogo de agentes propios · Versión de demostración</p>
      <div className="flex flex-wrap gap-4">
        <Link href="/agentes" className="text-[#42C7E8]">Explorar agentes</Link>
        <Link href="/chat" className="text-[#42C7E8]">Chat guiado</Link>
      </div>
    </footer>
  </div>;
}
