import type { ReactNode } from "react";

interface DiagramCardProps {
  title: string;
  description: string;
  /** Rótulo en monoespaciada bajo el lienzo. */
  caption?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Tarjeta con una ilustración arriba y el texto debajo.
 *
 * Mide igual que sus hermanas sin alturas a mano: la tarjeta ocupa todo el
 * alto que le dé la rejilla (`h-full`), el lienzo mantiene siempre la misma
 * proporción —los cuatro esquemas comparten viewBox— y el bloque de texto se
 * estira con `flex-1`. Así, el título y la descripción quedan alineados entre
 * tarjetas aunque unas tengan más texto que otras.
 *
 * Las escuadras de las esquinas son del contenedor, no del dibujo: cualquier
 * diagrama entra sin tener que llevarlas. Van por fuera del borde para que se
 * lean como marcas de registro y no como un segundo marco.
 */
export function DiagramCard({ title, description, caption, children, className = "" }: DiagramCardProps) {
  return (
    <div className={`relative h-full ${className}`}>
      <Brackets />
      <div className="flex h-full flex-col rounded-2xl border border-[#1a3353] bg-[#0B1D34]/35 p-5 sm:p-6">
        <div className="relative overflow-hidden rounded-xl border border-[#1a3353]/60 bg-[#05080C]/70">
          {children}
        </div>

        {caption && (
          <p className="mt-3 font-mono text-[10px] lowercase tracking-wider text-[#91A7BC]/70">{caption}</p>
        )}

        <div className="mt-4 flex-1">
          <h3 className="text-base font-bold text-[#EAF2F8]">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-[#91A7BC]">{description}</p>
        </div>
      </div>
    </div>
  );
}

/** Cuatro escuadras finas, una por esquina. */
function Brackets() {
  const base = "pointer-events-none absolute size-4 border-[#42C7E8]/30";
  return (
    <div aria-hidden="true">
      <span className={`${base} -left-1 -top-1 border-l border-t`} />
      <span className={`${base} -right-1 -top-1 border-r border-t`} />
      <span className={`${base} -bottom-1 -left-1 border-b border-l`} />
      <span className={`${base} -bottom-1 -right-1 border-b border-r`} />
    </div>
  );
}
