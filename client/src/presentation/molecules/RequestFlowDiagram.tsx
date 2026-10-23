"use client";

/**
 * El recorrido que la demo sí ofrece: explorar, abrir la ficha y solicitar.
 *
 * Son las rutas públicas aisladas del marketplace. El último paso va punteado
 * a propósito y el pie lo repite al señalarlo: las páginas de solicitud
 * todavía no envían nada, y el esquema no debe sugerir lo contrario.
 */

import { useState } from "react";
import { ALTO, ANCHO, Chip, Conector, Lienzo, Rotulo, useDiagramIds } from "./diagram/primitives";
import styles from "./Diagrams.module.css";

const PASOS = [
  { etiqueta: "Explorar", pie: "/agentes", nota: "búsqueda y filtros sobre el catálogo" },
  { etiqueta: "Ver ficha", pie: "/agentes/…", nota: "categoría, integraciones y modalidad" },
  { etiqueta: "Solicitar", pie: "demo o cotización", nota: "vista provisional: todavía no envía nada" },
];

const ANCHO_PASO = 108;
const HUECO = 30;
const Y = 92;

export function RequestFlowDiagram() {
  const ids = useDiagramIds();
  const [señalado, setSeñalado] = useState<number | null>(null);
  const inicio = (ANCHO - (PASOS.length * ANCHO_PASO + (PASOS.length - 1) * HUECO)) / 2;

  return (
    <Lienzo ids={ids} label="Esquema del recorrido: explorar el catálogo, ver una ficha y solicitar demo o cotización">
      {PASOS.map((paso, i) => {
        const x = inicio + i * (ANCHO_PASO + HUECO);
        const ultimo = i === PASOS.length - 1;
        const activo = señalado === i;
        const atenuado = señalado !== null && !activo;
        const tramo = `M ${x + ANCHO_PASO} ${Y} L ${x + ANCHO_PASO + HUECO} ${Y}`;

        return (
          <g key={paso.etiqueta}>
            {!ultimo && (
              <Conector d={tramo} ids={ids} retraso={i * 0.8} dur={1.6} discontinuo
                destacado={señalado === i || señalado === i + 1}
                atenuado={señalado !== null && señalado !== i && señalado !== i + 1} />
            )}

            <g className={`${styles.nodo} ${styles.interactivo}`}
              onPointerEnter={() => setSeñalado(i)}
              onPointerLeave={() => setSeñalado(null)}
            >
              {/* El punteado del último paso avisa de que aún no cierra. */}
              {ultimo && (
                <rect x={x - 3} y={Y - 25} width={ANCHO_PASO + 6} height="50" rx="14"
                  fill="none" stroke="#42C7E8" strokeOpacity="0.3" strokeDasharray="4 4"
                  opacity={atenuado ? 0.28 : 1} />
              )}
              <Chip x={x} y={Y - 21} ancho={ANCHO_PASO} alto={42}
                texto={paso.etiqueta} pie={paso.pie}
                destacado={activo} atenuado={atenuado} />
            </g>
          </g>
        );
      })}

      <Rotulo x={ANCHO / 2} y={ALTO - 14}>
        {señalado !== null ? PASOS[señalado].nota : "recorrido de la demo"}
      </Rotulo>
    </Lienzo>
  );
}
