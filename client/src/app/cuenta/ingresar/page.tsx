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
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/presentation/atoms/Logo";
import { useAuth } from "@/presentation/hooks/useAuth";
import { isCustomerAuthenticated } from "@/shared/lib/marketplaceStorage";
import { ApiError } from "@/infrastructure/http/client";

type DemoAccount = {
  label: string;
  email: string;
  password: string;
  hint: string;
  icon: typeof ShoppingBag;
};

const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  {
    label: "Cliente",
    email: "cliente@unocompras.com",
    password: "password",
    hint: "Comprador final",
    icon: ShoppingBag,
  },
  {
    label: "Administrador",
    email: "admin@unocompras.com",
    password: "password",
    hint: "Gestión y catálogo",
    icon: ShieldCheck,
  },
] as const;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [filledKey, setFilledKey] = useState<string | null>(null);

  const { login, isLoggingIn } = useAuth();

  useEffect(() => {
    if (isCustomerAuthenticated()) {
      router.push(redirectTo);
    }
  }, [router, redirectTo]);

  const handleFillDemo = (account: DemoAccount) => {
    setEmail(account.email);
    setPassword(account.password);
    setError("");
    setFilledKey(account.email);
    window.setTimeout(() => setFilledKey(null), 1500);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      const session = await login({ email, password });
      const explicitRedirect = searchParams.get("redirect");
      const destination =
        explicitRedirect ||
        (session.user.roleName === "admin" ? "/admin" : "/cuenta/dashboard");
      router.push(destination);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo iniciar sesión. Verificá tus credenciales.",
      );
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
            INICIAR SESIÓN
          </h1>
          <p
            className="text-[10.5px] font-medium uppercase tracking-[0.2em] text-neutral-400 mt-1"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            ACCEDE A TU CUENTA
          </p>
        </div>

        {/* Formulario de Login */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 relative z-10" noValidate>
          {/* Campo: Correo con icono */}
          <div className="space-y-1.5">
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
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-neutral-50/70 border border-neutral-200 rounded-2xl text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 outline-none transition-all focus:bg-white focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/15"
              />
            </div>
          </div>

          {/* Campo: Contraseña con icono y toggle */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between pl-1">
              <label
                htmlFor="password"
                className="text-xs font-bold uppercase tracking-wider text-neutral-600"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Contraseña
              </label>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-neutral-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-neutral-50/70 border border-neutral-200 rounded-2xl text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 outline-none transition-all focus:bg-white focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/15"
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

          {/* Mensaje de Error */}
          {error ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50/80 px-3.5 py-2 text-xs text-red-700 font-medium"
            >
              {error}
            </div>
          ) : null}

          {/* Botón de Ingreso estilo píldora naranja */}
          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-3 px-6 bg-[#FF6A00] hover:bg-[#e65f00] text-white rounded-full font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-70"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {isLoggingIn ? (
              <span>Ingresando...</span>
            ) : (
              <>
                <span>Ingresar</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Enlace para registrarse */}
        <div className="mt-4 text-center relative z-10">
          <p className="text-xs text-neutral-500">
            ¿No tenés una cuenta?{" "}
            <Link
              href={`/cuenta/crear?redirect=${encodeURIComponent(redirectTo)}`}
              className="font-bold text-[#FF6A00] hover:text-[#e65f00] transition-colors"
            >
              Registrate acá
            </Link>
          </p>
        </div>

        {/* BOTTOM DE LA TARJETA (Fiel a la foto de referencia): */}
        <div className="mt-8 pt-6 border-t border-neutral-100 flex items-end justify-between relative z-10">
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

      {/* Cuentas Demo de Prueba (para testing rápido y desarrollo) */}
      <div className="w-full max-w-[420px] mt-4 px-2 select-none">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            <Sparkles className="w-3 h-3 text-[#FF6A00]" /> Cuentas de prueba rápida
          </span>
          {filledKey && (
            <span className="text-[10px] font-bold text-[#00a6a0]">
              ✓ Rellenado
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map((acc) => {
            const Icon = acc.icon;
            const isFilled = filledKey === acc.email;
            return (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleFillDemo(acc)}
                className={`flex items-center gap-2 p-2 rounded-2xl bg-white border text-left transition-all hover:border-[#FF6A00]/50 hover:shadow-xs active:scale-95 ${
                  isFilled ? "border-[#FF6A00] bg-orange-50/50" : "border-neutral-200"
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 text-neutral-600">
                  <Icon className="w-3.5 h-3.5 text-[#FF6A00]" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-neutral-800 leading-tight truncate">
                    {acc.label}
                  </p>
                  <p className="text-[10px] text-neutral-400 leading-tight truncate">
                    {acc.hint}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
