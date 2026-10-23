"use client";

/**
 * Industrias cubiertas por el catálogo, en barras.
 *
 * El ciclo va señalando una industria por turno para que el gráfico se vea en
 * marcha sin tocar nada; al entrar el ratón, manda el puntero. Los recuentos
 * llegan por props: son los de los fixtures, no una medición de mercado.
 */

import { useState } from "react";
import { ALTO, ANCHO, CIAN, ACERO, Lienzo, Rotulo, useDiagramIds, ATENUADO } from "./diagram/primitives";
import { useCicloAutomatico } from "./diagram/useCicloAutomatico";
import styles from "./Diagrams.module.css";

export interface Reparto {
  etiqueta: string;
  total: number;
}

const X = 108;
const ANCHO_MAX = 250;

export function IndustriesDiagram({ datos }: { datos: readonly Reparto[] }) {
  const ids = useDiagramIds();
  const [señalado, setSeñalado] = useState<number | null>(null);
  const auto = useCicloAutomatico(datos.length, señalado !== null);
  const foco = señalado ?? auto;

  const tope = Math.max(...datos.map(d => d.total), 1);
  const paso = 30;
  const inicio = (ALTO - datos.length * paso) / 2 + 12;

  return (
    <Lienzo ids={ids} label={`Industrias cubiertas: ${datos.map(d => `${d.etiqueta} ${d.total}`).join(", ")}`}>
      {datos.map((d, i) => {
        const y = inicio + i * paso;
        const largo = Math.max((d.total / tope) * ANCHO_MAX, 6);
        const activo = foco === i;
        const atenuado = foco !== -1 && foco !== null && !activo;

        return (
          <g key={d.etiqueta}
            className={`${styles.nodo} ${styles.interactivo}`}
            opacity={atenuado ? ATENUADO : 1}
            onPointerEnter={() => setSeñalado(i)}
            onPointerLeave={() => setSeñalado(null)}
          >
            <rect x="14" y={y - 11} width={ANCHO - 28} height="22" rx="6" fill="transparent" />

            <text x={X - 12} y={y + 4} textAnchor="end"
              className={activo ? "fill-[#EAF2F8] text-[10px] font-semibold" : "fill-[#C3D3E2] text-[10px]"}>
              {d.etiqueta}
            </text>

            {/* Carril de fondo: deja ver cuánto le falta a cada barra. */}
            <rect x={X} y={y - 6} width={ANCHO_MAX} height="12" rx="6" fill={ACERO} opacity="0.16" />

            <rect x={X} y={y - 6} width={largo} height="12" rx="6"
              className={styles.crece}
              style={{ "--retraso": `${i * 90}ms` } as React.CSSProperties}
              fill={activo ? CIAN : ACERO}
              opacity={activo ? 0.9 : 0.75} />

            <text x={X + largo + 9} y={y + 4}
              className={activo ? "fill-[#EAF2F8] text-[10px] font-semibold" : "fill-[#91A7BC] text-[10px]"}>
              {d.total}
            </text>
          </g>
        );
      })}

      <Rotulo x={20} y={ALTO - 9} anclaje="start">
        {foco >= 0 && datos[foco]
          ? `${datos[foco].etiqueta}: ${datos[foco].total} de ${datos.reduce((s, d) => s + d.total, 0)}`
          : `${datos.length} industrias`}
      </Rotulo>
      <Rotulo x={ANCHO - 20} y={ALTO - 9} anclaje="end">agentes de ejemplo</Rotulo>
    </Lienzo>
  );
}
