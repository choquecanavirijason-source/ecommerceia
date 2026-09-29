"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { CarouselApi } from "@/presentation/atoms/carousel";

const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(callback: () => void) {
  const media = window.matchMedia(motionQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

/** El foco y el arrastre requieren reanudación explícita. */
export function useCarouselAutoplay(api: CarouselApi, intervalMs = 5000) {
  const reducedMotion = useSyncExternalStore(subscribeMotion, () => window.matchMedia(motionQuery).matches, () => true);
  const [requestedPlay, setRequestedPlay] = useState<boolean | null>(null);
  const [hovered, setHovered] = useState(false);
  const playing = requestedPlay ?? !reducedMotion;

  useEffect(() => {
    if (!api || !playing || hovered) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      if (api.canScrollNext()) api.scrollNext();
      else if (api.canScrollPrev()) api.scrollTo(0);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [api, playing, hovered, intervalMs]);

  useEffect(() => {
    if (!api) return;
    const pause = () => setRequestedPlay(false);
    api.on("pointerDown", pause);
    return () => { api.off("pointerDown", pause); };
  }, [api]);

  return { playing, setHovered, pause: () => setRequestedPlay(false), toggle: () => setRequestedPlay(!playing) };
}
