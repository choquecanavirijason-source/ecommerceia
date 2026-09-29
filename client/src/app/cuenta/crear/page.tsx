"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import { Logo } from "@/presentation/atoms/Logo";
import { useAuth } from "@/presentation/hooks/useAuth";
import { isCustomerAuthenticated } from "@/shared/lib/marketplaceStorage";
import { ApiError } from "@/infrastructure/http/client";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { register, isRegistering } = useAuth();

  useEffect(() => {
    if (isCustomerAuthenticated()) {
      router.push(redirectTo);
    }
  }, [router, redirectTo]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      setError("Completá todos los campos requeridos.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setError("");

    try {
      const session = await register({ name: name.trim(), email, password });
      router.push(session.user.roleName === "admin" ? "/admin" : redirectTo);
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        const messages = Object.values(err.errors).flat();
        setError(messages.join(" "));
      } else {
        setError(
          err instanceof ApiError
            ? err.message
            : "No se pudo crear la cuenta. Intentá nuevamente.",
        );
      }
    }
  };

  return (
    <main className="min-h-screen bg-[#F4F5F7] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Resplandor ambiental de fondo */}
      <div
        aria-hidden="true"
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#FF6A00]/5 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#18D6D1]/10 blur-3xl pointer-events-none"
      />

      {/* Tarjeta con formato de credencial vertical UNO COMPRAS */}
      <div className="w-full max-w-[420px] bg-white rounded-[32px] sm:rounded-[36px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08),0_10px_25px_-5px_rgba(0,0,0,0.04)] border border-neutral-200/80 p-7 sm:p-9 relative overflow-hidden z-10 transition-all">
        
        {/* TOP: Logotipo Principal Apilado */}
        <div className="flex flex-col items-center text-center">
          <Link
            href="/"
            className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
            aria-label="Volver a UNO COMPRAS"
          >
            <Logo
              variant="principal"
              size="lg"
              imageClassName="h-14 sm:h-16 w-auto"
            />
          </Link>

          {/* Línea horizontal naranja oficial bajo el logo */}
          <div className="w-10 h-0.5 bg-[#FF6A00] rounded-full mt-4 mb-3" />

          {/* Título y subtítulo en Montserrat */}
          <h1
            className="text-lg sm:text-xl font-bold uppercase tracking-[0.16em] text-neutral-900"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            CREAR CUENTA
          </h1>
          <p
            className="text-[10.5px] font-medium uppercase tracking-[0.2em] text-neutral-400 mt-1"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            UNITE A UNO COMPRAS
          </p>
        </div>

        {/* Formulario de Registro */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-3.5 relative z-10" noValidate>
          {/* Campo: Nombre completo */}
          <div className="space-y-1">
            <label
              htmlFor="name"
              className="text-xs font-bold uppercase tracking-wider text-neutral-600 block pl-1"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Nombre Completo
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-neutral-400 pointer-events-none">
                <User className="w-4 h-4" />
              </span>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Juan Pérez"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50/70 border border-neutral-200 rounded-2xl text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 outline-none transition-all focus:bg-white focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/15"
              />
            </div>
          </div>

          {/* Campo: Correo Electrónico */}
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="text-xs font-bold uppercase tracking-wider text-neutral-600 block pl-1"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Correo Electrónico
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-neutral-400 pointer-events-none">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@unocompras.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50/70 border border-neutral-200 rounded-2xl text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 outline-none transition-all focus:bg-white focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/15"
              />
            </div>
          </div>

          {/* Campo: Contraseña */}
          <div className="space-y-1">
            <label
              htmlFor="password"
              className="text-xs font-bold uppercase tracking-wider text-neutral-600 block pl-1"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Contraseña
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-neutral-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                className="w-full pl-10 pr-10 py-2.5 bg-neutral-50/70 border border-neutral-200 rounded-2xl text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 outline-none transition-all focus:bg-white focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/15"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute right-3 p-1 text-neutral-400 hover:text-neutral-700 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Campo: Confirmar Contraseña */}
          <div className="space-y-1">
            <label
              htmlFor="confirmPassword"
              className="text-xs font-bold uppercase tracking-wider text-neutral-600 block pl-1"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Confirmar Contraseña
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-neutral-400 pointer-events-none">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50/70 border border-neutral-200 rounded-2xl text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 outline-none transition-all focus:bg-white focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/15"
              />
            </div>
          </div>

          {/* Mensaje de Error */}
          {error ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50/80 px-3.5 py-2 text-xs text-red-700 font-medium"
            >
              {error}
            </div>
          ) : null}

          {/* Botón de Registro estilo píldora naranja */}
          <button
            type="submit"
            disabled={isRegistering}
            className="w-full py-3 px-6 bg-[#FF6A00] hover:bg-[#e65f00] text-white rounded-full font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-70"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {isRegistering ? (
              <span>Creando cuenta...</span>
            ) : (
              <>
                <span>Crear cuenta</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Enlace para ir al login */}
        <div className="mt-4 text-center relative z-10">
          <p className="text-xs text-neutral-500">
            ¿Ya tenés una cuenta?{" "}
            <Link
              href={`/cuenta/ingresar?redirect=${encodeURIComponent(redirectTo)}`}
              className="font-bold text-[#FF6A00] hover:text-[#e65f00] transition-colors"
            >
              Iniciá sesión acá
            </Link>
          </p>
        </div>

        {/* BOTTOM DE LA TARJETA (Fiel a la foto de referencia): */}
        <div className="mt-6 pt-5 border-t border-neutral-100 flex items-end justify-between relative z-10">
          {/* Lado izquierdo: Doble barra naranja y eslogan */}
          <div className="flex flex-col gap-1.5 select-none">
            <div className="w-7 h-0.5 bg-[#FF6A00] rounded-full" />
            <p
              className="text-[9px] font-bold tracking-[0.16em] uppercase text-neutral-400 leading-tight"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              MÁS QUE COMPRAS,
              <br />
              POSIBILIDADES
            </p>
            <div className="w-7 h-0.5 bg-[#FF6A00] rounded-full" />
          </div>
        </div>

        {/* Esquina inferior derecha: Exactamente 1/4 (cuarta parte) de círculo cian recortado por el borde de la tarjeta */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-44 h-44 sm:w-48 sm:h-48 rounded-full border-[20px] sm:border-[24px] border-[#18D6D1] pointer-events-none"
        />
      </div>
    </main>
  );
}

export default function CustomerRegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
