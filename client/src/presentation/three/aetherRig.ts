/**
 * Enlaza la pose procedural con los huesos reales del GLB.
 *
 * Guarda las transformaciones originales al montar y las reaplica en cada
 * fotograma antes de sumar los offsets, de modo que ninguna reproducción
 * acumula desplazamiento respecto a la anterior.
 */

import { Euler, Quaternion, Vector3, type Bone, type Object3D } from "three";
import {
  DEG,
  PoseFollower,
  clampPose,
  deriveSecondary,
  motionEnergy,
  type AetherPose,
} from "./aetherPose";

/** Nombres tal como salen del rig AETHER_02_RIG exportado desde Blender. */
export const BONE_NAMES = {
  head: "head",
  chest: "chest",
  pelvis: "pelvis",
  shoulderL: "shoulder.L",
  shoulderR: "shoulder.R",
} as const;

type BoneKey = keyof typeof BONE_NAMES;

/**
 * GLTFLoader sanea los nombres de nodo porque las rutas de animación de
 * three.js no admiten puntos: el `shoulder.L` del GLB llega como `shoulderL`.
 * Se comparan sólo letras y dígitos, así que da igual si el punto se elimina o
 * se sustituye por un guión bajo. Sin esto los hombros no se encuentran y el
 * movimiento secundario queda mudo en silencio.
 */
export function normalizeBoneName(name: string): string {
  return name.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

interface BaseTransform {
  quaternion: Quaternion;
  position: Vector3;
}

export class AetherRig {
  private readonly bones = new Map<BoneKey, Bone>();
  private readonly base = new Map<BoneKey, BaseTransform>();
  private readonly follower = new PoseFollower();
  private readonly scratchEuler = new Euler();
  private readonly scratchQuat = new Quaternion();
  private lastYaw = 0;
  private lastRoll = 0;

  /** Energía de movimiento del último fotograma, 0..1. */
  energy = 0;

  constructor(root: Object3D) {
    root.traverse((node) => {
      if (!(node as Bone).isBone) return;
      const nodeName = normalizeBoneName(node.name);
      for (const [key, name] of Object.entries(BONE_NAMES) as Array<[BoneKey, string]>) {
        if (nodeName === normalizeBoneName(name) && !this.bones.has(key)) {
          const bone = node as Bone;
          this.bones.set(key, bone);
          this.base.set(key, {
            quaternion: bone.quaternion.clone(),
            position: bone.position.clone(),
          });
        }
      }
    });
  }

  /** Huesos del guión que no aparecieron en el GLB. */
  get missingBones(): string[] {
    return (Object.keys(BONE_NAMES) as BoneKey[])
      .filter((key) => !this.bones.has(key))
      .map((key) => BONE_NAMES[key]);
  }

  get isUsable(): boolean {
    return this.bones.has("head");
  }

  /** Posición mundial de la cabeza, para encuadrar la cámara. */
  headWorldPosition(target = new Vector3()): Vector3 {
    const head = this.bones.get("head");
    if (!head) return target.set(0, 0, 0);
    head.updateWorldMatrix(true, false);
    return head.getWorldPosition(target);
  }

  /** Devuelve el rig a su pose de reposo y olvida el historial. */
  reset(): void {
    for (const [key, bone] of this.bones) {
      const base = this.base.get(key);
      if (!base) continue;
      bone.quaternion.copy(base.quaternion);
      bone.position.copy(base.position);
    }
    this.follower.reset();
    this.lastYaw = 0;
    this.lastRoll = 0;
    this.energy = 0;
  }

  /**
   * Compone la pose del fotograma. El orden YXZ hace que el giro sea
   * independiente del cabeceo, que es lo que espera una cabeza mecánica.
   */
  apply(rawPose: AetherPose, dt: number): void {
    const pose = clampPose(rawPose);

    this.energy = motionEnergy(pose.headYaw - this.lastYaw, pose.headRoll - this.lastRoll, dt);
    this.lastYaw = pose.headYaw;
    this.lastRoll = pose.headRoll;

    this.follower.push(dt, pose.headYaw, pose.headRoll);
    const secondary = deriveSecondary(this.follower.sample());

    this.rotate("head", pose.headPitch, pose.headYaw, pose.headRoll);
    this.rotate("chest", pose.leanPitch, secondary.chestYaw, secondary.chestRoll);
    this.rotate("shoulderL", 0, secondary.shoulderYaw, secondary.shoulderRollL);
    this.rotate("shoulderR", 0, secondary.shoulderYaw, secondary.shoulderRollR);
    this.rotate("pelvis", pose.leanPitch * 0.25, secondary.chestYaw * 0.2, 0);
    this.translate("pelvis", pose.bodyShiftX);
  }

  private rotate(key: BoneKey, pitchDeg: number, yawDeg: number, rollDeg: number): void {
    const bone = this.bones.get(key);
    const base = this.base.get(key);
    if (!bone || !base) return;

    this.scratchEuler.set(pitchDeg * DEG, yawDeg * DEG, rollDeg * DEG, "YXZ");
    this.scratchQuat.setFromEuler(this.scratchEuler);
    bone.quaternion.copy(base.quaternion).multiply(this.scratchQuat);
  }

  private translate(key: BoneKey, offsetX: number): void {
    const bone = this.bones.get(key);
    const base = this.base.get(key);
    if (!bone || !base) return;
    bone.position.set(base.position.x + offsetX, base.position.y, base.position.z);
  }
}
