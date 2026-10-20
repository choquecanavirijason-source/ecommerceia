"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { RotateCcw, Sparkles } from "lucide-react";
import { usePrefersReducedMotion } from "@/presentation/hooks/usePrefersReducedMotion";
import type { AetherSceneHandle } from "@/presentation/three/aetherScene";

type StageStatus = "loading" | "ready" | "error";

/**
 * Las hombreras del mecha llegan a los bordes del canvas y se cortaban en
 * recto. Se difuminan los laterales y, con más recorrido, la parte inferior,
 * donde el torso continúa fuera de cuadro. El borde superior queda intacto a
 * propósito: ahí está la coronilla del casco y un degradado se la come.
 */
const EDGE_FADE = [
  "linear-gradient(to bottom, black 0%, black 68%, transparent 100%)",
  "linear-gradient(to right, transparent 0%, black 13%, black 87%, transparent 100%)",
].join(", ");

const EDGE_MASK = {
  maskImage: EDGE_FADE,
  WebkitMaskImage: EDGE_FADE,
  maskComposite: "intersect",
  WebkitMaskComposite: "source-in",
} as const satisfies CSSProperties;

interface AetherHeroStageProps {
  className?: string;
}

/**
 * Primer plano animado de AETHER-02 para la portada.
 *
 * three.js y GSAP se cargan con `import()` dentro del efecto, así que no
 * entran en el bundle inicial ni se ejecutan durante la exportación estática.
 * Si WebGL falla, queda la imagen del robot que ya usaba la portada.
 */
export function AetherHeroStage({ className = "" }: AetherHeroStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<AetherSceneHandle | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const [status, setStatus] = useState<StageStatus>("loading");
  const [effectsEnabled, setEffectsEnabled] = useState(true);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    let disposed = false;
    let cancelDeferred: (() => void) | null = null;

    async function mount() {
      const container = containerRef.current;
      if (!container) return;

      // El GLB son ~1,3 MB en red. Se espera a que el contenedor se acerque al
      // viewport para no competir con el LCP en móvil, pero sin esperar además
      // a que el navegador quede ocioso: eso retrasaba la aparición del robot
      // hasta 1,5 s y dejaba el hueco vacío demasiado tiempo al recargar.
      await waitUntilNearViewport(container, (cancel) => {
        cancelDeferred = cancel;
      });
      if (disposed) return;

      try {
        const [{ createAetherScene }, { createAetherTimeline, applyAwarePose }] = await Promise.all([
          import("@/presentation/three/aetherScene"),
          import("@/presentation/three/aetherTimeline"),
        ]);
        if (disposed) return;

        const scene = await createAetherScene({ container });
        if (disposed) {
          scene.dispose();
          return;
        }

        sceneRef.current = scene;
        setStatus("ready");

        if (scene.warnings.length > 0) {
          console.warn("[AETHER-02]", scene.warnings.join(" "));
        }

        // Movimiento reducido: pose consciente fija, un solo fotograma y
        // ningún efecto. No se crea la línea de tiempo.
        if (prefersReducedMotion) {
          applyAwarePose(scene.pose);
          scene.setEffectsEnabled(false);
          scene.renderOnce();
          return;
        }

        timelineRef.current = createAetherTimeline({
          pose: scene.pose,
          onGlitch: scene.setGlitch,
        });

        scene.setEffectsEnabled(effectsEnabled);
        scene.start();
        timelineRef.current.play(0);
      } catch (error) {
        if (!disposed) {
          console.error("[AETHER-02] no se pudo iniciar la escena", error);
          setStatus("error");
        }
      }
    }

    void mount();

    return () => {
      disposed = true;
      cancelDeferred?.();
      timelineRef.current?.kill();
      timelineRef.current = null;
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
    // `effectsEnabled` se propaga con su propio efecto: remontar la escena al
    // togglear los efectos descargaría el GLB otra vez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReducedMotion]);

  useEffect(() => {
    sceneRef.current?.setEffectsEnabled(effectsEnabled && !prefersReducedMotion);
  }, [effectsEnabled, prefersReducedMotion]);

  // El robot sigue al cursor por toda la portada, no sólo sobre el canvas: la
  // referencia es el centro del contenedor y el alcance, algo más ancho. El
  // desplazamiento se suma a la pose del guión, nunca la sustituye.
  useEffect(() => {
    if (prefersReducedMotion) return;
    if (!window.matchMedia("(hover: hover)").matches) return;

    let frame: number | null = null;

    function handleMove(event: PointerEvent) {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        const container = containerRef.current;
        const scene = sceneRef.current;
        if (!container || !scene) return;

        const rect = container.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const nx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width * 0.9);
        const ny = (event.clientY - (rect.top + rect.height / 2)) / (rect.height * 1.1);
        scene.setPointer(nx, ny);
      });
    }

    function handleLeave() {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      sceneRef.current?.setPointer(null);
    }

    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("blur", handleLeave);
    document.addEventListener("pointerleave", handleLeave);

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("blur", handleLeave);
      document.removeEventListener("pointerleave", handleLeave);
    };
  }, [prefersReducedMotion]);

  const handleReplay = useCallback(() => {
    const scene = sceneRef.current;
    const timeline = timelineRef.current;
    if (!scene || !timeline) return;
    // Sin esto, el movimiento secundario arrancaría leyendo el historial de la
    // reproducción anterior y la primera décima de segundo daría un salto.
    scene.rig.reset();
    scene.start();
    timeline.restart(true);
  }, []);

  const showControls = status === "ready" && !prefersReducedMotion;

  if (status === "error") {
    return <HeroPoster className={className} />;
  }

  return (
    <div className={`relative ${className}`}>
      <div
        ref={containerRef}
        className="relative h-full w-full [&>canvas]:drop-shadow-[0_0_45px_rgba(66,199,232,0.22)]"
        style={EDGE_MASK}
        role="img"
        aria-label="Robot AETHER-02 en primer plano que advierte a quien lo observa y gira hacia la cámara"
      />

      {showControls && (
        <div className="absolute bottom-0 left-0 flex items-center gap-2">
          <button
            type="button"
            onClick={handleReplay}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#42C7E8]/25 bg-[#05080C]/90 px-3 py-1.5 text-[11px] font-medium text-[#C3D3E2] shadow-lg shadow-black/40 backdrop-blur-md transition-colors hover:border-[#42C7E8]/60 hover:text-[#EAF2F8]"
          >
            <RotateCcw size={12} aria-hidden="true" />
            Repetir
          </button>
          <button
            type="button"
            onClick={() => setEffectsEnabled((previous) => !previous)}
            aria-pressed={effectsEnabled}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium shadow-lg shadow-black/40 backdrop-blur-md transition-colors ${
              effectsEnabled
                ? "border-[#42C7E8]/60 bg-[#05080C]/90 text-[#42C7E8]"
                : "border-[#1a3353] bg-[#05080C]/90 text-[#91A7BC] hover:text-[#EAF2F8]"
            }`}
          >
            <Sparkles size={12} aria-hidden="true" />
            Efectos
          </button>
        </div>
      )}
    </div>
  );
}

/** Plazo máximo de espera antes de montar la escena igualmente. */
const NEAR_VIEWPORT_TIMEOUT_MS = 1200;

/**
 * Resuelve cuando el contenedor se acerca al viewport. Saca la descarga del
 * GLB de la ruta crítica sin retrasar su aparición: con `rootMargin` generoso,
 * en escritorio el hero ya está en pantalla y dispara de inmediato; sólo
 * espera de verdad si se entra con la página desplazada.
 *
 * El plazo máximo no es decorativo: una pestaña en segundo plano no entrega
 * los callbacks de `IntersectionObserver`, así que sin él, abrir la portada en
 * una pestaña de fondo dejaba el hueco vacío para siempre.
 */
function waitUntilNearViewport(
  container: HTMLElement,
  registerCancel: (cancel: () => void) => void,
): Promise<void> {
  return new Promise((resolve) => {
    let observer: IntersectionObserver | null = null;
    let timeoutHandle: number | null = null;

    const cleanup = () => {
      observer?.disconnect();
      observer = null;
      if (timeoutHandle !== null) window.clearTimeout(timeoutHandle);
      timeoutHandle = null;
    };

    const done = () => {
      cleanup();
      resolve();
    };

    registerCancel(cleanup);

    timeoutHandle = window.setTimeout(done, NEAR_VIEWPORT_TIMEOUT_MS);

    observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        done();
      },
      { rootMargin: "300px" },
    );
    observer.observe(container);
  });
}

/**
 * Imagen de respaldo. Sólo aparece si WebGL falla: mientras carga el GLB el
 * hueco queda vacío a propósito, para no enseñar el robot 2D antiguo y luego
 * sustituirlo.
 */
function HeroPoster({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <Image
        src="/assets/robot-demo.jpg"
        alt="Robot que representa a los agentes de inteligencia artificial"
        fill
        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 460px, 45vw"
        className="object-contain object-bottom mix-blend-lighten drop-shadow-[0_0_40px_rgba(40,127,240,0.25)]"
        priority
      />
    </div>
  );
}
