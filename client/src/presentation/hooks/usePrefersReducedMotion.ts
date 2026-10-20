"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

/** Durante el renderizado en servidor asumimos movimiento permitido. */
function getServerSnapshot(): boolean {
  return false;
}

/**
 * Lee `prefers-reduced-motion` como store externo, de modo que el valor llega
 * en el primer render y no hace falta un `setState` dentro de un efecto.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
