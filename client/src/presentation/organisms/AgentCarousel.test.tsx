import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { agents } from "@/demo/agents";
import { AgentCarousel } from "./AgentCarousel";

// Simula únicamente el motor de geometría, que requiere un navegador con layout.
const engine = vi.hoisted(() => ({
  canScrollPrev: vi.fn(() => false),
  canScrollNext: vi.fn(() => true),
  scrollPrev: vi.fn(),
  scrollNext: vi.fn(),
  scrollTo: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
}));
vi.mock("embla-carousel-react", () => ({ default: () => [null, engine] }));

beforeEach(() => {
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  engine.canScrollPrev.mockReturnValue(false);
  engine.canScrollNext.mockReturnValue(true);
});

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

it("avanza cada cinco segundos, pausa la interacción y libera el temporizador", () => {
  vi.useFakeTimers();
  const { unmount } = render(<AgentCarousel agents={agents} />);
  const carousel = screen.getByRole("region", { name: "Agentes disponibles" });
  act(() => { vi.advanceTimersByTime(5000); });
  expect(engine.scrollNext).toHaveBeenCalledTimes(1);
  fireEvent.mouseEnter(carousel);
  act(() => { vi.advanceTimersByTime(5000); });
  expect(engine.scrollNext).toHaveBeenCalledTimes(1);
  fireEvent.mouseLeave(carousel);
  fireEvent.focus(carousel);
  fireEvent.blur(carousel);
  act(() => { vi.advanceTimersByTime(5000); });
  expect(engine.scrollNext).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole("button", { name: "Reanudar movimiento" }));
  act(() => { vi.advanceTimersByTime(5000); });
  expect(engine.scrollNext).toHaveBeenCalledTimes(2);
  fireEvent.click(screen.getByRole("button", { name: "Pausar movimiento" }));
  act(() => { vi.advanceTimersByTime(5000); });
  expect(engine.scrollNext).toHaveBeenCalledTimes(2);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});

it("no inicia movimiento automático cuando el usuario prefiere movimiento reducido", () => {
  vi.useFakeTimers();
  vi.mocked(window.matchMedia).mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() } as unknown as MediaQueryList);
  render(<AgentCarousel agents={agents} />);
  act(() => { vi.advanceTimersByTime(15000); });
  expect(engine.scrollNext).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "Reanudar movimiento" })).toBeInTheDocument();
});

it("ofrece navegación por flechas y teclado conservando los enlaces del agente", () => {
  render(<AgentCarousel agents={agents} />);
  const carousel = screen.getByRole("region", { name: "Agentes disponibles" });
  expect(screen.getByRole("button", { name: "Agentes anteriores" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Agentes siguientes" }));
  fireEvent.keyDown(carousel, { key: "ArrowRight" });
  expect(engine.scrollNext).toHaveBeenCalledTimes(2);
  expect(screen.getByRole("link", { name: "Ver ficha de SalesBot Pro" })).toHaveAttribute("href", "/agentes/salesbot-pro");
  expect(screen.getAllByRole("link", { name: "Solicitar demo" })[0]).toHaveAttribute("href", "/solicitar-demo?agente=salesbot-pro");
});

it("reinicia el carrusel al filtrar y retira los listeners del anterior", () => {
  const { rerender } = render(<AgentCarousel agents={agents} />);
  engine.canScrollNext.mockReturnValue(false);
  rerender(<AgentCarousel agents={[agents[0]]} />);
  expect(screen.queryByRole("link", { name: "Ver ficha de Support Genius" })).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Agentes siguientes" })).toBeDisabled();
  expect(engine.off).toHaveBeenCalledWith("select", expect.any(Function));
  expect(engine.off).toHaveBeenCalledWith("reInit", expect.any(Function));
});
