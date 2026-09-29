import { Gift, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { NewsletterForm } from "@/presentation/molecules/NewsletterForm";

export function NewsletterSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8 pb-14">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-white via-[#fafafa] to-[#f0fdfa]/40 border border-neutral-200/80 shadow-sm">
        {/* Arco turquesa corporativo en la esquina superior derecha (sello de identidad de marca) */}
        <div
          className="absolute -top-16 -right-16 w-56 h-56 rounded-full border-[16px] border-[#18D6D1]/35 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-[#FF6A00]/5 blur-2xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 text-center py-12 px-6 sm:px-10 max-w-3xl mx-auto">
          {/* Slogan institucional con barra naranja */}
          <div className="inline-flex flex-col items-center mb-3">
            <span
              className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#00a6a0]"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              MÁS QUE COMPRAS, POSIBILIDADES
            </span>
            <div className="w-12 h-0.5 bg-[#FF6A00] rounded-full mt-1.5" />
          </div>

          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-black text-neutral-900 tracking-tight mb-3 font-heading"
          >
            Sumate a la Comunidad UNO COMPRAS
          </h2>

          <p className="text-neutral-600 text-sm sm:text-base leading-relaxed mb-8 max-w-xl mx-auto font-body">
            Suscribite gratis para recibir ofertas exclusivas, cupones de descuento y novedades antes que nadie directo en tu correo.
          </p>

          <NewsletterForm />

          {/* Micro-beneficios con badges oficiales */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-6 border-t border-neutral-200/70 text-xs text-neutral-500 font-body">
            <span className="flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-[#FF6A00]" /> Cupón de bienvenida
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#18D6D1]" /> Descuentos exclusivos
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Cero spam. Cancelá cuando quieras.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
