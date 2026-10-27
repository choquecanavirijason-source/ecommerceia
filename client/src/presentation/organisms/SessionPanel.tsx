"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useDemoSession } from "@/presentation/hooks/useDemoSession";
import { esAdministrador } from "@/application/auth/demoSession";

/**
 * Lo que se ve después de entrar.
 *
 * Es deliberadamente escueto: el encargo era el acceso, no el panel. Enseña
 * quién entró y qué permisos trae, que es lo que demuestra que la sesión
 * funciona, y deja dicho que la gestión real está pendiente.
 *
 * Si no hay sesión, devuelve a la puerta que corresponda en lugar de mostrar
 * un panel vacío.
 */
export function SessionPanel({ requiereAdmin = false }: { requiereAdmin?: boolean }) {
  const router = useRouter();
  const { session, salir } = useDemoSession();

  const sinPermiso = session === null || (requiereAdmin && !esAdministrador(session));

  useEffect(() => {
    if (sinPermiso) router.replace(requiereAdmin ? "/acceso/admin" : "/acceso");
  }, [sinPermiso, requiereAdmin, router]);

  if (sinPermiso) return null;

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:py-24">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#42C7E8]">
        {requiereAdmin ? "Administración" : "Tu cuenta"}
      </p>
      <h1 className="text-2xl font-bold text-[#EAF2F8] sm:text-3xl">Hola, {session.user.name}</h1>
      <p className="mt-3 text-sm text-[#91A7BC]">
        Sesión de demostración iniciada como <span className="font-mono text-[#C3D3E2]">{session.user.email}</span>.
      </p>

      <div className="mt-8 rounded-2xl border border-[#1a3353] bg-[#0B1D34]/40 p-6">
        <h2 className="text-sm font-bold text-[#EAF2F8]">Permisos de esta cuenta</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {session.permissions.map(permiso => (
            <li key={permiso} className="rounded-full border border-[#1a3353] bg-[#05080C] px-3 py-1 font-mono text-[11px] text-[#C3D3E2]">
              {permiso}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm leading-relaxed text-[#91A7BC]">
          Las pantallas de gestión están pendientes: necesitan una base de datos propia, que todavía no está definida.
          De momento esto sólo comprueba que el acceso y los roles funcionan.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          type="button"
          // Sólo se cierra la sesión: de la redirección se encarga la guarda
          // de arriba, que al quedarse sin sesión lleva a la puerta que toca.
          // Navegar aquí además competía con ella y el destino quedaba al azar.
          onClick={() => { void salir(); }}
          className="inline-flex items-center gap-2 rounded-full border border-[#1a3353] px-5 py-3 text-sm font-semibold text-[#91A7BC] transition-colors hover:border-[#42C7E8]/40 hover:text-[#EAF2F8]"
        >
          <LogOut size={16} aria-hidden="true" />
          Cerrar sesión
        </button>
        <Link href="/agentes" className="text-sm text-[#42C7E8] hover:underline">
          Volver al catálogo
        </Link>
      </div>
    </section>
  );
}
