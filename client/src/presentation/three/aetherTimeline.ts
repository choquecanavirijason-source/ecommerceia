/**
 * Guión de 12 s: "Algo está pasando… ¿me estás mirando? ¡Te encontré!".
 *
 * La línea de tiempo es de GSAP, así que avanza por tiempo y no por
 * fotogramas. Todos los valores de arranque se fijan con `set` en la posición
 * 0 para que `restart()` devuelva la pose exacta y nada se acumule entre
 * reproducciones.
 *
 * La cámara no se mueve nunca: el acercamiento final lo produce el torso del
 * robot.
 */

import gsap from "gsap";
import { NEUTRAL_POSE, type AetherPose } from "./aetherPose";

export const TIMELINE_DURATION = 12;

/**
 * Transición de vuelta al inicio. El guión termina sosteniendo la pose 0,7 s;
 * después el robot vuelve a tres cuartos con un movimiento suave y el bucle
 * reengancha sin salto.
 */
export const RETURN_DURATION = 1.4;

/** Pose inicial en tres cuartos. */
const OPENING_POSE = {
  ...NEUTRAL_POSE,
  headYaw: 34,
  headPitch: -2,
  headRoll: -3,
} satisfies AetherPose;

interface TimelineOptions {
  pose: AetherPose;
  /** Recibe la intensidad de glitch del fotograma, 0..1. */
  onGlitch: (amount: number) => void;
  onComplete?: () => void;
}

export function createAetherTimeline({ pose, onGlitch, onComplete }: TimelineOptions): gsap.core.Timeline {
  const fx = { glitch: 0 };

  const tl = gsap.timeline({
    paused: true,
    repeat: -1,
    onUpdate: () => onGlitch(fx.glitch),
    onRepeat: () => onGlitch(0),
    onComplete: () => {
      onGlitch(0);
      onComplete?.();
    },
  });

  tl.set(pose, OPENING_POSE, 0);
  tl.set(fx, { glitch: 0 }, 0);

  // Chispazos de glitch en tres momentos concretos del guión.
  const glitchAt = (time: number, peak: number) => {
    tl.to(fx, { glitch: peak, duration: 0.05, ease: "power2.out" }, time);
    tl.to(fx, { glitch: 0, duration: 0.3, ease: "power2.in" }, time + 0.05);
  };

  // --- 0-2 s · SE ACTIVA ----------------------------------------------------
  // Micromovimientos de cabeza y hombros: energía contenida, no un cabeceo.
  tl.to(pose, { headYaw: 29, headRoll: 1, duration: 0.45, ease: "sine.inOut" }, 0.1);
  tl.to(pose, { headYaw: 36, headPitch: 1, duration: 0.35, ease: "sine.inOut" }, 0.55);
  tl.to(pose, { headYaw: 32, headRoll: -2, duration: 0.4, ease: "sine.inOut" }, 0.9);
  // Detecta algo: eleva la cabeza y se queda quieto 0,2 s.
  tl.to(pose, { headPitch: 7, duration: 0.18, ease: "power3.out" }, 1.3);
  tl.to(pose, { visorGain: 1.5, duration: 0.14, ease: "power2.out" }, 1.3);
  tl.to(pose, { visorGain: 1.1, duration: 0.3, ease: "power2.inOut" }, 1.5);

  // --- 2-4 s · BUSCA --------------------------------------------------------
  // Giros rápidos alternando lados, con pausas cortas entre ellos. Los
  // hombros los sigue el PoseFollower con ~0,1 s de retraso.
  tl.to(pose, { headYaw: -42, headPitch: 2, duration: 0.26, ease: "power4.out" }, 2.0);
  glitchAt(2.04, 0.55);
  tl.to(pose, { headYaw: 46, duration: 0.25, ease: "power4.out" }, 2.55);
  tl.to(pose, { headYaw: -18, headPitch: 0, duration: 0.21, ease: "power4.out" }, 3.15);
  tl.to(pose, { headYaw: 8, duration: 0.25, ease: "power3.out" }, 3.7);

  // --- 4-6 s · ALGO NO CUADRA -----------------------------------------------
  // Inclinación lateral dentro del límite del rig; los hombros contrarrestan
  // solos por el peso negativo del seguidor.
  tl.to(pose, { headRoll: -21, headYaw: -6, duration: 0.35, ease: "power2.out" }, 4.0);
  tl.to(pose, { headPitch: -4, duration: 0.2, ease: "sine.inOut" }, 4.9);
  // Corrección con rebote mecánico.
  tl.to(pose, { headRoll: 0, duration: 0.4, ease: "back.out(2.4)" }, 5.2);
  tl.to(pose, { headPitch: 2, headYaw: -26, duration: 0.3, ease: "sine.out" }, 5.6);

  // --- 6-8 s · TE DETECTA ---------------------------------------------------
  // Momento central: gira hasta la cámara, frena en seco y aguanta 0,7 s.
  tl.to(pose, { headYaw: 0, headPitch: 1.5, duration: 0.24, ease: "power4.out" }, 6.0);
  glitchAt(6.2, 0.8);
  tl.to(pose, { visorGain: 2.6, duration: 0.14, ease: "power2.out" }, 6.18);
  tl.to(pose, { visorGain: 1.35, duration: 0.55, ease: "power2.inOut" }, 6.34);
  // Asentamiento mínimo tras la frenada.
  tl.to(pose, { headRoll: 1.6, duration: 0.12, ease: "power2.out" }, 6.26);
  tl.to(pose, { headRoll: 0, duration: 0.25, ease: "power1.inOut" }, 6.38);

  // --- 8-10 s · TE PONE A PRUEBA -------------------------------------------
  // Desplaza cabeza y hombros a un lado pero el rostro sigue en cámara: el
  // giro compensa el desplazamiento del torso.
  tl.to(pose, { bodyShiftX: -0.26, headYaw: 9, headRoll: 13, duration: 0.4, ease: "power2.inOut" }, 8.0);
  glitchAt(8.04, 0.4);
  tl.to(pose, { bodyShiftX: 0.24, headYaw: -8, headRoll: -11, duration: 0.35, ease: "power3.inOut" }, 9.0);
  // Regreso con pequeño sobrepaso y asentamiento tras una pausa corta.
  tl.to(pose, { bodyShiftX: 0, headYaw: 0, headRoll: 0, duration: 0.45, ease: "back.out(1.8)" }, 9.55);

  // --- 10-12 s · ¡TE ENCONTRÉ! ---------------------------------------------
  // Anticipación hacia atrás y acercamiento moderado del torso.
  tl.to(pose, { leanPitch: -3, headPitch: -1, duration: 0.15, ease: "power2.out" }, 10.0);
  tl.to(pose, { leanPitch: 4, headPitch: 3, headRoll: 7, duration: 0.42, ease: "power3.out" }, 10.18);
  tl.to(pose, { visorGain: 2.2, duration: 0.18, ease: "power2.out" }, 10.22);
  tl.to(pose, { visorGain: 1.5, duration: 0.4, ease: "power2.inOut" }, 10.44);
  // Sobrepaso y asentamiento del acercamiento.
  tl.to(pose, { leanPitch: 3.5, headRoll: 9.5, duration: 0.3, ease: "power1.inOut" }, 10.65);
  glitchAt(11.0, 0.45);

  // Último 0,7 s del guión: mantiene la orientación hacia el espectador.
  // Después, vuelta suave a la pose de arranque para que el bucle no salte.
  tl.to(
    pose,
    { ...OPENING_POSE, duration: RETURN_DURATION, ease: "power2.inOut" },
    TIMELINE_DURATION,
  );

  return tl;
}

/**
 * Pose estática para `prefers-reduced-motion`: el robot ya está mirando al
 * espectador, con el visor algo más encendido. Sin línea de tiempo ni efectos.
 */
export function applyAwarePose(pose: AetherPose): void {
  Object.assign(pose, NEUTRAL_POSE, {
    headYaw: 10,
    headRoll: 3.5,
    headPitch: 1,
    visorGain: 1.3,
  } satisfies Partial<AetherPose>);
}
