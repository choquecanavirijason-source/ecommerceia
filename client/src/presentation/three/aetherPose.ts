/**
 * Pose procedural del mecha AETHER-02.
 *
 * El GLB sólo tiene 18 huesos y NO tiene hueso de cuello: `chest` es el padre
 * directo de `head`. Toda la articulación del cuello se resuelve rotando el
 * hueso `head` sobre su propio pivote, y la intención se refuerza con `chest`
 * y los hombros. Los valores se expresan en grados para que el guión sea
 * legible y se limitan antes de convertirse en cuaterniones.
 */

/** Grados a radianes. */
export const DEG = Math.PI / 180;

/** Pose neutra. Todas las reproducciones arrancan desde aquí. */
export const NEUTRAL_POSE: AetherPose = {
  headYaw: 0,
  headPitch: 0,
  headRoll: 0,
  bodyShiftX: 0,
  leanPitch: 0,
  visorGain: 1,
};

/**
 * Límites del rig. La armadura tiene pesos rígidos, así que una inclinación
 * excesiva abriría la junta del cuello: el guión pide 15-25° y nos quedamos
 * en 22° para no exponer la costura.
 */
export const POSE_LIMITS = {
  headYaw: 52,
  headPitch: 16,
  headRoll: 22,
  bodyShiftX: 0.55,
  leanPitch: 11,
  visorGain: 3.2,
} as const satisfies Record<keyof AetherPose, number>;

export interface AetherPose {
  /** Giro horizontal de la cabeza. Positivo gira hacia su izquierda. */
  headYaw: number;
  /** Cabeceo. Positivo eleva el rostro. */
  headPitch: number;
  /** Inclinación lateral. Positivo baja la sien derecha. */
  headRoll: number;
  /** Desplazamiento lateral del torso, en unidades del modelo. */
  bodyShiftX: number;
  /** Acercamiento hacia la cámara inclinando el torso. */
  leanPitch: number;
  /** Multiplicador de la emisión del visor. 1 = valor original del material. */
  visorGain: number;
}

/** Devuelve una copia mutable de la pose neutra. */
export function createPose(): AetherPose {
  return { ...NEUTRAL_POSE };
}

/** Restaura la pose en el mismo objeto, sin reasignarlo. */
export function resetPose(pose: AetherPose): AetherPose {
  Object.assign(pose, NEUTRAL_POSE);
  return pose;
}

export function clamp(value: number, limit: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(limit, Math.max(-limit, value));
}

/** Aplica los límites del rig a una pose cualquiera. */
export function clampPose(pose: AetherPose): AetherPose {
  return {
    headYaw: clamp(pose.headYaw, POSE_LIMITS.headYaw),
    headPitch: clamp(pose.headPitch, POSE_LIMITS.headPitch),
    headRoll: clamp(pose.headRoll, POSE_LIMITS.headRoll),
    bodyShiftX: clamp(pose.bodyShiftX, POSE_LIMITS.bodyShiftX),
    leanPitch: clamp(pose.leanPitch, POSE_LIMITS.leanPitch),
    visorGain: Math.min(POSE_LIMITS.visorGain, Math.max(0, pose.visorGain)),
  };
}

/**
 * Historial corto de la pose para generar movimiento secundario.
 *
 * El guión pide que los hombros sigan a la cabeza con ~0,1 s de retraso. En
 * vez de duplicar cada tween, guardamos las muestras y leemos el valor que
 * tenía la cabeza hace `delay` segundos, interpolando entre muestras para que
 * el resultado no dependa de la tasa de fotogramas.
 */
export class PoseFollower {
  private readonly samples: Array<{ t: number; yaw: number; roll: number }> = [];
  private elapsed = 0;

  constructor(
    private readonly delay = 0.1,
    private readonly window = 0.6,
  ) {}

  reset(): void {
    this.samples.length = 0;
    this.elapsed = 0;
  }

  /** Registra la pose del fotograma actual y avanza el reloj interno. */
  push(dt: number, yaw: number, roll: number): void {
    this.elapsed += Math.max(0, dt);
    this.samples.push({ t: this.elapsed, yaw, roll });

    const cutoff = this.elapsed - this.window;
    while (this.samples.length > 2 && this.samples[1].t < cutoff) {
      this.samples.shift();
    }
  }

  /** Pose de la cabeza hace `delay` segundos. */
  sample(): { yaw: number; roll: number } {
    if (this.samples.length === 0) return { yaw: 0, roll: 0 };

    const target = this.elapsed - this.delay;
    const first = this.samples[0];
    if (target <= first.t) return { yaw: first.yaw, roll: first.roll };

    for (let i = this.samples.length - 1; i > 0; i -= 1) {
      const next = this.samples[i];
      const prev = this.samples[i - 1];
      if (prev.t <= target && target <= next.t) {
        const span = next.t - prev.t;
        const k = span > 0 ? (target - prev.t) / span : 1;
        return {
          yaw: prev.yaw + (next.yaw - prev.yaw) * k,
          roll: prev.roll + (next.roll - prev.roll) * k,
        };
      }
    }

    const last = this.samples[this.samples.length - 1];
    return { yaw: last.yaw, roll: last.roll };
  }
}

/** Pesos del movimiento secundario derivado del retraso de la cabeza. */
export const FOLLOW_WEIGHTS = {
  chestYaw: 0.3,
  chestRoll: -0.12,
  shoulderRoll: -0.34,
  shoulderYaw: 0.18,
} as const;

/** Rotaciones derivadas que alimentan torso y hombros. */
export interface SecondaryPose {
  chestYaw: number;
  chestRoll: number;
  shoulderRollL: number;
  shoulderRollR: number;
  shoulderYaw: number;
}

/**
 * Deriva torso y hombros de la cabeza retrasada. El contrarresto de hombros
 * es el "algo no cuadra" del guión: la cabeza se inclina y los hombros
 * compensan en sentido opuesto.
 */
export function deriveSecondary(delayed: { yaw: number; roll: number }): SecondaryPose {
  return {
    chestYaw: delayed.yaw * FOLLOW_WEIGHTS.chestYaw,
    chestRoll: delayed.roll * FOLLOW_WEIGHTS.chestRoll,
    shoulderRollL: delayed.roll * FOLLOW_WEIGHTS.shoulderRoll,
    shoulderRollR: delayed.roll * -FOLLOW_WEIGHTS.shoulderRoll,
    shoulderYaw: delayed.yaw * FOLLOW_WEIGHTS.shoulderYaw,
  };
}

/**
 * Velocidad angular normalizada de la cabeza (0..1). Alimenta la aberración
 * cromática y los rastros, para que los efectos nazcan del movimiento real y
 * desaparezcan cuando el robot se detiene.
 */
export function motionEnergy(deltaYaw: number, deltaRoll: number, dt: number): number {
  if (dt <= 0) return 0;
  const speed = (Math.abs(deltaYaw) + Math.abs(deltaRoll) * 0.6) / dt;
  return Math.min(1, speed / 220);
}

/**
 * Seguimiento del cursor. Se suma a la pose del guión en vez de sustituirla,
 * así el robot sigue al puntero sin perder la coreografía.
 */
export const LOOK_LIMITS = { yaw: 12, pitch: 6 } as const;

export interface LookOffset {
  yaw: number;
  pitch: number;
}

/** Puntero normalizado (-1..1) a grados de giro y cabeceo. */
export function pointerToLook(nx: number, ny: number): LookOffset {
  return {
    // El `+ 0` normaliza el cero negativo que sale de recortar -0.
    yaw: clamp(nx, 1) * LOOK_LIMITS.yaw + 0,
    // El eje Y de pantalla crece hacia abajo; el cabeceo positivo eleva.
    pitch: clamp(-ny, 1) * LOOK_LIMITS.pitch + 0,
  };
}

/**
 * Suavizado exponencial independiente de la tasa de fotogramas: a 30 o a 144
 * fps el valor tarda lo mismo en llegar.
 */
export function damp(current: number, target: number, rate: number, dt: number): number {
  if (dt <= 0) return current;
  return current + (target - current) * (1 - Math.exp(-rate * dt));
}

/** Suma el seguimiento del cursor sobre la pose del guión, en `out`. */
export function composeLook(pose: AetherPose, look: LookOffset, out: AetherPose): AetherPose {
  out.headYaw = pose.headYaw + look.yaw;
  out.headPitch = pose.headPitch + look.pitch;
  out.headRoll = pose.headRoll;
  out.bodyShiftX = pose.bodyShiftX;
  out.leanPitch = pose.leanPitch;
  out.visorGain = pose.visorGain;
  return out;
}
