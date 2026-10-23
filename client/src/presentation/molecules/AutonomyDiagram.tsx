"use client";

/**
 * Las tres modalidades del catálogo, un carril cada una.
 *
 * `active` fija la del agente en la ficha; sin él —en la portada— las tres se
 * presentan por igual y el ratón es quien va resaltando. Los rótulos salen de
 * `autonomyLabels`, el mismo mapa que usan las tarjetas, así que el esquema no
 * puede contradecirlas si cambian los textos.
 */

import { useState } from "react";
import { autonomyLabels } from "./agentLabels";
import type { AgentAutonomy } from "@/domain/entities/Agent";
import { ALTO, CIAN, Chip, Conector, Lienzo, Rotulo, useDiagramIds, ATENUADO } from "./diagram/primitives";
import styles from "./Diagrams.module.css";

/** Dónde queda la persona en cada modalidad: ejecutando, aprobando o fuera. */
const CARRILES: { nivel: AgentAutonomy; persona: string | null; nota: string }[] = [
  { nivel: "assisted", persona: "ejecuta", nota: "la persona hace el último paso" },
  { nivel: "supervised", persona: "aprueba", nota: "la persona autoriza antes de actuar" },
  { nivel: "autonomous", persona: null, nota: "el agente completa la tarea" },
];

export function AutonomyDiagram({ active }: { active?: AgentAutonomy }) {
  const ids = useDiagramIds();
  const [señalado, setSeñalado] = useState<AgentAutonomy | null>(null);
  const foco = señalado ?? active ?? null;

  return (
    <Lienzo ids={ids} label={active ? `Modalidades; este agente es ${autonomyLabels[active]}` : "Las tres modalidades del catálogo"}>
      {CARRILES.map((carril, i) => {
        const y = 42 + i * 46;
        const activo = foco === carril.nivel;
        const atenuado = foco !== null && !activo;
        const soloAgente = carril.persona === null;
        const tramo = `M 104 ${y} L 286 ${y}`;

        return (
          <g key={carril.nivel}
            className={styles.nodo}
            onPointerEnter={() => setSeñalado(carril.nivel)}
            onPointerLeave={() => setSeñalado(null)}
          >
            {/* Fondo del carril: da área de señalado y separa visualmente. */}
            <rect x="14" y={y - 19} width={392} height="38" rx="10"
              fill={activo ? "#0B1D34" : "transparent"} fillOpacity={activo ? 0.55 : 0} />

            <Rotulo x={30} y={y + 3} anclaje="start">0{i + 1}</Rotulo>

            <Conector d={tramo} ids={ids} destacado={activo} atenuado={atenuado}
              retraso={i * 0.6} dur={soloAgente ? 2 : 3.2} discontinuo={!soloAgente} />

            <Chip x={56} y={y - 13} ancho={58} alto={26} texto="agente"
              destacado={activo} atenuado={atenuado} />

            {carril.persona && (
              <Chip x={168} y={y - 13} ancho={64} alto={26} texto={carril.persona} atenuado={atenuado} />
            )}

            <circle cx="286" cy={y} r="5" opacity={atenuado ? ATENUADO : 1}
              fill={soloAgente ? CIAN : "none"} stroke={CIAN} strokeWidth="1.2" />

            <text x="300" y={y + 3} opacity={atenuado ? ATENUADO : 1}
              className={activo ? "fill-[#EAF2F8] text-[9px] font-semibold" : "fill-[#C3D3E2] text-[9px]"}>
              {autonomyLabels[carril.nivel]}
            </text>
          </g>
        );
      })}

      {/* Pie que cambia al señalar: explica el carril sin recargar el dibujo. */}
      <Rotulo x={210} y={ALTO - 14}>
        {foco ? CARRILES.find(c => c.nivel === foco)?.nota : "tres modalidades"}
      </Rotulo>
    </Lienzo>
  );
}
