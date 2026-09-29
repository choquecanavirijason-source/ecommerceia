"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  BookOpen,
  ChevronDown,
  Heart,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Package,
  Plus,
  Star,
  Store,
  Tags,
  TrendingUp,
  Truck,
  User,
  X,
} from "lucide-react";
import { Logo } from "@/presentation/atoms/Logo";
import { useAuth } from "@/presentation/hooks/useAuth";
import { getCurrentUser } from "@/shared/lib/marketplaceStorage";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

export const adminNavItems: DashboardNavItem[] = [
  { href: "/admin", label: "Panel Administrador", icon: LayoutDashboard },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/categorias", label: "Categorías", icon: Tags },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/proveedores", label: "Proveedores", icon: Truck },
  { href: "/admin/resenas", label: "Reseñas", icon: Star },
  { href: "/admin/blog", label: "Blog & Noticias", icon: BookOpen },
  { href: "/admin/suscriptores", label: "Suscriptores", icon: Mail },
  { href: "/admin/metricas", label: "Métricas", icon: TrendingUp },
  { href: "/", label: "Ver Tienda", icon: Store },
];

export const customerNavItems: DashboardNavItem[] = [
  { href: "/cuenta/dashboard", label: "Mis Pedidos", icon: Package },
  { href: "/cuenta/perfil", label: "Mi Perfil", icon: User },
  { href: "/favoritos", label: "Mis Favoritos", icon: Heart },
  { href: "/productos", label: "Catálogo", icon: Store },
];

export function DashboardLayout({
  navItems,
  title,
  children,
  actionButton,
}: {
  navItems: DashboardNavItem[];
  title: string;
  children: ReactNode;
  actionButton?: {
    label: string;
    href: string;
  };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, isLoggingOut } = useAuth();
  const user = getCurrentUser();
  const isAdmin = user?.roleName === "admin";

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Al entrar en lg, descartar el estado del drawer para recuperar el sidebar normal.
  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 64rem)");
    const closeMobileMenuOnDesktop = () => {
      if (desktopQuery.matches) setMobileMenuOpen(false);
    };

    desktopQuery.addEventListener("change", closeMobileMenuOnDesktop);
    closeMobileMenuOnDesktop();

    return () => desktopQuery.removeEventListener("change", closeMobileMenuOnDesktop);
  }, []);

  // Cerrar dropdown al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      router.push("/cuenta/ingresar");
    }
  };

  // Botón blanco superior del sidebar según el tipo de usuario (estilo Goodle Drive)
  const defaultActionButton = isAdmin
    ? { label: "Nuevo Producto", href: "/admin/productos" }
    : { label: "Explorar Tienda", href: "/productos" };

  const currentAction = actionButton ?? defaultActionButton;

  const initials = (user?.name || user?.email || "U")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="h-screen max-h-screen bg-[#F8F9FA] flex flex-col font-body overflow-hidden">
      
      {/* 1. TOP HEADER BAR GLOBAL LIMPIO (Sin buscador, blog ni configuración) */}
      <header className="h-16 shrink-0 bg-white border-b border-neutral-200/80 px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30 select-none shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        
        {/* Izquierda: Logotipo y Toggle Móvil */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="lg:hidden p-2 text-neutral-600 hover:text-neutral-900 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-[1.01]">
            <Logo variant="horizontal" size="md" imageClassName="h-8 sm:h-9 w-auto" />
          </Link>
        </div>

        {/* Derecha: Notificaciones y Dropdown de Usuario */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Campana de Notificaciones */}
          <button
            type="button"
            title="Notificaciones"
            className="relative p-2 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF6A00] ring-2 ring-white" />
          </button>

          {/* Chip de Usuario con Menú Desplegable (Dropdown) */}
          <div className="relative" ref={userDropdownRef}>
            <button
              type="button"
              onClick={() => setUserDropdownOpen((v) => !v)}
              className="flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-200/80 transition-colors group cursor-pointer select-none"
            >
              <span
                className="text-xs font-bold text-neutral-700 hidden sm:inline-block max-w-[130px] truncate"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {user?.name?.split(" ")[0] ?? "Mi Cuenta"}
              </span>
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#FF6A00] to-orange-500 text-white flex items-center justify-center text-xs font-black shadow-xs group-hover:scale-105 transition-transform">
                {initials}
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
                  userDropdownOpen ? "rotate-180 text-[#FF6A00]" : ""
                }`}
              />
            </button>

            {/* Menú Flotante Dropdown */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-neutral-200/80 p-2 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                {/* Cabecera del usuario */}
                <div className="px-3.5 py-2.5 border-b border-neutral-100 mb-1">
                  <p
                    className="text-xs font-bold text-neutral-900 truncate"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {user?.name ?? "Usuario"}
                  </p>
                  <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                    {user?.email ?? ""}
                  </p>
                </div>

                {/* Enlaces del Menú */}
                <div className="space-y-0.5">
                  {!isAdmin && (
                    <Link
                      href="/cuenta/perfil"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-50 hover:text-[#FF6A00] transition-colors"
                    >
                      <User className="w-4 h-4 text-[#FF6A00]" />
                      <span>Mi Perfil</span>
                    </Link>
                  )}

                  {!isAdmin && (
                    <Link
                      href="/cuenta/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-50 hover:text-[#FF6A00] transition-colors"
                    >
                      <Package className="w-4 h-4 text-neutral-400" />
                      <span>Mis Pedidos</span>
                    </Link>
                  )}

                  <Link
                    href="/"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-50 hover:text-[#FF6A00] transition-colors"
                  >
                    <Store className="w-4 h-4 text-neutral-400" />
                    <span>Ir a la Tienda</span>
                  </Link>
                </div>

                {/* Separador y Cerrar Sesión */}
                <div className="pt-1 mt-1 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      handleLogout();
                    }}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. BODY: SIDEBAR CURVADO + ÁREA DE CONTENIDO */}
      <div className="flex-1 flex overflow-hidden relative min-h-0">
        
        {/* SIDEBAR FIJO CON ESQUINA SUPERIOR CURVA (Naranja Principal #FF6A00 con detalles Blanco, Gris Claro y Turquesa) */}
        <aside
          className={`w-[80vw] max-w-[18rem] sm:w-72 bg-[#FF6A00] border-r border-orange-600/30 text-white flex flex-col h-full max-h-[calc(100vh-4rem)] shrink-0 transition-all duration-300 z-20
          rounded-r-[24px] lg:rounded-br-none lg:rounded-tr-[36px] shadow-[4px_0_24px_rgba(255,106,0,0.18)] overflow-hidden select-none
          ${
            mobileMenuOpen
              ? "fixed inset-y-0 left-0 top-16 shadow-2xl z-40 flex bg-[#FF6A00]"
              : "hidden lg:flex"
          }`}
        >
          {/* Parte Superior Fija: Botón de Acción */}
          <div className="p-4 sm:p-6 pb-2 shrink-0">
            <Link
              href={currentAction.href}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 sm:py-3.5 px-3 sm:px-6 bg-white hover:bg-[#F4F5F7] text-[#FF6A00] rounded-full font-bold text-[11px] sm:text-sm uppercase flex items-center justify-center gap-1.5 sm:gap-2.5 shadow-md shadow-black/10 hover:shadow-lg transition-all active:scale-[0.98] select-none cursor-pointer"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              <Plus className="w-4 h-4 stroke-[3] text-[#FF6A00]" />
              <span className="truncate">{currentAction.label}</span>
            </Link>
          </div>

          {/* Área de Navegación con Scroll Perfecto Personalizado (sin agrandar el sidebar) */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-2 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.35)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/55 transition-colors">
            <nav className="space-y-1.5 pt-1 pb-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                
                // Comprobación de ruta activa robusta (exacta o prefijo para subpáginas)
                const cleanPathname = (pathname || "").replace(/\/$/, "") || "/";
                const cleanHref = (item.href || "").replace(/\/$/, "") || "/";

                const isProfileMatch =
                  (cleanHref === "/admin/perfil" || cleanHref === "/cuenta/perfil") &&
                  (cleanPathname === "/admin/perfil" || cleanPathname === "/cuenta/perfil");

                const isActive =
                  isProfileMatch ||
                  cleanPathname === cleanHref ||
                  (cleanHref !== "/" &&
                    cleanHref !== "/admin" &&
                    cleanPathname.startsWith(cleanHref + "/"));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 select-none group ${
                      isActive
                        ? "!bg-white !text-[#FF6A00] shadow-md shadow-black/10"
                        : "text-white/85 hover:text-white hover:bg-white/15"
                    }`}
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    <Icon
                      className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105 ${
                        isActive ? "!text-[#FF6A00]" : "text-white/80 group-hover:text-white"
                      }`}
                    />
                    <span className="tracking-wide flex-1 truncate">{item.label}</span>
                    {isActive && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#18D6D1] shrink-0 shadow-xs" title="Activo" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Parte Inferior Fija del Sidebar: Botón Cerrar Sesión + Detalle Turquesa */}
          <div className="p-4 sm:p-6 pt-3 border-t border-white/20 shrink-0 space-y-3">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full py-2.5 px-4 rounded-2xl text-white/90 hover:text-white hover:bg-white/15 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              <span className="flex items-center gap-2.5">
                <LogOut className="w-4 h-4 text-white/80" />
                <span>Cerrar Sesión</span>
              </span>
              <span className="text-[10px] text-white/70 uppercase tracking-wider">Salir</span>
            </button>

            {/* Sello de marca al pie */}
            <div className="pt-1 flex items-center justify-between text-[9px] font-bold text-white/75 tracking-[0.16em] uppercase select-none" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              <span>UNO COMPRAS</span>
              <div className="w-2 h-2 rounded-full bg-[#18D6D1]" />
            </div>
          </div>
        </aside>

        {/* Fondo oscuro para móvil cuando el sidebar está abierto */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-xs"
          />
        )}

        {/* 3. ÁREA PRINCIPAL DE CONTENIDO */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
