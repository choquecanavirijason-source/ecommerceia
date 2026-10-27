"use client";

import { useId, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, LogIn, AlertCircle } from "lucide-react";
import { useDemoSession } from "@/presentation/hooks/useDemoSession";
import { destinoTrasAcceder, esAdministrador } from "@/application/auth/demoSession";
import { DEMO_ACCOUNTS } from "@/demo/accounts";

interface AccessFormProps {
  /** Puerta por la que se entra; cambia el texto y qué cuenta se sugiere. */
  modo: "cliente" | "admin";
}

/**
 * Formulario de acceso de la demo.
 *
 * Una sola pieza para las dos puertas: el rol no lo decide la pantalla sino
 * la cuenta, así que duplicar el formulario sólo daría dos sitios donde
 * arreglar el mismo fallo. `modo` cambia el texto y la cuenta sugerida.
 *
 * Las credenciales se enseñan en pantalla a propósito: son de demostración y
 * están en el repositorio. No protegen nada.
 */
export function AccessForm({ modo }: AccessFormProps) {
  const router = useRouter();
  const { entrar } = useDemoSession();
  const idCorreo = useId();
  const idClave = useId();

  const sugerida = DEMO_ACCOUNTS.find(cuenta =>
    modo === "admin" ? cuenta.user.roleName === "admin" : cuenta.user.roleName !== "admin",
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function alEnviar(evento: FormEvent) {
    evento.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const sesion = await entrar(email, password);
      // La puerta de administración no acepta cuentas de cliente: entrar por
      // ella con una cuenta sin permisos sería confuso.
      if (modo === "admin" && !esAdministrador(sesion)) {
        setError("Esa cuenta no tiene acceso de administración.");
        return;
      }
      router.push(destinoTrasAcceder(sesion));
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : "No se pudo iniciar sesión.");
    } finally {
      setEnviando(false);
    }
  }

  const esAdmin = modo === "admin";

  return (
    <section className="mx-auto w-full max-w-md px-4 py-16 sm:py-24">
      <div className="relative">
        <div className="rounded-3xl border border-[#1a3353] bg-[#0B1D34]/40 p-7 sm:p-9">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#42C7E8]">
            {esAdmin ? "Administración" : "Tu cuenta"}
          </p>
          <h1 className="text-2xl font-bold text-[#EAF2F8] sm:text-3xl">
            {esAdmin ? "Acceso del equipo" : "Entra a tu cuenta"}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#91A7BC]">
            {esAdmin
              ? "Para gestionar el catálogo y las solicitudes de la demostración."
              : "Para seguir tus solicitudes de demo y cotización."}
          </p>

          <form onSubmit={alEnviar} className="mt-8 space-y-5" noValidate>
            <div>
              <label htmlFor={idCorreo} className="mb-2 block text-sm font-medium text-[#C3D3E2]">
                Correo
              </label>
              <input
                id={idCorreo}
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={evento => setEmail(evento.target.value)}
                className="w-full rounded-xl border border-[#1a3353] bg-[#05080C] px-4 py-3 text-sm text-[#EAF2F8] outline-none transition-colors placeholder:text-[#5a6b7d] focus:border-[#42C7E8]"
                placeholder={sugerida?.email}
              />
            </div>

            <div>
              <label htmlFor={idClave} className="mb-2 block text-sm font-medium text-[#C3D3E2]">
                Contraseña
              </label>
              <input
                id={idClave}
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={evento => setPassword(evento.target.value)}
                className="w-full rounded-xl border border-[#1a3353] bg-[#05080C] px-4 py-3 text-sm text-[#EAF2F8] outline-none transition-colors placeholder:text-[#5a6b7d] focus:border-[#42C7E8]"
              />
            </div>

            {error && (
              <p role="alert" className="flex items-start gap-2 rounded-xl border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 px-4 py-3 text-sm text-[#ffb4b4]">
                <AlertCircle size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#287FF0] px-6 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:bg-[#216bd0] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {esAdmin ? <ShieldCheck size={16} aria-hidden="true" /> : <LogIn size={16} aria-hidden="true" />}
              {enviando ? "Entrando…" : "Entrar"}
            </button>
          </form>

          {sugerida && (
            <div className="mt-7 rounded-2xl border border-[#1a3353] bg-[#05080C]/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#42C7E8]">Cuenta de prueba</p>
              <dl className="mt-2 space-y-1 font-mono text-xs text-[#C3D3E2]">
                <div className="flex gap-2"><dt className="text-[#91A7BC]">correo</dt><dd>{sugerida.email}</dd></div>
                <div className="flex gap-2"><dt className="text-[#91A7BC]">clave</dt><dd>{sugerida.password}</dd></div>
              </dl>
            </div>
          )}

          <p className="mt-6 text-xs leading-relaxed text-[#91A7BC]">
            Acceso de demostración: no hay base de datos ni registro. Las credenciales están a la vista porque no
            protegen nada y los datos son de ejemplo.
          </p>

          <p className="mt-5 text-sm text-[#91A7BC]">
            {esAdmin ? (
              <>¿No eres del equipo? <Link href="/acceso" className="text-[#42C7E8] hover:underline">Entra como cliente</Link></>
            ) : (
              <>¿Eres del equipo? <Link href="/acceso/admin" className="text-[#42C7E8] hover:underline">Acceso de administración</Link></>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
