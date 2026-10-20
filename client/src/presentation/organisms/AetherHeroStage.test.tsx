import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AetherHeroStage } from "./AetherHeroStage";

// Se simula sólo la capa three.js/GSAP: jsdom no tiene WebGL.
const scene = vi.hoisted(() => ({
  pose: { headYaw: 0, headPitch: 0, headRoll: 0, bodyShiftX: 0, leanPitch: 0, visorGain: 1 },
  rig: { reset: vi.fn() },
  warnings: [] as string[],
  setEffectsEnabled: vi.fn(),
  setGlitch: vi.fn(),
  setPointer: vi.fn(),
  renderOnce: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
  dispose: vi.fn(),
}));

const timeline = vi.hoisted(() => ({ play: vi.fn(), restart: vi.fn(), kill: vi.fn() }));

const factories = vi.hoisted(() => ({
  createAetherScene: vi.fn(),
  createAetherTimeline: vi.fn(),
  applyAwarePose: vi.fn(),
}));

vi.mock("@/presentation/three/aetherScene", () => ({
  createAetherScene: factories.createAetherScene,
}));

vi.mock("@/presentation/three/aetherTimeline", () => ({
  createAetherTimeline: factories.createAetherTimeline,
  applyAwarePose: factories.applyAwarePose,
}));

function stubMedia({ reducedMotion = false, hover = true } = {}) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("prefers-reduced-motion") ? reducedMotion : hover,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

const stubReducedMotion = (reducedMotion: boolean) => stubMedia({ reducedMotion });

beforeEach(() => {
  scene.warnings = [];
  factories.createAetherScene.mockResolvedValue(scene);
  factories.createAetherTimeline.mockReturnValue(timeline);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("escena de la portada", () => {
  it("reproduce el guión y ofrece los controles cuando se permite movimiento", async () => {
    stubReducedMotion(false);
    render(<AetherHeroStage />);

    await waitFor(() => expect(factories.createAetherTimeline).toHaveBeenCalledTimes(1));

    expect(scene.start).toHaveBeenCalled();
    expect(timeline.play).toHaveBeenCalledWith(0);
    expect(await screen.findByRole("button", { name: /repetir/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /efectos/i })).toHaveAttribute("aria-pressed", "true");
  });

  it("con movimiento reducido fija la pose, no crea la línea de tiempo ni muestra controles", async () => {
    stubReducedMotion(true);
    render(<AetherHeroStage />);

    await waitFor(() => expect(scene.renderOnce).toHaveBeenCalledTimes(1));

    expect(factories.applyAwarePose).toHaveBeenCalledWith(scene.pose);
    expect(scene.setEffectsEnabled).toHaveBeenCalledWith(false);
    expect(factories.createAetherTimeline).not.toHaveBeenCalled();
    expect(scene.start).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: /repetir/i })).not.toBeInTheDocument();
  });

  it("reinicia el rig antes de repetir, para no arrastrar el fotograma anterior", async () => {
    stubReducedMotion(false);
    render(<AetherHeroStage />);

    await waitFor(() => expect(factories.createAetherTimeline).toHaveBeenCalled());
    await userEvent.click(screen.getByRole("button", { name: /repetir/i }));

    expect(scene.rig.reset).toHaveBeenCalled();
    expect(timeline.restart).toHaveBeenCalledWith(true);
  });

  it("traslada el cursor a la escena como puntero normalizado", async () => {
    stubMedia();
    // rAF síncrono para no depender de temporizadores del entorno.
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });

    render(<AetherHeroStage />);
    await waitFor(() => expect(scene.start).toHaveBeenCalled());

    const container = screen.getByRole("img", { name: /AETHER-02 en primer plano/i });
    vi.spyOn(container, "getBoundingClientRect").mockReturnValue({
      left: 100,
      top: 100,
      width: 200,
      height: 200,
      right: 300,
      bottom: 300,
      x: 100,
      y: 100,
      toJSON: () => ({}),
    });

    // Centro del contenedor: (200, 200). Un cursor en (290, 155) queda a
    // +90 px en X sobre un alcance de 180, y a -45 px en Y sobre 220.
    window.dispatchEvent(new window.PointerEvent("pointermove", { clientX: 290, clientY: 155 }));

    expect(scene.setPointer).toHaveBeenCalledWith(0.5, expect.closeTo(-0.2045, 3));

    scene.setPointer.mockClear();
    window.dispatchEvent(new Event("blur"));
    expect(scene.setPointer).toHaveBeenCalledWith(null);
  });

  it("no sigue al cursor en dispositivos sin hover", async () => {
    stubMedia({ hover: false });
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });

    render(<AetherHeroStage />);
    await waitFor(() => expect(scene.start).toHaveBeenCalled());

    window.dispatchEvent(new window.PointerEvent("pointermove", { clientX: 10, clientY: 10 }));

    expect(scene.setPointer).not.toHaveBeenCalled();
  });

  it("libera la escena y la línea de tiempo al desmontar", async () => {
    stubReducedMotion(false);
    const { unmount } = render(<AetherHeroStage />);

    await waitFor(() => expect(factories.createAetherTimeline).toHaveBeenCalled());
    unmount();

    expect(timeline.kill).toHaveBeenCalled();
    expect(scene.dispose).toHaveBeenCalled();
  });

  it("cae en la imagen de respaldo si WebGL falla", async () => {
    stubReducedMotion(false);
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    factories.createAetherScene.mockRejectedValue(new Error("sin WebGL"));

    render(<AetherHeroStage />);

    // El estado de error retira el contenedor del canvas y deja sólo la imagen.
    await waitFor(() =>
      expect(screen.queryByRole("img", { name: /AETHER-02 en primer plano/i })).not.toBeInTheDocument(),
    );

    expect(screen.getByAltText(/robot que representa a los agentes/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /repetir/i })).not.toBeInTheDocument();
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });

  it("registra los avisos reales del modelo sin romper la escena", async () => {
    stubReducedMotion(false);
    scene.warnings = ["Huesos ausentes: neck."];
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(<AetherHeroStage />);

    await waitFor(() => expect(warn).toHaveBeenCalledWith("[AETHER-02]", "Huesos ausentes: neck."));
    warn.mockRestore();
  });
});
