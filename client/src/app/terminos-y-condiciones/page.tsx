import Link from "next/link";
import { ArrowLeft, FileText, Scale } from "lucide-react";
import { StorefrontTemplate } from "@/presentation/templates/StorefrontTemplate";
import { SectionEyebrow } from "@/presentation/atoms/SectionEyebrow";

export default function TerminosYCondicionesPage() {
  return (
    <StorefrontTemplate>
      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </Link>
        </div>

        <header className="mb-10">
          <SectionEyebrow icon={Scale}>Marco Legal</SectionEyebrow>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground font-heading tracking-tight mt-2">
            Términos y Condiciones
          </h1>
          <div className="w-16 h-1 bg-[#18D6D1] rounded-full mt-2.5" />
          <p className="text-xs sm:text-sm text-muted-foreground mt-3">
            Vigentes a partir de Septiembre de 2026
          </p>
        </header>

        <div className="space-y-8 text-neutral-700 font-body leading-relaxed text-sm sm:text-base">
          <section className="bg-card rounded-2xl border border-border p-6 shadow-xs">
            <h2 className="text-lg sm:text-xl font-bold text-foreground font-heading mb-3">
              1. Aceptación de los Términos
            </h2>
            <p>
              El ingreso, navegación y compra en el sitio web de <strong>UNO COMPRAS</strong> implica la aceptación plena e incondicional de los presentes Términos y Condiciones por parte del usuario. Si no estás de acuerdo con alguna disposición, te solicitamos abstenerte de operar en la plataforma.
            </p>
          </section>

          <section className="bg-card rounded-2xl border border-border p-6 shadow-xs">
            <h2 className="text-lg sm:text-xl font-bold text-foreground font-heading mb-3">
              2. Precios, Stock y Ofertas Flash
            </h2>
            <p className="mb-3">
              Todos los precios publicados en la tienda están expresados en moneda de curso legal e incluyen los impuestos aplicables.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm">
              <li>Las <strong>Ofertas Flash</strong> están sujetas a un tiempo límite de vigencia indicado por el temporizador y/o hasta agotar el stock asignado a la promoción.</li>
              <li>Las fotos y características técnicas de los productos son de carácter ilustrativo para facilitar la decisión de compra.</li>
            </ul>
          </section>

          <section className="bg-card rounded-2xl border border-border p-6 shadow-xs">
            <h2 className="text-lg sm:text-xl font-bold text-foreground font-heading mb-3">
              3. Envíos y Plazos de Entrega
            </h2>
            <p>
              Los despachos se realizan mediante servicios de correo y logística integrada a nivel nacional. Los tiempos de entrega estimados comienzan a computarse a partir de la confirmación efectiva del pago. El cliente recibirá un código de seguimiento en su correo electrónico registrado.
            </p>
          </section>

          <section className="bg-card rounded-2xl border border-border p-6 shadow-xs">
            <h2 className="text-lg sm:text-xl font-bold text-foreground font-heading mb-3">
              4. Garantía de Productos
            </h2>
            <p>
              Todos los productos comercializados en UNO COMPRAS cuentan con garantía legal y de fabricante ante defectos de fabricación o fallas técnicas. El período de garantía para cada artículo se encuentra indicado en su ficha de producto.
            </p>
          </section>

          <section className="bg-card rounded-2xl border border-border p-6 shadow-xs">
            <h2 className="text-lg sm:text-xl font-bold text-foreground font-heading mb-3">
              5. Derecho de Revocación y Devoluciones
            </h2>
            <p>
              De conformidad con la normativa de defensa del consumidor, el comprador tiene derecho a revocar la aceptación del producto dentro del plazo de 10 (diez) días corridos contados a partir de la recepción del bien, siempre que el mismo conserve su embalaje original y accesorios completos.
            </p>
          </section>
        </div>
      </div>
    </StorefrontTemplate>
  );
}
