import Link from "next/link";
import { Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { Logo } from "@/presentation/atoms/Logo";
import { SocialIconRow } from "@/presentation/molecules/SocialIconRow";
import { FooterLinkColumn } from "@/presentation/molecules/FooterLinkColumn";

const CONTACT_ITEMS = [
  { Icon: MapPin, text: "Buenos Aires, Argentina" },
  { Icon: Phone, text: "+54 (11) 4123-4567" },
  { Icon: Mail, text: "hola@unocompras.com" },
];

const LINK_COLUMNS = [
  {
    title: "Enlaces Rápidos",
    links: [
      { label: "Inicio", href: "/" },
      { label: "Catálogo de Productos", href: "/productos" },
      { label: "Todas las Categorías", href: "/categorias" },
      { label: "Ofertas Flash", href: "/ofertas" },
      { label: "Blog & Guías", href: "/blog" },
    ],
  },
  {
    title: "Categorías",
    links: [
      { label: "Herramientas Eléctricas", href: "/categorias/herramientas-electricas" },
      { label: "Herramientas Manuales", href: "/categorias/herramientas-manuales" },
      { label: "Pinturas", href: "/categorias/pinturas" },
      { label: "Plomería", href: "/categorias/plomeria" },
      { label: "Electricidad", href: "/categorias/electricidad" },
    ],
  },
  {
    title: "Mi Cuenta",
    links: [
      { label: "Mi Perfil", href: "/cuenta/perfil" },
      { label: "Mis Pedidos", href: "/cuenta/dashboard" },
      { label: "Mis Favoritos", href: "/favoritos" },
      { label: "Iniciar Sesión", href: "/cuenta/ingresar" },
    ],
  },
];

const LEGAL_LINKS = [
  { label: "Política de Privacidad", href: "/politica-de-privacidad" },
  { label: "Términos y Condiciones", href: "/terminos-y-condiciones" },
  { label: "Botón de Arrepentimiento", href: "/arrepentimiento" },
];

export function SiteFooter() {
  return (
    <footer className="bg-[#F9FAFB] text-neutral-900 border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <Logo variant="horizontal" size="md" />
            </div>

            {/* Slogan oficial con barra naranja */}
            <div className="inline-block pt-1">
              <span
                className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#00a6a0] block"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                MÁS QUE COMPRAS, POSIBILIDADES
              </span>
              <div className="w-10 h-0.5 bg-[#FF6A00] rounded-full mt-1" />
            </div>

            <p className="text-sm text-neutral-600 leading-relaxed max-w-sm font-body">
              Una plataforma creada para hacer tu compra por internet simple, rápida y confiable. Todo lo que necesitás, más cerca.
            </p>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#18D6D1]/10 border border-[#18D6D1]/30 text-xs text-[#008f8a]">
              <ShieldCheck className="w-4 h-4 text-[#00a6a0]" />
              <span className="font-medium font-subheading">Compra 100% Protegida · Envíos a todo el país</span>
            </div>

            <div className="space-y-2 pt-2 font-body">
              {CONTACT_ITEMS.map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5 text-xs text-neutral-600">
                  <Icon className="w-4 h-4 text-[#00a6a0] shrink-0" /> {text}
                </div>
              ))}
            </div>

            <div className="pt-2">
              <SocialIconRow />
            </div>
          </div>

          {LINK_COLUMNS.map((col) => (
            <FooterLinkColumn key={col.title} title={col.title} links={col.links} />
          ))}
        </div>
      </div>

      <div className="border-t border-neutral-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-500 text-center md:text-left font-body">
            © 2026 UNO COMPRAS. Todos los derechos reservados.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-500 font-body">
            {LEGAL_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="hover:text-[#FF6A00] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
