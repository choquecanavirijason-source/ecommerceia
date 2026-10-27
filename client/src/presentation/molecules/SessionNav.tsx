"use client";

import Link from "next/link";
import { LogIn, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { useDemoSession } from "@/presentation/hooks/useDemoSession";
import { esAdministrador } from "@/application/auth/demoSession";

/**
 * Control de sesión de la cabecera.
 *
 * Sin sesión enseña la puerta de acceso; con sesión, quién entró y por dónde
 * salir. El nombre se oculta en pantallas estrechas para no empujar al resto
 * de la navegación: el icono ya distingue cliente de administración.
 */
export function SessionNav() {
  const { session, salir } = useDemoSession();

  if (!session) {
    return (
      <Link
        href="/acceso"
        className="inline-flex items-center gap-1.5 rounded-full border border-[#42C7E8]/40 bg-[#42C7E8]/5 px-3.5 py-2 text-[13px] font-semibold text-[#EAF2F8] transition-colors hover:border-[#42C7E8] hover:bg-[#42C7E8]/15"
      >
        <LogIn size={15} aria-hidden="true" className="text-[#42C7E8]" />
        Entrar
      </Link>
    );
  }

  const admin = esAdministrador(session);
  // El nombre completo no cabe en la barra: basta el primero para reconocerse.
  const nombreCorto = session.user.name.split(" ")[0];

  return (
    <div className="flex items-center gap-1.5">
      <Link
        href={admin ? "/panel" : "/cuenta-demo"}
        className="inline-flex items-center gap-1.5 rounded-full border border-[#1a3353] bg-[#0B1D34]/60 px-3.5 py-2 text-[13px] font-semibold text-[#EAF2F8] transition-colors hover:border-[#42C7E8]/50"
      >
        {admin
          ? <ShieldCheck size={15} aria-hidden="true" className="text-[#42C7E8]" />
          : <UserRound size={15} aria-hidden="true" className="text-[#42C7E8]" />}
        <span className="hidden sm:inline">{nombreCorto}</span>
        <span className="sr-only">
          {admin ? "Panel del equipo" : "Tu cuenta"}, sesión de {session.user.name}
        </span>
      </Link>
      <button
        type="button"
        onClick={() => void salir()}
        aria-label="Cerrar sesión"
        title="Cerrar sesión"
        className="inline-flex items-center justify-center rounded-full border border-[#1a3353] p-2 text-[#91A7BC] transition-colors hover:border-[#42C7E8]/40 hover:text-[#EAF2F8]"
      >
        <LogOut size={15} aria-hidden="true" />
      </button>
    </div>
  );
}
