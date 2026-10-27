import type { AuthSession } from "@/domain/repositories/AuthRepository";
import { DEMO_ACCOUNTS, DEMO_PERMISSIONS, type DemoAccount } from "@/demo/accounts";

/**
 * Comprobación de credenciales de la demo, sin red ni almacenamiento.
 *
 * Se separa del repositorio para poder probarla sola: es la única parte con
 * reglas de verdad, y el repositorio sólo la envuelve y guarda el resultado.
 */

export class DemoCredentialsError extends Error {
  constructor(message = "Correo o contraseña incorrectos.") {
    super(message);
    this.name = "DemoCredentialsError";
  }
}

/** Normaliza el correo: la demo no distingue mayúsculas ni espacios sobrantes. */
export function normalizarCorreo(email: string): string {
  return email.trim().toLowerCase();
}

export function buscarCuenta(email: string, cuentas: readonly DemoAccount[] = DEMO_ACCOUNTS) {
  const buscado = normalizarCorreo(email);
  return cuentas.find(cuenta => normalizarCorreo(cuenta.email) === buscado) ?? null;
}

/**
 * Devuelve la sesión si las credenciales cuadran, o lanza.
 *
 * El mismo mensaje para correo inexistente y contraseña incorrecta: decir
 * cuál de los dos falla revelaría qué cuentas existen.
 */
export function autenticar(
  email: string,
  password: string,
  cuentas: readonly DemoAccount[] = DEMO_ACCOUNTS,
): AuthSession {
  const cuenta = buscarCuenta(email, cuentas);
  if (!cuenta || cuenta.password !== password) throw new DemoCredentialsError();

  const rol = cuenta.user.roleName ?? "customer";
  return {
    // Identificador de sesión, no un token firmado: aquí no hay servidor que
    // lo valide. Sólo sirve para distinguir una sesión de otra.
    accessToken: `demo-${cuenta.user.id}-${Date.now()}`,
    expiresAt: null,
    user: cuenta.user,
    permissions: [...(DEMO_PERMISSIONS[rol] ?? [])],
  };
}

export function esAdministrador(session: AuthSession | null): boolean {
  return session?.user.roleName === "admin";
}

/** A dónde llevar a cada rol después de entrar. */
export function destinoTrasAcceder(session: AuthSession): string {
  return esAdministrador(session) ? "/panel" : "/cuenta-demo";
}
