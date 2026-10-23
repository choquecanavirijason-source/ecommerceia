"use client";

/**
 * Modalidades de precio del catálogo, en anillo por segmentos.
 *
 * Forma distinta a las barras a propósito: cuatro gráficos iguales en la
 * misma página se leen como uno repetido. El ciclo recorre los segmentos solo
 * y el ratón toma el control al entrar.
 *
 * Los importes no existen: el catálogo sólo declara la modalidad, y el pie lo
 * deja escrito para no sugerir una oferta comercial que aún no está definida.
 */

import { useState } from "react";
import { ALTO, ANCHO, CIAN, ACERO, Lienzo, Rotulo, useDiagramIds, ATENUADO } from "./diagram/primitives";
import { useCicloAutomatico } from "./diagram/useCicloAutomatico";
import styles from "./Diagrams.module.css";
import type { Reparto } from "./IndustriesDiagram";

const CX = 142;
const CY = 98;
const R = 58;
const GROSOR = 17;

/** Arco en coordenadas polares; el anillo se dibuja con trazo, no con relleno. */
function arco(desde: number, hasta: number) {
  const p = (a: number) => [CX + Math.cos(a) * R, CY + Math.sin(a) * R];
  const [x1, y1] = p(desde);
  const [x2, y2] = p(hasta);
  return `M ${x1} ${y1} A ${R} ${R} 0 ${hasta - desde > Math.PI ? 1 : 0} 1 ${x2} ${y2}`;
}

export function PricingDiagram({ datos }: { datos: readonly Reparto[] }) {
  const ids = useDiagramIds();
  const [señalado, setSeñalado] = useState<number | null>(null);
  const auto = useCicloAutomatico(datos.length, señalado !== null);
  const foco = señalado ?? auto;

  const total = datos.reduce((s, d) => s + d.total, 0) || 1;
  const hueco = 0.055;

  // Suma acumulada en lugar de un acumulador que se reasigna: la regla
  // `react-hooks/immutability` no admite mutar una variable durante el render.
  const segmentos = datos.map((d, i) => {
    const previo = datos.slice(0, i).reduce((suma, x) => suma + x.total, 0);
    const desde = -Math.PI / 2 + (previo / total) * Math.PI * 2;
    const barrido = (d.total / total) * Math.PI * 2;
    return { ...d, desde: desde + hueco / 2, hasta: desde + barrido - hueco / 2 };
  });

  return (
    <Lienzo ids={ids} label={`Modalidades de precio: ${datos.map(d => `${d.etiqueta} ${d.total}`).join(", ")}`}>
      {segmentos.map((s, i) => {
        const activo = foco === i;
        const atenuado = foco !== -1 && foco !== null && !activo;
        return (
          <g key={s.etiqueta}
            className={`${styles.nodo} ${styles.interactivo}`}
            opacity={atenuado ? ATENUADO : 1}
            onPointerEnter={() => setSeñalado(i)}
            onPointerLeave={() => setSeñalado(null)}
          >
            <path d={arco(s.desde, s.hasta)} fill="none"
              stroke={activo ? CIAN : ACERO}
              strokeOpacity={activo ? 0.95 : 0.8}
              strokeWidth={activo ? GROSOR + 5 : GROSOR}
              strokeLinecap="round" />
          </g>
        );
      })}

      <text x={CX} y={CY + 2} textAnchor="middle" className="fill-[#EAF2F8] text-[25px] font-bold">
        {foco >= 0 && segmentos[foco] ? segmentos[foco].total : total}
      </text>
      <Rotulo x={CX} y={CY + 17}>{foco >= 0 ? "agentes" : "en total"}</Rotulo>

      {/* Leyenda a la derecha: el anillo solo no dice qué es cada tramo. */}
      {segmentos.map((s, i) => {
        const y = CY - (segmentos.length - 1) * 13 + i * 26;
        const activo = foco === i;
        return (
          <g key={`l-${s.etiqueta}`}
            className={`${styles.nodo} ${styles.interactivo}`}
            opacity={foco !== -1 && foco !== null && !activo ? ATENUADO : 1}
            onPointerEnter={() => setSeñalado(i)}
            onPointerLeave={() => setSeñalado(null)}
          >
            <rect x={ANCHO - 168} y={y - 9} width="150" height="18" rx="5" fill="transparent" />
            <rect x={ANCHO - 162} y={y - 4} width="9" height="9" rx="2.5" fill={activo ? CIAN : ACERO} />
            <text x={ANCHO - 147} y={y + 4}
              className={activo ? "fill-[#EAF2F8] text-[10px] font-semibold" : "fill-[#C3D3E2] text-[10px]"}>
              {s.etiqueta}
            </text>
          </g>
        );
      })}

      <Rotulo x={ANCHO / 2} y={ALTO - 9}>modalidad, sin importes definidos</Rotulo>
    </Lienzo>
  );
}
