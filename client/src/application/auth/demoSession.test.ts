import { describe, expect, it } from "vitest";
import {
  autenticar,
  buscarCuenta,
  destinoTrasAcceder,
  DemoCredentialsError,
  esAdministrador,
  normalizarCorreo,
} from "./demoSession";
import type { DemoAccount } from "@/demo/accounts";

const CUENTAS: readonly DemoAccount[] = [
  {
    email: "Persona@Ejemplo.io",
    password: "clave-buena",
    user: { id: 7, name: "Persona", email: "persona@ejemplo.io", roleName: "customer" },
  },
  {
    email: "jefa@ejemplo.io",
    password: "clave-jefa",
    user: { id: 8, name: "Jefa", email: "jefa@ejemplo.io", roleName: "admin" },
  },
];

describe("acceso de la demo", () => {
  it("encuentra la cuenta sin distinguir mayúsculas ni espacios", () => {
    expect(buscarCuenta("  PERSONA@ejemplo.IO ", CUENTAS)?.user.id).toBe(7);
    expect(normalizarCorreo(" A@B.C ")).toBe("a@b.c");
  });

  it("devuelve la sesión con los permisos del rol", () => {
    const sesion = autenticar("persona@ejemplo.io", "clave-buena", CUENTAS);

    expect(sesion.user.name).toBe("Persona");
    expect(sesion.permissions).toContain("agentes.ver");
    expect(sesion.permissions).not.toContain("agentes.gestionar");
    expect(sesion.accessToken).toMatch(/^demo-7-/);
  });

  it("da más permisos a administración", () => {
    const sesion = autenticar("jefa@ejemplo.io", "clave-jefa", CUENTAS);

    expect(esAdministrador(sesion)).toBe(true);
    expect(sesion.permissions).toContain("agentes.gestionar");
  });

  it("rechaza la contraseña incorrecta", () => {
    expect(() => autenticar("persona@ejemplo.io", "otra", CUENTAS)).toThrow(DemoCredentialsError);
  });

  it("no revela si el correo existe: mismo mensaje en ambos fallos", () => {
    const inexistente = (() => {
      try { autenticar("nadie@ejemplo.io", "x", CUENTAS); } catch (e) { return (e as Error).message; }
    })();
    const claveMala = (() => {
      try { autenticar("persona@ejemplo.io", "x", CUENTAS); } catch (e) { return (e as Error).message; }
    })();

    expect(inexistente).toBe(claveMala);
  });

  it("manda a cada rol a su sitio", () => {
    expect(destinoTrasAcceder(autenticar("persona@ejemplo.io", "clave-buena", CUENTAS))).toBe("/cuenta-demo");
    expect(destinoTrasAcceder(autenticar("jefa@ejemplo.io", "clave-jefa", CUENTAS))).toBe("/panel");
    expect(esAdministrador(null)).toBe(false);
  });
});
