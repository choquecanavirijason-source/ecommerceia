"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePrefersReducedMotion } from "@/presentation/hooks/usePrefersReducedMotion";
import type { RobotSceneHandle } from "@/presentation/three/aiRobotScene";

type Estado = "cargando" | "listo" | "error";

interface AiRobotStageProps {
  className?: string;
}

/**
 * Robot 3D superpuesto al hero.
 *
 * Va por encima de todo el bloque, no en una columna, porque la coreografía
 * sale de la órbita y se acerca al texto. El contenedor no recibe puntero,
 * así que los botones y enlaces de debajo siguen siendo pulsables.
 *
 * three.js y GSAP entran con `import()` dentro del efecto, de modo que no
 * pesan en el bundle inicial. Si WebGL falla queda la imagen de siempre.
 */
export function AiRobotStage({ className = "" }: AiRobotStageProps) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const escenaRef = useRef<RobotSceneHandle | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [estado, setEstado] = useState<Estado>("cargando");
  const sinMovimiento = usePrefersReducedMotion();

  useEffect(() => {
    let descartado = false;

    async function montar() {
      const contenedor = contenedorRef.current;
      if (!contenedor) return;

      try {
        const [{ createRobotScene }, { crearCoreografia, aplicarPoseEnReposo }] = await Promise.all([
          import("@/presentation/three/aiRobotScene"),
          import("@/presentation/three/aiRobotTimeline"),
        ]);
        if (descartado) return;

        const escena = await createRobotScene({ container: contenedor });
        if (descartado) {
          escena.dispose();
          return;
        }
        escenaRef.current = escena;
        setEstado("listo");
        if (escena.warnings.length > 0) console.warn("[robot]", escena.warnings.join(" "));

        // El encuadre se mide cada vez: el hero cambia de alto con el ancho
        // de la ventana. Es uno solo y fijo; el robot no cambia de tamaño.
        const encuadre = () => {
          const { clientWidth, clientHeight } = contenedor;
          return {
            punto: {
              x: clientWidth > 900 ? clientWidth * 0.74 : clientWidth * 0.5,
              y: clientHeight * 0.86,
            },
            escala: 1.85,
          };
        };

        if (sinMovimiento) {
          aplicarPoseEnReposo(escena.pose, encuadre());
          escena.renderOnce();
          return;
        }

        timelineRef.current = crearCoreografia({ pose: escena.pose, encuadre });
        escena.start();
        timelineRef.current.play(0);
      } catch (error) {
        if (!descartado) {
          console.error("[robot] no se pudo iniciar la escena", error);
          setEstado("error");
        }
      }
    }

    void montar();

    return () => {
      descartado = true;
      timelineRef.current?.kill();
      timelineRef.current = null;
      escenaRef.current?.dispose();
      escenaRef.current = null;
    };
  }, [sinMovimiento]);

  // El cursor se escucha en toda la ventana, no sólo sobre el canvas: el
  // contenedor no recibe puntero (dejaría los botones sin pulsar), así que
  // nunca llegaría un evento propio.
  useEffect(() => {
    if (sinMovimiento) return;
    // En pantallas táctiles no hay cursor al que seguir.
    if (!window.matchMedia("(hover: hover)").matches) return;

    const mover = (evento: PointerEvent) => {
      const contenedor = contenedorRef.current;
      const escena = escenaRef.current;
      if (!contenedor || !escena) return;
      const caja = contenedor.getBoundingClientRect();
      if (caja.width === 0 || caja.height === 0) return;
      const nx = ((evento.clientX - caja.left) / caja.width) * 2 - 1;
      const ny = ((evento.clientY - caja.top) / caja.height) * 2 - 1;
      escena.setPointer(Math.max(-1, Math.min(1, nx)), Math.max(-1, Math.min(1, ny)));
    };
    const soltar = () => escenaRef.current?.setPointer(null);

    window.addEventListener("pointermove", mover, { passive: true });
    window.addEventListener("blur", soltar);
    document.addEventListener("pointerleave", soltar);

    return () => {
      window.removeEventListener("pointermove", mover);
      window.removeEventListener("blur", soltar);
      document.removeEventListener("pointerleave", soltar);
    };
  }, [sinMovimiento]);

  if (estado === "error") return <RobotDeRespaldo className={className} />;

  return (
    <div
      ref={contenedorRef}
      className={`pointer-events-none ${className}`}
      role="img"
      aria-label="Robot que representa a los agentes de inteligencia artificial, girando sobre la portada"
    />
  );
}

/** Imagen de siempre, por si WebGL no arranca. */
function RobotDeRespaldo({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none ${className}`}>
      <div className="relative ml-auto aspect-[1316/1195] w-full max-w-[460px]">
        <Image
          src="/assets/robot-demo.jpg"
          alt="Robot que representa a los agentes de inteligencia artificial"
          fill
          sizes="(max-width: 640px) 90vw, 460px"
          className="object-contain mix-blend-lighten"
        />
      </div>
    </div>
  );
}
