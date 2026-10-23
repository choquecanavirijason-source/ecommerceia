/**
 * Coreografía del robot del hero.
 *
 * Se mueve como lo que es: un robot de dos ruedas autoequilibrado. De ahí
 * salen los tres rasgos que la gobiernan:
 *
 *  - Para arrancar se inclina hacia donde va, y para frenar se echa atrás.
 *    Un péndulo invertido no puede acelerar de otra forma.
 *  - Al girar, las ruedas ruedan: nunca cambia de orientación sin que giren.
 *  - Tras cada parada queda un balanceo corto, la corrección que no llega a
 *    ser perfecta.
 *
 * El micro-equilibrio continuo no está aquí, sino en el bucle de la escena,
 * porque no debe pararse nunca.
 *
 * Nunca sale del cuadro ni cambia de tamaño: se queda a cuerpo entero y sólo
 * cambia de orientación. El acercamiento a plano corto se quitó porque
 * recortaba al robot contra el borde y se veía mal.
 */

import gsap from "gsap";
import type { RobotPose } from "./aiRobotScene";

export interface Punto {
  x: number;
  y: number;
}

export interface Encuadre {
  punto: Punto;
  escala: number;
}

interface OpcionesCoreografia {
  pose: RobotPose;
  encuadre: () => Encuadre;
}

/** Giro con su rodadura y su inclinación, como haría un robot de ruedas. */
function girarA(tl: gsap.core.Timeline, pose: RobotPose, giro: number, duracion: number) {
  const delta = giro - pose.giro;
  // Se inclina hacia el giro al arrancar y se endereza al terminar.
  tl.to(pose, { inclinacion: Math.sign(delta) * 0.045, duration: duracion * 0.3, ease: "sine.out" });
  tl.to(pose, { giro, duration: duracion, ease: "sine.inOut" }, "<");
  tl.to(pose, { rueda: `+=${delta * 2.6}`, duration: duracion, ease: "sine.inOut" }, "<");
  tl.to(pose, { inclinacion: 0, duration: duracion * 0.45, ease: "sine.inOut" }, `>-${duracion * 0.4}`);
  // Balanceo de asentamiento: corto y pequeño.
  tl.to(pose, { ladeo: Math.sign(delta) * 0.035, duration: 0.28, ease: "sine.out" }, ">-0.2");
  tl.to(pose, { ladeo: 0, duration: 0.5, ease: "sine.inOut" });
}

export function crearCoreografia({ pose, encuadre }: OpcionesCoreografia): gsap.core.Timeline {
  const tl = gsap.timeline({ repeat: -1 });

  tl.call(() => {
    const sitio = encuadre();
    pose.x = sitio.punto.x;
    pose.y = sitio.punto.y;
    pose.escala = sitio.escala;
    pose.giro = -0.15;
    pose.inclinacion = 0;
    pose.ladeo = 0;
  });

  // --- Echa un vistazo a los lados ------------------------------------------
  girarA(tl, pose, 0.38, 1.1);
  tl.to({}, { duration: 0.5 });
  girarA(tl, pose, -0.4, 1.3);
  tl.to({}, { duration: 0.45 });

  // --- Levanta una rueda y tantea -------------------------------------------
  // El cuerpo cae al lado contrario y la rueda libre gira en el aire.
  tl.to(pose, { ladeo: -0.15, inclinacion: 0.05, duration: 0.75, ease: "power2.out" });
  tl.to(pose, { rueda: "+=3.2", duration: 1.1, ease: "sine.inOut" }, "<");
  tl.to(pose, { ladeo: -0.11, duration: 0.5, ease: "sine.inOut" });
  tl.to(pose, { ladeo: 0, inclinacion: 0, duration: 0.8, ease: "power2.inOut" });
  tl.to({}, { duration: 0.4 });

  // --- Rueda un poco sobre su sitio y curiosea de nuevo -------------------
  // Sin acercarse: rueda, se asienta y vuelve a mirar. Mantiene el tamaño.
  tl.to(pose, { inclinacion: -0.09, duration: 0.4, ease: "power2.out" });
  tl.to(pose, { rueda: "+=4.2", duration: 1.2, ease: "sine.inOut" }, "<");
  tl.to(pose, { inclinacion: 0.05, duration: 0.5, ease: "sine.inOut" }, ">-0.35");
  tl.to(pose, { inclinacion: 0, duration: 0.6, ease: "sine.inOut" });
  tl.to({}, { duration: 0.5 });

  girarA(tl, pose, 0.22, 1);
  tl.to(pose, { ladeo: 0.1, duration: 0.65, ease: "sine.inOut" });
  tl.to({}, { duration: 0.9 });
  tl.to(pose, { ladeo: 0, duration: 0.65, ease: "sine.inOut" });

  girarA(tl, pose, -0.15, 1.1);
  tl.to({}, { duration: 0.9 });

  return tl;
}

/** Pose quieta para `prefers-reduced-motion`. */
export function aplicarPoseEnReposo(pose: RobotPose, encuadre: Encuadre): void {
  pose.x = encuadre.punto.x;
  pose.y = encuadre.punto.y;
  pose.escala = encuadre.escala;
  pose.giro = -0.15;
  pose.inclinacion = 0;
  pose.ladeo = 0;
  pose.alcance = 0;
  pose.rueda = 0;
  pose.respira = 0;
}
