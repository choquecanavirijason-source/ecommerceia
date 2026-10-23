import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(cleanup);

// jsdom no trae `IntersectionObserver` y `SpotlightCard` lo usa para pausar su
// bucle fuera de pantalla. El sustituto informa de intersección en el siguiente
// tick, como haría el navegador, nunca de forma síncrona.
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
