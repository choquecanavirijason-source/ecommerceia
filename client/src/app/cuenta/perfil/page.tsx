"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Save,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  User,
} from "lucide-react";
import { useAuth } from "@/presentation/hooks/useAuth";
import {
  getCurrentCustomerEmail,
  getCurrentUser,
} from "@/shared/lib/marketplaceStorage";
import { ApiError } from "@/infrastructure/http/client";

function ProfileEditContent() {
  const router = useRouter();
  const { updateProfile, isUpdatingProfile } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [isLocating, setIsLocating] = useState(false);
  const [locatingMessage, setLocatingMessage] = useState("");

  useEffect(() => {
    const current = getCurrentUser();
    setIsAdmin(current?.roleName === "admin");
    setName(current?.name ?? "");
    setEmail(current?.email ?? getCurrentCustomerEmail() ?? "");
    setMobileNumber(current?.mobileNumber ?? "");
    setAddress(current?.address ?? "");
  }, []);

  const handleGetCurrentLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocatingMessage("Tu navegador no soporta geolocalización.");
      return;
    }

    setIsLocating(true);
    setLocatingMessage("Obteniendo coordenadas GPS...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            "https://nominatim.openstreetmap.org/reverse?lat=" + latitude + "&lon=" + longitude + "&format=json&addressdetails=1",
            { headers: { "Accept-Language": "es" } },
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const road = addr.road || addr.pedestrian || addr.street || "";
            const house = addr.house_number ? " #" + addr.house_number : "";
            const suburb = addr.neighbourhood || addr.suburb || addr.residential || "";
            const city = addr.city || addr.town || addr.municipality || addr.state || "";
            const formatted = [road + house, suburb, city].filter(Boolean).join(", ");
            setAddress(
              formatted ||
                data.display_name ||
                "Ubicación GPS: " + latitude.toFixed(5) + ", " + longitude.toFixed(5),
            );
            setLocatingMessage("📍 Ubicación obtenida y actualizada");
          } else {
            setAddress("Ubicación GPS: " + latitude.toFixed(5) + ", " + longitude.toFixed(5));
            setLocatingMessage("📍 Coordenadas GPS aplicadas");
          }
        } catch {
          setAddress("Ubicación GPS: " + latitude.toFixed(5) + ", " + longitude.toFixed(5));
          setLocatingMessage("📍 Coordenadas GPS aplicadas");
        } finally {
          setIsLocating(false);
          setTimeout(() => setLocatingMessage(""), 4000);
        }
      },
      () => {
        setIsLocating(false);
        setLocatingMessage("No se pudo acceder a tu ubicación.");
        setTimeout(() => setLocatingMessage(""), 4000);
      },
      { timeout: 8000 },
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (password && password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password && password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      await updateProfile({
        name: name.trim() || undefined,
        mobileNumber: mobileNumber.trim() || undefined,
        address: address.trim() || undefined,
        password: password || undefined,
      });
      setPassword("");
      setConfirmPassword("");
      setMessage("¡Tus datos han sido actualizados con éxito!");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo actualizar el perfil.",
      );
    }
  };

  const initials = (name || email || "U")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const content = (
      <div className="space-y-6">
        
        {/* Cabecera de la sección de perfil */}
        <div className="w-full bg-white rounded-3xl border border-neutral-200/80 p-6 md:p-8 shadow-sm relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-[#FF6A00] to-orange-500 text-white flex items-center justify-center text-xl md:text-2xl font-black shadow-md">
                  {initials}
                </div>
                <span
                  className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#18D6D1] border-2 border-white flex items-center justify-center text-[10px] text-neutral-900 font-bold"
                  title="Cuenta activa"
                >
                  ✓
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1
                    className="text-2xl md:text-3xl font-black text-neutral-900 truncate"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {name || "Mi Perfil"}
                  </h1>
                  {isAdmin ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-0.5 text-xs font-bold text-[#FF6A00]">
                      <ShieldCheck className="w-3.5 h-3.5" /> Administrador
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#18D6D1]/15 px-3 py-0.5 text-xs font-bold text-[#008f8a]">
                      <ShieldCheck className="w-3.5 h-3.5" /> Cliente Verificado
                    </span>
                  )}
                </div>
                <p className="text-sm text-neutral-500 mt-1 flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" /> {email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isAdmin ? (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-neutral-200 text-xs sm:text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Panel Administrador
                </Link>
              ) : (
                <Link
                  href="/cuenta/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-neutral-200 text-xs sm:text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Mis Pedidos
                </Link>
              )}
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF6A00] hover:bg-[#e65f00] text-white text-xs sm:text-sm font-bold tracking-wider uppercase transition-all shadow-sm active:scale-95"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                <ShoppingBag className="w-4 h-4" /> Ir a la Tienda
              </Link>
            </div>
          </div>
        </div>

        {/* Formulario y Sidebar */}
        <div className="w-full grid gap-6 lg:grid-cols-[1fr_360px]">
          
          {/* Formulario Principal de Edición */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Tarjeta 1: Información Personal */}
            <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 md:p-8 shadow-sm space-y-6">
              <div>
                <h2
                  className="text-lg font-black text-neutral-900 flex items-center gap-2"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  <User className="w-5 h-5 text-[#FF6A00]" /> Información Personal y Contacto
                </h2>
                <div className="w-8 h-0.5 bg-[#FF6A00] rounded-full mt-1.5 mb-2" />
                <p className="text-xs text-neutral-500">
                  Mantené tus datos personales actualizados para coordinar tus compras y envíos.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
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
                      placeholder="Tu nombre completo"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 outline-none transition focus:bg-white focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/15"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="phone"
                    className="text-xs font-bold uppercase tracking-wider text-neutral-600 block pl-1"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    Teléfono de Contacto
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-neutral-400 pointer-events-none">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      id="phone"
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="+54 (11) 4123-4567"
                      className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 outline-none transition focus:bg-white focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/15"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between pl-1">
                  <label
                    className="text-xs font-bold uppercase tracking-wider text-neutral-600"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    Correo Electrónico
                  </label>
                  <span className="text-[11px] text-neutral-400 font-medium flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Asociado a tu cuenta
                  </span>
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-neutral-400 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-100/70 border border-neutral-200 rounded-2xl text-xs sm:text-sm text-neutral-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Tarjeta 2: Dirección de Envío */}
            <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 md:p-8 shadow-sm space-y-4">
              <div>
                <h2
                  className="text-lg font-black text-neutral-900 flex items-center gap-2"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  <MapPin className="w-5 h-5 text-[#18D6D1]" /> Dirección de Entrega Habitual
                </h2>
                <div className="w-8 h-0.5 bg-[#18D6D1] rounded-full mt-1.5 mb-2" />
                <p className="text-xs text-neutral-500">
                  Esta dirección se completará automáticamente en tus órdenes y compras rápidas.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between pl-1">
                  <label
                    htmlFor="address"
                    className="text-xs font-bold uppercase tracking-wider text-neutral-600"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    Calle, Número, Piso o Barrio
                  </label>
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={isLocating}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00a6a0] hover:text-[#008f8a] hover:underline cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    {isLocating ? "Detectando..." : "Detectar mi ubicación GPS"}
                  </button>
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-neutral-400 pointer-events-none">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ej: Av. Corrientes 1234, CABA"
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 outline-none transition focus:bg-white focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/15"
                  />
                </div>
                {locatingMessage && (
                  <p className="text-xs font-semibold text-[#00a6a0] pl-1">{locatingMessage}</p>
                )}
              </div>
            </div>

            {/* Tarjeta 3: Seguridad y Contraseña */}
            <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 md:p-8 shadow-sm space-y-4">
              <div>
                <h2
                  className="text-lg font-black text-neutral-900 flex items-center gap-2"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  <KeyRound className="w-5 h-5 text-[#FF6A00]" /> Seguridad y Contraseña
                </h2>
                <div className="w-8 h-0.5 bg-[#FF6A00] rounded-full mt-1.5 mb-2" />
                <p className="text-xs text-neutral-500">
                  Completá estos campos únicamente si deseás actualizar tu clave de acceso.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="text-xs font-bold uppercase tracking-wider text-neutral-600 block pl-1"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    Nueva Contraseña
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-neutral-400 pointer-events-none">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full pl-10 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 outline-none transition focus:bg-white focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/15"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      className="absolute right-3 p-1 text-neutral-400 hover:text-neutral-700 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
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
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repetí tu nueva contraseña"
                      className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 outline-none transition focus:bg-white focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/15"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Banners de Notificación */}
            {message && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs sm:text-sm text-emerald-800 flex items-center gap-3 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-xs sm:text-sm text-red-800 flex items-center gap-3 font-medium">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Botón de Guardado */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                href="/cuenta/dashboard"
                className="px-6 py-3 rounded-full border border-neutral-200 text-xs sm:text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                Volver
              </Link>
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="px-8 py-3 rounded-full bg-[#FF6A00] hover:bg-[#e65f00] text-white font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-70"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                <Save className="w-4 h-4" />
                {isUpdatingProfile ? "Guardando cambios..." : "Guardar Cambios"}
              </button>
            </div>
          </form>

          {/* Sidebar informativo */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-[#FF6A00]/10 flex items-center justify-center text-[#FF6A00]">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3
                className="text-sm font-bold text-neutral-900 uppercase tracking-wider"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Tu Cuenta UNO COMPRAS
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Tus datos están protegidos bajo estrictos estándares de seguridad y se sincronizan en tiempo real con nuestra plataforma.
              </p>
              <div className="pt-3 border-t border-neutral-100 space-y-2.5 text-xs text-neutral-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#00a6a0]" />
                  <span>Compra 100% Protegida</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#FF6A00]" />
                  <span>Cifrado de credenciales</span>
                </div>
              </div>
            </div>

            {/* Slogan de marca */}
            <div className="bg-gradient-to-br from-neutral-50 to-white rounded-3xl border border-neutral-200/80 p-6 relative overflow-hidden">
              <div className="w-7 h-0.5 bg-[#FF6A00] rounded-full mb-2" />
              <p
                className="text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-400 leading-tight"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                MÁS QUE COMPRAS,
                <br />
                POSIBILIDADES
              </p>
              <div className="w-7 h-0.5 bg-[#FF6A00] rounded-full mt-2" />
              
              <div
                aria-hidden="true"
                className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full border-[14px] border-[#18D6D1] pointer-events-none"
              />
            </div>
          </div>

        </div>
      </div>
  );

  return content;
}

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileEditContent />
    </Suspense>
  );
}
