"use client";

/**
 * Las funciones que cubre el catálogo, en anillo alrededor del total.
 *
 * Al señalar una función, el centro cambia al número de agentes que hay en
 * ella: el dato está en los fixtures y así no hace falta un segundo rótulo
 * permanente por punto.
 */

import { useState } from "react";
import { ALTO, ANCHO, CIAN, Lienzo, Rotulo, useDiagramIds, ATENUADO } from "./diagram/primitives";
import styles from "./Diagrams.module.css";

interface Categoria {
  name: string;
  count: number;
}

const CX = ANCHO / 2;
const CY = 96;
const RX = 148;
const RY = 58;

export function CoverageDiagram({ categories }: { categories: readonly Categoria[] }) {
  const ids = useDiagramIds();
  const [señalada, setSeñalada] = useState<Categoria | null>(null);
  const items = categories.slice(0, 10);

  return (
    <Lienzo ids={ids} label={`Esquema: ${items.length} funciones cubiertas por el catálogo`}>
      <ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill="none" stroke={`url(#${ids.trazo})`} strokeWidth="1" />

      {items.map((cat, i) => {
        const ang = (i / items.length) * Math.PI * 2 - Math.PI / 2;
        const x = CX + Math.cos(ang) * RX;
        const y = CY + Math.sin(ang) * RY;
        const activa = señalada?.name === cat.name;
        const atenuada = señalada !== null && !activa;
        const r = 3 + Math.min(cat.count, 4) * 0.8;

        const derecha = Math.cos(ang) > 0.1;
        const centrado = Math.abs(Math.cos(ang)) <= 0.1;
        const arriba = Math.sin(ang) < 0;

        return (
          <g key={cat.name}
            className={`${styles.nodo} ${styles.interactivo}`}
            opacity={atenuada ? ATENUADO : 1}
            onPointerEnter={() => setSeñalada(cat)}
            onPointerLeave={() => setSeñalada(null)}
          >
            {/* Zona de señalado holgada: el punto solo es diminuto. */}
            <circle cx={x} cy={y} r="16" fill="transparent" />
            {activa && <circle cx={x} cy={y} r={r + 7} fill={CIAN} opacity="0.12" />}
            <circle cx={x} cy={y} r={r} fill={CIAN} opacity={activa ? 1 : 0.7} />
            <circle cx={x} cy={y} r={r + 4} fill="none" stroke={CIAN} strokeOpacity="0.22"
              className={styles.pulse} style={{ animationDelay: `${i * 0.24}s` }} />
            <text
              x={centrado ? x : derecha ? x + r + 7 : x - r - 7}
              y={centrado ? (arriba ? y - r - 8 : y + r + 14) : y + 3}
              textAnchor={centrado ? "middle" : derecha ? "start" : "end"}
              className={activa ? "fill-[#EAF2F8] text-[9px] font-semibold" : "fill-[#C3D3E2] text-[9px]"}
            >
              {cat.name}
            </text>
          </g>
        );
      })}

      <text x={CX} y={CY + 2} textAnchor="middle" className="fill-[#EAF2F8] text-[26px] font-bold">
        {señalada ? señalada.count : items.length}
      </text>
      <Rotulo x={CX} y={CY + 18}>
        {señalada ? (señalada.count === 1 ? "agente" : "agentes") : "funciones"}
      </Rotulo>
      <Rotulo x={CX} y={ALTO - 14}>
        {señalada ? señalada.name : "señala una función"}
      </Rotulo>
    </Lienzo>
  );
}
