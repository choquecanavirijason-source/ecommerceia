import { describe, expect, it } from "vitest";
import {
  LOOK_LIMITS,
  NEUTRAL_POSE,
  POSE_LIMITS,
  PoseFollower,
  clampPose,
  composeLook,
  createPose,
  damp,
  deriveSecondary,
  motionEnergy,
  pointerToLook,
  resetPose,
} from "./aetherPose";

describe("pose de AETHER-02", () => {
  it("arranca en la pose neutra", () => {
    expect(createPose()).toEqual(NEUTRAL_POSE);
  });

  it("no acumula desplazamiento entre reproducciones", () => {
    const pose = createPose();
    pose.headYaw = 48;
    pose.headRoll = -19;
    pose.bodyShiftX = 0.4;
    pose.leanPitch = 9;

    expect(resetPose(pose)).toEqual(NEUTRAL_POSE);
  });

  it("limita la inclinación para no abrir la junta del cuello", () => {
    const clamped = clampPose({ ...NEUTRAL_POSE, headRoll: 90, headYaw: -180 });

    expect(clamped.headRoll).toBe(POSE_LIMITS.headRoll);
    expect(clamped.headYaw).toBe(-POSE_LIMITS.headYaw);
  });

  it("nunca deja el visor en emisión negativa", () => {
    expect(clampPose({ ...NEUTRAL_POSE, visorGain: -4 }).visorGain).toBe(0);
    expect(clampPose({ ...NEUTRAL_POSE, visorGain: 99 }).visorGain).toBe(POSE_LIMITS.visorGain);
  });

  it("descarta valores no finitos en vez de romper el cuaternión", () => {
    expect(clampPose({ ...NEUTRAL_POSE, headYaw: Number.NaN }).headYaw).toBe(0);
  });

  it("contrarresta los hombros cuando la cabeza se inclina", () => {
    const secondary = deriveSecondary({ yaw: 0, roll: 20 });

    expect(Math.sign(secondary.shoulderRollL)).toBe(-1);
    expect(Math.sign(secondary.shoulderRollR)).toBe(1);
    expect(Math.sign(secondary.chestRoll)).toBe(-1);
  });
});

describe("retraso del movimiento secundario", () => {
  it("devuelve la pose de hace 0,1 s", () => {
    const follower = new PoseFollower(0.1);

    follower.push(0.05, 10, 0);
    follower.push(0.05, 20, 0);
    follower.push(0.05, 30, 0);
    follower.push(0.05, 40, 0);

    // A los 0,2 s de reloj, el valor retrasado es el de 0,1 s: 20.
    expect(follower.sample().yaw).toBeCloseTo(20, 5);
  });

  it("da el mismo resultado con distinta tasa de fotogramas", () => {
    const slow = new PoseFollower(0.1);
    const fast = new PoseFollower(0.1);

    // Rampa lineal de 0 a 60 grados en 0,6 s, muestreada a 20 y 120 fps.
    for (let i = 1; i <= 12; i += 1) slow.push(0.05, i * 5, 0);
    for (let i = 1; i <= 72; i += 1) fast.push(1 / 120, i * (5 / 6), 0);

    expect(fast.sample().yaw).toBeCloseTo(slow.sample().yaw, 1);
  });

  it("mantiene el valor inicial mientras no hay historial suficiente", () => {
    const follower = new PoseFollower(0.1);
    follower.push(0.016, 34, -3);

    expect(follower.sample()).toEqual({ yaw: 34, roll: -3 });
  });

  it("se olvida del historial al reiniciar", () => {
    const follower = new PoseFollower(0.1);
    follower.push(0.05, 40, 10);
    follower.push(0.05, 40, 10);
    follower.reset();

    expect(follower.sample()).toEqual({ yaw: 0, roll: 0 });
  });
});

describe("energía de movimiento", () => {
  it("es cero cuando la cabeza está quieta", () => {
    expect(motionEnergy(0, 0, 1 / 60)).toBe(0);
  });

  it("se satura en 1 durante un giro rápido", () => {
    expect(motionEnergy(60, 0, 1 / 60)).toBe(1);
  });

  it("no divide por cero en el primer fotograma", () => {
    expect(motionEnergy(10, 10, 0)).toBe(0);
  });
});

describe("seguimiento del cursor", () => {
  it("traduce el puntero a giro y cabeceo dentro del límite", () => {
    expect(pointerToLook(1, 0)).toEqual({ yaw: LOOK_LIMITS.yaw, pitch: 0 });
    expect(pointerToLook(-1, 0).yaw).toBe(-LOOK_LIMITS.yaw);
  });

  it("invierte el eje vertical: el cursor arriba eleva el rostro", () => {
    expect(pointerToLook(0, -1).pitch).toBe(LOOK_LIMITS.pitch);
    expect(pointerToLook(0, 1).pitch).toBe(-LOOK_LIMITS.pitch);
  });

  it("satura fuera del contenedor en vez de dispararse", () => {
    expect(pointerToLook(5, -5)).toEqual({ yaw: LOOK_LIMITS.yaw, pitch: LOOK_LIMITS.pitch });
  });

  it("suma el seguimiento sobre la pose del guión sin tocar el resto", () => {
    const pose = { ...NEUTRAL_POSE, headYaw: 20, headRoll: 9, leanPitch: 4, visorGain: 2 };
    const out = createPose();

    composeLook(pose, { yaw: 12, pitch: -6 }, out);

    expect(out.headYaw).toBe(32);
    expect(out.headPitch).toBe(-6);
    expect(out.headRoll).toBe(9);
    expect(out.leanPitch).toBe(4);
    expect(out.visorGain).toBe(2);
  });

  it("amortigua por tiempo, no por fotograma", () => {
    // Medio segundo de recorrido con pasos distintos llega al mismo punto.
    let slow = 0;
    for (let i = 0; i < 10; i += 1) slow = damp(slow, 100, 6, 0.05);

    let fast = 0;
    for (let i = 0; i < 60; i += 1) fast = damp(fast, 100, 6, 0.5 / 60);

    expect(fast).toBeCloseTo(slow, 0);
  });

  it("no avanza con delta cero", () => {
    expect(damp(3, 100, 6, 0)).toBe(3);
  });
});
