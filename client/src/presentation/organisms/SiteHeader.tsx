"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Heart,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Phone,
  Search,
  User,
  X,
  ChevronRight,
} from "lucide-react";
import { Logo } from "@/presentation/atoms/Logo";
import { CartPopover } from "@/presentation/organisms/CartPopover";
import { useCategories } from "@/presentation/hooks/useCatalog";
import { useFavorites } from "@/presentation/hooks/useFavorites";
import { useHasMounted } from "@/presentation/hooks/useHasMounted";
import { useAuth } from "@/presentation/hooks/useAuth";
import {
  getCurrentCustomerName,
  getCurrentUser,
  isCustomerAuthenticated,
} from "@/shared/lib/marketplaceStorage";

const NAV_ITEMS = [
  { label: "EXPLORAR AGENTES", href: "/agentes" },
  { label: "SOLICITAR DEMO", href: "/solicitar-demo" },
  { label: "SOLICITAR COTIZACIÓN", href: "/solicitar-cotizacion" },
];

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const mounted = useHasMounted();
  const { data: categories } = useCategories();
  const { count: favoritesCount } = useFavorites();
  const { logout, isLoggingOut } = useAuth();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [authenticated, setAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLFormElement>(null);
  const searchToggleRef = useRef<HTMLButtonElement>(null);

  const isNavItemActive = (href: string) => {
    const cleanPathname = (pathname || "/").replace(/\/$/, "") || "/";
    const cleanHref = href.replace(/\/$/, "") || "/";

    return cleanHref === "/"
      ? cleanPathname === "/"
      : cleanPathname === cleanHref || cleanPathname.startsWith(`${cleanHref}/`);
  };

  useEffect(() => {
    const loggedIn = isCustomerAuthenticated();
    setAuthenticated(loggedIn);
    setUserName(loggedIn ? getCurrentCustomerName() : null);
    setIsAdmin(getCurrentUser()?.roleName === "admin");
  }, [drawerOpen]);

  // Focus input when search expands
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Click outside search container to close search
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node) &&
        !searchToggleRef.current?.contains(e.target as Node)
      ) {
        if (!searchVal.trim()) {
          setSearchOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchVal]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchVal.trim();
    if (query) {
      setSearchOpen(false);
      router.push(`/buscar?q=${encodeURIComponent(query)}`);
    } else {
      setSearchOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setAuthenticated(false);
    setUserName(null);
    setDrawerOpen(false);
    router.push("/");
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#05080C] border-b border-[#1a3353] shadow-lg transition-all text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-[clamp(1rem,3vw,3rem)] gap-y-3 px-[clamp(1rem,3vw,2rem)] py-[clamp(0.75rem,1.5vw,0.875rem)] lg:grid-cols-[auto_minmax(0,1fr)_auto]">
          <Link
            href="/"
            className="col-start-1 row-start-1 w-fit transition-transform hover:scale-[1.01] active:scale-[0.99]"
            aria-label="UNO COMPRAS Inicio"
          >
            <span className="hidden sm:block">
              <Logo
                variant="principal"
                size="lg"
                imageClassName="h-[clamp(3rem,5vw,4rem)] w-auto"
              />
            </span>
            <span className="block sm:hidden">
              <Logo
                variant="isotipo"
                size="md"
                imageClassName="h-10 w-10"
              />
            </span>
          </Link>

          {/* La navegación dispone de su propia fila hasta que cabe junto al logo. */}
          <nav
            aria-label="Navegación principal"
            className="col-span-2 row-start-2 hidden min-w-0 flex-wrap items-center justify-center md:flex lg:col-span-1 lg:col-start-2 lg:row-start-1"
          >
            <div className="flex items-center gap-x-[clamp(1rem,2.5vw,2rem)] px-8 py-2.5 rounded-full border border-[#287FF0]/30 bg-[#0B1D34]/50 backdrop-blur-sm shadow-[0_0_15px_rgba(40,127,240,0.1)]">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={isNavItemActive(item.href) ? "page" : undefined}
                  className={`relative shrink-0 whitespace-nowrap text-[clamp(0.7rem,1vw,0.75rem)] font-bold tracking-[0.1em] uppercase transition-colors py-1 group ${
                    isNavItemActive(item.href)
                      ? "text-[#42C7E8]"
                      : "text-[#EAF2F8] hover:text-[#42C7E8]"
                  }`}
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {item.label}
                <span
                  className={`absolute bottom-0 left-0 h-[2px] bg-[#42C7E8] transition-all duration-200 rounded-full ${
                    isNavItemActive(item.href) ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            ))}
            </div>
          </nav>

          {/* Las acciones y el eslogan reservan su ancho, sin competir con los links. */}
          <div className="col-start-2 row-start-1 flex flex-col items-end justify-center gap-1 select-none lg:col-start-3">
            <div className="relative flex items-center gap-[clamp(0.5rem,1.5vw,1rem)]">
              <button
                ref={searchToggleRef}
                type="button"
                onClick={() => {
                  if (searchOpen && searchVal.trim()) {
                    handleSearchSubmit();
                  } else {
                    setSearchOpen((v) => !v);
                  }
                }}
                className="flex size-10 shrink-0 items-center justify-center p-2 text-[#EAF2F8] hover:text-[#42C7E8] hover:scale-105 transition-all rounded-full hover:bg-[#0B1D34] active:scale-95"
                aria-label="Buscar"
                aria-expanded={searchOpen}
                aria-controls="header-search"
              >
                <Search className="size-[clamp(1.25rem,3vw,1.5rem)] stroke-[1.8]" />
              </button>

              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="flex size-10 shrink-0 items-center justify-center p-2 text-[#EAF2F8] hover:text-[#42C7E8] hover:scale-105 transition-all rounded-full hover:bg-[#0B1D34] active:scale-95"
                aria-label="Abrir menú"
              >
                <Menu className="w-6 h-6 stroke-[2]" />
              </button>
            </div>
          </div>

          {/* Abrir la búsqueda aumenta la altura, nunca el ancho de la cabecera. */}
          {searchOpen && (
            <form
              id="header-search"
              ref={searchContainerRef}
              role="search"
              onSubmit={handleSearchSubmit}
              className="col-span-full row-start-2 flex min-w-0 items-center gap-2 rounded-full border border-[#1a3353] bg-[#0B1D34] px-3 py-1.5 shadow-inner transition-colors focus-within:border-[#287FF0] focus-within:bg-[#05080C] md:row-start-3 lg:row-start-2"
            >
              <input
                ref={searchInputRef}
                type="search"
                aria-label="Buscar productos"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setSearchOpen(false);
                    searchToggleRef.current?.focus();
                  }
                }}
                placeholder="Buscar productos..."
                className="min-w-0 flex-1 bg-transparent text-sm text-[#EAF2F8] placeholder-[#91A7BC] focus:outline-none"
              />
              {searchVal && (
                <button
                  type="button"
                  aria-label="Limpiar búsqueda"
                  onClick={() => {
                    setSearchVal("");
                    searchInputRef.current?.focus();
                  }}
                  className="flex size-10 shrink-0 items-center justify-center text-[#91A7BC] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                aria-label="Enviar búsqueda"
                className="flex size-10 shrink-0 items-center justify-center rounded-full text-[#91A7BC] hover:text-[#42C7E8]"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>
          )}
        </div>
      </header>

      {/* SLIDE-OVER DRAWER (HAMBURGER MENU) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Content Panel */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <Link href="/" onClick={() => setDrawerOpen(false)}>
                <Logo variant="horizontal" size="md" />
              </Link>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-2 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 rounded-full transition-colors"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

              {/* User Section */}
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                {authenticated ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6A00] to-orange-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                        {userName ? userName.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-neutral-500 font-medium">¡Hola!</p>
                        <p className="text-sm font-bold text-neutral-900 truncate">
                          {userName ?? "Mi cuenta"}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-200/60 flex flex-col gap-1">
                      {!isAdmin && (
                        <Link
                          href="/cuenta/dashboard"
                          onClick={() => setDrawerOpen(false)}
                          className="flex items-center gap-2.5 py-2 px-2.5 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-white hover:text-[#FF6A00] transition-colors"
                        >
                          <Package className="w-4 h-4 text-neutral-400" />
                          Mis Pedidos
                        </Link>
                      )}
                      {!isAdmin && (
                        <Link
                          href="/cuenta/perfil"
                          onClick={() => setDrawerOpen(false)}
                          className="flex items-center gap-2.5 py-2 px-2.5 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-white hover:text-[#FF6A00] transition-colors"
                        >
                          <User className="w-4 h-4 text-neutral-400" />
                          Editar Mi Perfil
                        </Link>
                      )}
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setDrawerOpen(false)}
                          className="flex items-center gap-2.5 py-2 px-2.5 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-white hover:text-[#FF6A00] transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-neutral-400" />
                          Panel Administrador
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex items-center gap-2.5 py-2 px-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-center sm:text-left">
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900">
                        Bienvenido a UNO COMPRAS
                      </h4>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Iniciá sesión para ver tus pedidos y favoritos.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <Link
                        href="/cuenta/ingresar"
                        onClick={() => setDrawerOpen(false)}
                        className="flex-1 py-2.5 px-4 bg-[#FF6A00] hover:bg-[#e65f00] text-white text-xs font-subheading font-medium tracking-wide text-center rounded-full transition-all shadow-sm active:scale-95"
                      >
                        Iniciar Sesión
                      </Link>
                      <Link
                        href="/cuenta/crear"
                        onClick={() => setDrawerOpen(false)}
                        className="flex-1 py-2.5 px-4 bg-transparent border-2 border-[#18D6D1] text-[#00a6a0] hover:bg-[#18D6D1]/10 text-xs font-subheading font-medium tracking-wide text-center rounded-full transition-all active:scale-95"
                      >
                        Registrarse
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Main Navigation */}
              <div className="md:hidden space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 px-2 mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Navegación
                </p>
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    aria-current={isNavItemActive(item.href) ? "page" : undefined}
                    className={`flex items-center justify-between py-2.5 px-3 rounded-xl text-sm font-bold transition-colors ${
                      isNavItemActive(item.href)
                        ? "bg-orange-50 text-[#FF6A00]"
                        : "text-neutral-800 hover:bg-neutral-50 hover:text-[#FF6A00]"
                    }`}
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    <span>{item.label}</span>
                    <ChevronRight className={`w-4 h-4 ${isNavItemActive(item.href) ? "text-[#FF6A00]" : "text-neutral-300"}`} />
                  </Link>
                ))}
              </div>

              {/* Quick links: Favoritos */}
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 px-2 mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Accesos Rápidos
                </p>
                <Link
                  href="/favoritos"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl text-sm font-semibold text-neutral-800 hover:bg-neutral-50 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Heart className="w-4 h-4 text-[#FF6A00]" />
                    Mis Favoritos
                  </span>
                  {mounted && favoritesCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-[#18D6D1] text-neutral-900 rounded-full">
                      {favoritesCount}
                    </span>
                  )}
                </Link>
              </div>

              {/* Categorías */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    Categorías Populares
                  </p>
                  <Link
                    href="/categorias"
                    onClick={() => setDrawerOpen(false)}
                    className="text-xs font-bold text-[#FF6A00] hover:underline"
                  >
                    Ver todas
                  </Link>
                </div>

                <div className="grid grid-cols-1 gap-1">
                  {(categories ?? []).slice(0, 8).map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/categorias/${cat.slug}`}
                      onClick={() => setDrawerOpen(false)}
                      className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-neutral-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
                          style={{ background: cat.color }}
                        >
                          <cat.icon className="w-3.5 h-3.5 text-neutral-700" strokeWidth={2} />
                        </span>
                        <span className="text-sm font-medium text-neutral-800 group-hover:text-[#FF6A00] transition-colors">
                          {cat.name}
                        </span>
                      </div>
                      <span className="text-xs text-neutral-400 font-medium">
                        {cat.count}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Support & Help */}
              <div className="pt-2 border-t border-neutral-100 text-xs text-neutral-500 space-y-2 px-2">
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-neutral-400" /> +54 (11) 4123-4567
                </p>
                <p className="flex items-center gap-2">
                  <HelpCircle className="w-3.5 h-3.5 text-neutral-400" /> Atención Lun a Sáb 9:00 a 19:00 hs
                </p>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
