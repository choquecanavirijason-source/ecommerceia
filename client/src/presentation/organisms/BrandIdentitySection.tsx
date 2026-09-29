"use client";

import Link from "next/link";
import { ArrowRight, FileText, Megaphone, MessageCircle, Quote } from "lucide-react";

const BRAND_QUOTES = [
  {
    text: "Comprá fácil.",
    bg: "bg-[#eaf9f8]",
    border: "border-[#18D6D1]/30",
    quoteColor: "text-[#18D6D1]",
  },
  {
    text: "“Todo lo que necesitás, más cerca.”",
    bg: "bg-[#fff3eb]",
    border: "border-[#FF6A00]/25",
    quoteColor: "text-[#FF6A00]",
  },
  {
    text: "Elegí, comprá y recibí.",
    bg: "bg-[#fff3eb]",
    border: "border-[#FF6A00]/25",
    quoteColor: "text-[#FF6A00]",
  },
  {
    text: "Simple, rápido y confiable.",
    bg: "bg-[#eaf9f8]",
    border: "border-[#18D6D1]/30",
    quoteColor: "text-[#18D6D1]",
  },
];

export function BrandIdentitySection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative overflow-hidden">

      {/* 1. Tono de voz y Cómo comunica la marca */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">

        {/* Tono de voz */}
        <div className="flex items-start gap-4 p-6 rounded-3xl bg-white border border-neutral-100 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-[#e8faf9] text-[#18D6D1] flex items-center justify-center flex-shrink-0 shadow-xs">
            <Megaphone className="w-7 h-7 stroke-[2]" />
          </div>
          <div>
            <h3
              className="text-lg font-bold text-neutral-900 font-heading leading-tight"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Tono de voz
            </h3>
            <div className="w-10 h-0.5 bg-[#18D6D1] rounded-full mt-1.5 mb-2" />
            <p className="text-sm text-neutral-600 font-reading leading-relaxed">
              Claro, directo, confiable y cercano.
            </p>
          </div>
        </div>

        {/* Cómo comunica la marca */}
        <div className="flex items-start gap-4 p-6 rounded-3xl bg-white border border-neutral-100 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-[#fff2eb] text-[#FF6A00] flex items-center justify-center flex-shrink-0 shadow-xs">
            <MessageCircle className="w-7 h-7 stroke-[2]" />
          </div>
          <div>
            <h3
              className="text-lg font-bold text-neutral-900 font-heading leading-tight"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Cómo comunica la marca
            </h3>
            <div className="w-10 h-0.5 bg-[#FF6A00] rounded-full mt-1.5 mb-2" />
            <p className="text-sm text-neutral-600 font-reading leading-relaxed">
              Con mensajes simples, beneficios concretos y llamados a la acción claros.
            </p>
          </div>
        </div>

      </div>

      {/* 2. Frases de marca */}
      <div className="mb-12">
        <div className="mb-6">
          <h2
            className="text-2xl font-bold text-neutral-900 font-heading"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Frases de marca
          </h2>
          <div className="w-12 h-1 bg-[#18D6D1] rounded-full mt-1.5 mb-2" />
          <p className="text-xs text-neutral-500 font-reading">
            Nuestras palabras también construyen marca.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {BRAND_QUOTES.map((quote) => (
            <div
              key={quote.text}
              className={`${quote.bg} ${quote.border} border rounded-2xl p-6 flex items-center gap-4 shadow-xs transition-transform duration-200 hover:-translate-y-0.5`}
            >
              <Quote className={`w-8 h-8 ${quote.quoteColor} fill-current flex-shrink-0 opacity-90`} />
              <p
                className="text-base sm:text-lg font-bold text-neutral-800 font-subheading leading-snug"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {quote.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Llamados a la acción (CTAs) */}
      <div className="mb-12">
        <div className="mb-6">
          <h2
            className="text-2xl font-bold text-neutral-900 font-heading"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Llamados a la acción
          </h2>
          <div className="w-12 h-1 bg-[#18D6D1] rounded-full mt-1.5" />
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <Link
            href="/categorias"
            className="inline-flex items-center gap-2 bg-[#FF6A00] hover:bg-orange-600 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-full shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 font-subheading"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Comprá ahora <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/buscar?ofertas=true"
            className="inline-flex items-center gap-2 bg-transparent border-2 border-[#18D6D1] text-[#008f8b] hover:bg-[#18D6D1]/10 font-bold text-xs sm:text-sm px-6 py-2.5 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 font-subheading"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Descubrí ofertas <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/categorias"
            className="inline-flex items-center gap-2 bg-[#FF6A00] hover:bg-orange-600 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-full shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 font-subheading"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Sumalo al carrito <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/buscar?ofertas=true"
            className="inline-flex items-center gap-2 bg-transparent border-2 border-[#18D6D1] text-[#008f8b] hover:bg-[#18D6D1]/10 font-bold text-xs sm:text-sm px-6 py-2.5 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 font-subheading"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Aprovechá hoy <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 4. Estilo recomendado */}
      <div className="flex items-start gap-4 p-6 rounded-3xl bg-neutral-50 border border-neutral-100 max-w-2xl">
        <div className="w-12 h-12 rounded-full bg-[#e8faf9] text-[#18D6D1] flex items-center justify-center flex-shrink-0 shadow-xs">
          <FileText className="w-6 h-6 stroke-[2]" />
        </div>
        <div>
          <h3
            className="text-base font-bold text-neutral-900 font-heading"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Estilo recomendado
          </h3>
          <div className="w-10 h-0.5 bg-[#18D6D1] rounded-full mt-1.5 mb-2" />
          <p className="text-sm text-neutral-600 font-reading leading-relaxed">
            Usar lenguaje simple, visualmente ordenado y orientado a generar confianza.
          </p>
        </div>
      </div>

    </section>
  );
}
