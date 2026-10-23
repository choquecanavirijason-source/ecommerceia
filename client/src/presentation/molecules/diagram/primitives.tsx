"use client";

/**
 * Piezas comunes de los esquemas del catálogo.
 *
 * Todos comparten lienzo (420×200) para que las cuatro tarjetas midan igual
 * sin tener que fijarles una altura a mano, y comparten `defs` para que el
 * acabado —degradado del trazo, halo del núcleo, retícula— sea el mismo en
 * los cuatro. Los identificadores de `defs` salen de `useId`: si se montan
 * dos esquemas en la misma página, no se pisan.
 */

import { useId, type CSSProperties, type ReactNode } from "react";
import styles from "../Diagrams.module.css";

export const ANCHO = 440;
export const ALTO = 210;

/**
 * El cian es acento, no base. La estructura se dibuja en acero y el color
 * queda para lo que el usuario señala y para el punto en tránsito: con todo
 * en cian el esquema se leía plano y barato.
 */
export const CIAN = "#42C7E8";
export const ACERO = "#3C5674";
export const LINEA = "#22364F";
export const TEXTO = "#C3D3E2";
export const TENUE = "#91A7BC";

/** Opacidad de lo que no está señalado, cuando el ratón señala algo. */
export const ATENUADO = 0.28;

export interface DefsIds {
  trazo: string;
  halo: string;
  luz: string;
}

export function useDiagramIds(): DefsIds {
  const base = useId().replace(/:/g, "");
  return { trazo: `${base}-trazo`, halo: `${base}-halo`, luz: `${base}-luz` };
}

/** Lienzo con la luz de fondo y los `defs` compartidos. */
export function Lienzo({ ids, label, children }: { ids: DefsIds; label: string; children: ReactNode }) {
  return (
    <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className="h-auto w-full" role="img" aria-label={label}>
      <defs>
        {/* El trazo se apaga en los extremos: evita el corte seco contra el
            fondo que delataba las primeras versiones. */}
        <linearGradient id={ids.trazo} x1="0" x2="1">
          <stop offset="0%" stopColor={CIAN} stopOpacity="0.04" />
          <stop offset="45%" stopColor={CIAN} stopOpacity="0.55" />
          <stop offset="100%" stopColor={CIAN} stopOpacity="0.04" />
        </linearGradient>

        <radialGradient id={ids.halo}>
          <stop offset="0%" stopColor={CIAN} stopOpacity="0.28" />
          <stop offset="100%" stopColor={CIAN} stopOpacity="0" />
        </radialGradient>

        {/* Luz suave arriba en lugar de retícula: la cuadrícula visible
            ensuciaba el dibujo y lo hacía parecer una herramienta de flujos. */}
        <radialGradient id={ids.luz} cx="50%" cy="0%" r="80%">
          <stop offset="0%" stopColor="#2E5B7A" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#050A12" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width={ANCHO} height={ALTO} fill={`url(#${ids.luz})`} />
      {children}
    </svg>
  );
}

/** Pastilla con el nombre de una herramienta o un paso. */
export function Chip({
  x, y, ancho = 104, alto = 30, texto, pie, destacado = false, atenuado = false, onHover,
}: {
  x: number; y: number; ancho?: number; alto?: number; texto: string; pie?: string;
  destacado?: boolean; atenuado?: boolean; onHover?: (dentro: boolean) => void;
}) {
  return (
    <g
      className={styles.nodo}
      opacity={atenuado ? ATENUADO : 1}
      onPointerEnter={() => onHover?.(true)}
      onPointerLeave={() => onHover?.(false)}
    >
      <rect
        x={x} y={y} width={ancho} height={alto} rx={alto / 2.6}
        fill="#070C14"
        stroke={destacado ? CIAN : LINEA}
        strokeOpacity={destacado ? 0.85 : 1}
      />
      <text
        x={x + ancho / 2} y={pie ? y + alto / 2 - 1 : y + alto / 2 + 4}
        textAnchor="middle"
        className={destacado ? "fill-[#EAF2F8] text-[11px] font-semibold" : "fill-[#C3D3E2] text-[11px]"}
      >
        {texto}
      </text>
      {pie && (
        <text x={x + ancho / 2} y={y + alto / 2 + 11} textAnchor="middle"
          className="fill-[#91A7BC] font-mono text-[8px]">
          {pie}
        </text>
      )}
    </g>
  );
}

/** Núcleo: el agente, con halo propio. */
export function Nucleo({ cx, cy, ids, activo = false }: { cx: number; cy: number; ids: DefsIds; activo?: boolean }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="42" fill={`url(#${ids.halo})`} className={styles.pulse} />
      <rect x={cx - 26} y={cy - 24} width="52" height="48" rx="15" fill="#070C14"
        stroke={activo ? CIAN : ACERO} strokeOpacity={activo ? 0.9 : 0.9} />
      <circle cx={cx} cy={cy - 6} r="5" fill="none" stroke={activo ? CIAN : TEXTO} strokeWidth="1.4" />
      <path d={`M ${cx - 8} ${cy + 9} Q ${cx} ${cy + 4} ${cx + 8} ${cy + 9}`}
        fill="none" stroke={activo ? CIAN : TEXTO} strokeWidth="1.4" strokeLinecap="round" />
    </g>
  );
}

/** Conector con su punto en tránsito. */
export function Conector({
  d, ids, destacado = false, atenuado = false, retraso = 0, dur = 2.6, discontinuo = false,
}: {
  d: string; ids: DefsIds; destacado?: boolean; atenuado?: boolean;
  retraso?: number; dur?: number; discontinuo?: boolean;
}) {
  return (
    <g opacity={atenuado ? ATENUADO : 1} className={styles.nodo}>
      <path
        d={d} fill="none"
        stroke={destacado ? `url(#${ids.trazo})` : ACERO}
        strokeOpacity={destacado ? 1 : 0.75}
        strokeWidth={destacado ? 1.8 : 1}
        className={discontinuo ? styles.dash : undefined}
      />
      <circle
        r={destacado ? 3 : 2.3}
        fill={CIAN}
        opacity={destacado ? 1 : 0.75}
        className={styles.travel}
        style={{ "--ruta": `path("${d}")`, "--retraso": `${retraso}s`, "--dur": `${dur}s` } as CSSProperties}
      />
    </g>
  );
}

/** Rótulo pequeño en monoespaciada, el mismo en los cuatro esquemas. */
export function Rotulo({ x, y, children, anclaje = "middle" }: {
  x: number; y: number; children: ReactNode; anclaje?: "start" | "middle" | "end";
}) {
  return (
    <text x={x} y={y} textAnchor={anclaje}
      className="fill-[#91A7BC] font-mono text-[8px] uppercase tracking-[0.18em]">
      {children}
    </text>
  );
}

/**
 * Pila de hojas con mini barras: el destino de un recorrido.
 *
 * Rompe la monotonía de repetir la misma pastilla en todo el esquema, y de
 * paso dice sin texto que lo que sale es un resultado, no otra herramienta.
 * Las barras son decorativas: no representan ninguna medición.
 */
export function Hojas({ x, y, destacado = false, atenuado = false }: {
  x: number; y: number; destacado?: boolean; atenuado?: boolean;
}) {
  const barras = [10, 16, 7, 19, 12, 22];
  return (
    <g opacity={atenuado ? ATENUADO : 1} className={styles.nodo}>
      {/* Dos hojas detrás, desplazadas: dan profundidad sin dibujar sombra. */}
      <rect x={x + 10} y={y - 8} width="96" height="62" rx="9" fill="#070C14" stroke={LINEA} opacity="0.55" />
      <rect x={x + 5} y={y - 4} width="96" height="62" rx="9" fill="#070C14" stroke={LINEA} opacity="0.75" />
      <rect x={x} y={y} width="96" height="62" rx="9" fill="#070C14"
        stroke={destacado ? CIAN : ACERO} strokeOpacity={destacado ? 0.85 : 0.9} />

      <rect x={x + 11} y={y + 12} width="40" height="3" rx="1.5" fill={TEXTO} opacity="0.5" />
      <rect x={x + 11} y={y + 19} width="26" height="3" rx="1.5" fill={TEXTO} opacity="0.3" />

      {barras.map((alto, i) => (
        <rect key={i} x={x + 11 + i * 8} y={y + 48 - alto} width="5" height={alto} rx="1.5"
          fill={destacado ? CIAN : TEXTO} opacity={destacado ? 0.75 : 0.42} />
      ))}
    </g>
  );
}
