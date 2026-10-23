"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/presentation/hooks/usePrefersReducedMotion";

/**
 * Va señalando cada dato por turno.
 *
 * Los esquemas anteriores sólo reaccionaban al pasar el ratón, así que
 * parados no se veía que hubiera nada que mirar. Con el ciclo, el gráfico
 * enseña solo lo que sabe hacer y el puntero toma el control al entrar.
 *
 * Devuelve -1 cuando no debe señalar nada: con movimiento reducido o con el
 * ciclo en pausa y sin nada bajo el ratón, el gráfico se queda completo y
 * legible en lugar de congelado en un dato cualquiera.
 */
export function useCicloAutomatico(total: number, pausado: boolean, ms = 2200): number {
  const sinMovimiento = usePrefersReducedMotion();
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    if (pausado || sinMovimiento || total <= 1) return;
    const id = window.setInterval(() => setIndice(v => (v + 1) % total), ms);
    return () => window.clearInterval(id);
  }, [total, pausado, sinMovimiento, ms]);

  if (sinMovimiento || pausado) return -1;
  return indice % Math.max(total, 1);
}
