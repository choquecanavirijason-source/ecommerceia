"use client";

/**
 * Las colecciones editoriales y los agentes que agrupa cada una.
 *
 * Un agente puede estar en más de una colección —"Para empezar" repite tres
 * de los otros grupos—, así que al señalar una se encienden también sus
 * puntos en las demás: es la forma de enseñar ese solapamiento sin una
 * leyenda aparte.
 *
 * Fuera del ratón el ciclo va recorriendo las colecciones solo, para que el
 * esquema no quede inerte. Los títulos y los agentes llegan por props desde
 * los mismos fixtures que las tarjetas de colección.
 */

import { useState } from "react";
import { ALTO, ANCHO, CIAN, ACERO, Lienzo, Rotulo, useDiagramIds, ATENUADO } from "./diagram/primitives";
import { useCicloAutomatico } from "./diagram/useCicloAutomatico";
import styles from "./Diagrams.module.css";

export interface ColeccionResumen {
  titulo: string;
  agentes: readonly string[];
}

const BASE_Y = 118;

/** Parte el título en dos líneas para que quepa en su columna. */
function enDosLineas(titulo: string): [string, string] {
  const palabras = titulo.split(" ");
  if (palabras.length < 3) return [palabras[0] ?? "", palabras.slice(1).join(" ")];
  const corte = Math.ceil(palabras.length / 2);
  return [palabras.slice(0, corte).join(" "), palabras.slice(corte).join(" ")];
}

export function CollectionsDiagram({ colecciones }: { colecciones: readonly ColeccionResumen[] }) {
  const ids = useDiagramIds();
  const [señalada, setSeñalada] = useState<number | null>(null);
  const auto = useCicloAutomatico(colecciones.length, señalada !== null);
  const foco = señalada ?? auto;

  const activos = foco >= 0 ? new Set(colecciones[foco]?.agentes ?? []) : new Set<string>();
  const paso = (ANCHO - 40) / colecciones.length;

  return (
    <Lienzo ids={ids} label={`Colecciones: ${colecciones.map(c => `${c.titulo}, ${c.agentes.length} agentes`).join("; ")}`}>
      {colecciones.map((coleccion, i) => {
        const cx = 20 + paso * i + paso / 2;
        const activa = foco === i;
        const atenuada = foco !== -1 && !activa;
        const [linea1, linea2] = enDosLineas(coleccion.titulo);

        return (
          <g key={coleccion.titulo}
            className={`${styles.nodo} ${styles.interactivo}`}
            onPointerEnter={() => setSeñalada(i)}
            onPointerLeave={() => setSeñalada(null)}
          >
            <rect x={cx - paso / 2 + 4} y="28" width={paso - 8} height={ALTO - 60} rx="10" fill="transparent" />

            <g opacity={atenuada ? ATENUADO : 1}>
              <rect x={cx - paso / 2 + 8} y="38" width={paso - 16} height="42" rx="10"
                fill="#070C14" stroke={activa ? CIAN : ACERO} strokeOpacity={activa ? 0.85 : 0.85} />
              <text x={cx} y="56" textAnchor="middle"
                className={activa ? "fill-[#EAF2F8] text-[9px] font-semibold" : "fill-[#C3D3E2] text-[9px]"}>
                {linea1}
              </text>
              <text x={cx} y="68" textAnchor="middle"
                className={activa ? "fill-[#EAF2F8] text-[9px] font-semibold" : "fill-[#C3D3E2] text-[9px]"}>
                {linea2}
              </text>

              <line x1={cx} y1="80" x2={cx} y2={BASE_Y - 14} stroke={activa ? CIAN : ACERO}
                strokeOpacity={activa ? 0.7 : 0.5} strokeWidth="1" />
            </g>

            {/* Un punto por agente de la colección. */}
            {coleccion.agentes.map((slug, j) => {
              const porFila = 4;
              const fila = Math.floor(j / porFila);
              const enFila = Math.min(coleccion.agentes.length - fila * porFila, porFila);
              const dx = (j % porFila) - (enFila - 1) / 2;
              const encendido = activos.has(slug);
              return (
                <circle key={slug} cx={cx + dx * 15} cy={BASE_Y + fila * 15} r={encendido ? 4.5 : 3.5}
                  fill={encendido ? CIAN : ACERO}
                  opacity={foco === -1 ? 0.8 : encendido ? 1 : ATENUADO} />
              );
            })}

            <text x={cx} y={ALTO - 36} textAnchor="middle"
              className={activa ? "fill-[#EAF2F8] text-[11px] font-bold" : "fill-[#91A7BC] text-[10px]"}>
              {coleccion.agentes.length}
            </text>
          </g>
        );
      })}

      <Rotulo x={20} y={ALTO - 9} anclaje="start">
        {foco >= 0 && colecciones[foco]
          ? `${colecciones[foco].titulo}: ${colecciones[foco].agentes.length} agentes`
          : `${colecciones.length} colecciones`}
      </Rotulo>
      <Rotulo x={ANCHO - 20} y={ALTO - 9} anclaje="end">un agente puede repetirse</Rotulo>
    </Lienzo>
  );
}
