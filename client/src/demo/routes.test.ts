import { describe, expect, it } from "vitest";
import { isDemoRoute } from "./routes";

describe("aislamiento de rutas", () => {
  it("incluye el acceso propio del marketplace", () => {
    for (const ruta of ["/acceso", "/acceso/admin", "/cuenta-demo", "/panel"]) {
      expect(isDemoRoute(ruta)).toBe(true);
      expect(isDemoRoute(`${ruta}/`)).toBe(true);
    }
  });

  it("deja fuera las rutas del ecommerce heredado", () => {
    for (const ruta of ["/cuenta", "/cuenta/ingresar", "/admin", "/checkout", "/productos"]) {
      expect(isDemoRoute(ruta)).toBe(false);
    }
  });

  it("mantiene las rutas públicas de siempre", () => {
    for (const ruta of ["/", "/agentes", "/agentes/salesbot-pro", "/chat", "/solicitar-demo", "/solicitar-cotizacion"]) {
      expect(isDemoRoute(ruta)).toBe(true);
    }
  });
});
