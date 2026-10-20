import { describe, expect, it } from "vitest";
import { BONE_NAMES, normalizeBoneName } from "./aetherRig";

describe("nombres de hueso", () => {
  it("iguala el saneado que aplica GLTFLoader a los puntos", () => {
    // three.js no admite puntos en las rutas de animación, así que el nodo
    // `shoulder.L` del GLB llega al runtime como `shoulderL`.
    expect(normalizeBoneName(BONE_NAMES.shoulderL)).toBe(normalizeBoneName("shoulderL"));
    expect(normalizeBoneName(BONE_NAMES.shoulderR)).toBe(normalizeBoneName("shoulderR"));
  });

  it("vale también si el punto se sustituye por un guión bajo", () => {
    expect(normalizeBoneName("shoulder_L")).toBe(normalizeBoneName(BONE_NAMES.shoulderL));
  });

  it("no confunde huesos distintos", () => {
    expect(normalizeBoneName("shoulderL")).not.toBe(normalizeBoneName("shoulderR"));
    expect(normalizeBoneName("upper_arm.L")).not.toBe(normalizeBoneName(BONE_NAMES.shoulderL));
  });

  it("deja reconocibles los nombres que ya son simples", () => {
    for (const name of ["head", "chest", "pelvis", "root"]) {
      expect(normalizeBoneName(name)).toBe(name);
    }
  });
});
