import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(cleanup);

// jsdom no implementa estas dos APIs. `AetherHeroStage` las usa para sacar la
// descarga del GLB de la ruta crítica, así que en pruebas se resuelven cuanto
// antes: el observador informa de intersección en el siguiente tick (como haría
// el navegador, nunca de forma síncrona) y el callback de inactividad se
// ejecuta ya.
if (!("IntersectionObserver" in globalThis)) {
  class ImmediateIntersectionObserver implements IntersectionObserver {
    readonly root = null;
    readonly rootMargin = "";
    readonly scrollMargin = "";
    readonly thresholds: ReadonlyArray<number> = [];

    private readonly callback: IntersectionObserverCallback;

    constructor(callback: IntersectionObserverCallback) {
      this.callback = callback;
    }

    observe(target: Element) {
      setTimeout(() => {
        this.callback([{ target, isIntersecting: true } as IntersectionObserverEntry], this);
      }, 0);
    }

    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }

  globalThis.IntersectionObserver = ImmediateIntersectionObserver as unknown as typeof IntersectionObserver;
}

if (!("requestIdleCallback" in globalThis)) {
  globalThis.requestIdleCallback = ((callback: IdleRequestCallback) =>
    setTimeout(
      () => callback({ didTimeout: false, timeRemaining: () => 50 } as IdleDeadline),
      0,
    ) as unknown as number) as typeof globalThis.requestIdleCallback;

  globalThis.cancelIdleCallback = ((handle: number) =>
    clearTimeout(handle as unknown as NodeJS.Timeout)) as typeof globalThis.cancelIdleCallback;
}
