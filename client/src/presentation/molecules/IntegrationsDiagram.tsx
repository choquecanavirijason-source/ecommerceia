"use client";

/**
 * Las herramientas del catálogo entran por la izquierda, pasan por el agente
 * y salen como resultado.
 *
 * La composición va en diagonal y con curvas largas a propósito: los
 * conectores cortos y simétricos de la primera versión parecían un editor de
 * flujos. Al señalar una herramienta se resalta su trazado y se apagan las
 * demás, que con seis a la vez era difícil seguir una sola.
 *
 * Los nombres llegan por props, así que el dibujo no puede enseñar conexiones
 * que el catálogo no declare. Son ejemplos de los fixtures: no hay conexiones
 * activas detrás.
 */

import { useState } from "react";
import { ALTO, ANCHO, Chip, Conector, Hojas, Lienzo, Nucleo, Rotulo, useDiagramIds } from "./diagram/primitives";

const CX = 232;
const CY = 92;

export function IntegrationsDiagram({ integrations }: { integrations: readonly string[] }) {
  const ids = useDiagramIds();
  const [activa, setActiva] = useState<string | null>(null);
  // Cuatro como mucho: con cinco o seis, las pastillas se apelotonaban y
  // chocaban con el pie. El resto se resume en una pastilla de recuento.
  const visibles = integrations.slice(0, 4);
  const resto = integrations.length - visibles.length;
  const items = resto > 0 ? [...visibles, `+${resto} más`] : visibles;

  // Escalonadas en diagonal, no en columna: da profundidad y deja que las
  // curvas se abran en lugar de correr paralelas.
  const sitio = (i: number, total: number) => {
    const paso = total > 3 ? 36 : 44;
    const y = CY - ((total - 1) * paso) / 2 + i * paso;
    // Escalonado suave: acerca al centro las de los extremos y abre el abanico.
    const x = 20 + Math.abs(i - (total - 1) / 2) * 9;
    return { x, y };
  };

  const salida = `M ${CX + 28} ${CY} C ${CX + 70} ${CY}, ${CX + 76} ${CY + 18}, ${CX + 108} ${CY + 18}`;

  return (
    <Lienzo ids={ids} label={`Esquema: ${items.join(", ")} entran en un agente y salen como resultado`}>
      {items.map((nombre, i) => {
        const { x, y } = sitio(i, items.length);
        const d = `M ${x + 104} ${y} C ${x + 150} ${y}, ${CX - 64} ${CY}, ${CX - 27} ${CY}`;
        const esta = activa === nombre;
        const otra = activa !== null && !esta;
        return (
          <g key={nombre}>
            <Conector d={d} ids={ids} retraso={i * 0.46} dur={3} destacado={esta} atenuado={otra} />
            <Chip x={x} y={y - 14} ancho={104} alto={28} texto={nombre}
              destacado={esta} atenuado={otra}
              onHover={dentro => setActiva(dentro ? nombre : null)} />
          </g>
        );
      })}

      <Conector d={salida} ids={ids} retraso={1.4} dur={2.2} discontinuo atenuado={activa !== null} />

      <Nucleo cx={CX} cy={CY} ids={ids} activo={activa !== null} />
      <Rotulo x={CX} y={CY + 46}>agente</Rotulo>

      <Hojas x={ANCHO - 118} y={CY - 12} atenuado={activa !== null} />

      <Rotulo x={20} y={ALTO - 9} anclaje="start">
        {activa ?? `${integrations.length} herramientas`}
      </Rotulo>
      <Rotulo x={ANCHO - 20} y={ALTO - 9} anclaje="end">resultado</Rotulo>
    </Lienzo>
  );
}
