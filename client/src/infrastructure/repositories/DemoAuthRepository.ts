import type {
  AuthRepository,
  AuthSession,
  LoginCredentials,
} from "@/domain/repositories/AuthRepository";
import { autenticar } from "@/application/auth/demoSession";

/**
 * Acceso del marketplace de agentes, sin backend.
 *
 * Cumple el mismo contrato que `HttpAuthRepository`, pero no llama a ninguna
 * API: la del ecommerce pertenece a otro cliente y este marketplace todavía no
 * tiene base propia. Cuando la haya, se escribe otra implementación de
 * `AuthRepository` y los consumidores no cambian.
 *
 * La sesión vive en `sessionStorage` bajo una clave propia, separada de las
 * del ecommerce (`unocompras-*`), para que las dos aplicaciones no se pisen.
 * Se va al cerrar la pestaña: no es persistencia, es sólo no perder la sesión
 * al navegar entre páginas.
 */

export const DEMO_SESSION_KEY = "agentes-ia-demo-session";

function leerSesion(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const crudo = window.sessionStorage.getItem(DEMO_SESSION_KEY);
    return crudo ? (JSON.parse(crudo) as AuthSession) : null;
  } catch {
    // Pestaña privada o almacenamiento bloqueado: se sigue sin sesión.
    return null;
  }
}

function guardarSesion(sesion: AuthSession | null) {
  if (typeof window === "undefined") return;
  try {
    if (sesion) window.sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(sesion));
    else window.sessionStorage.removeItem(DEMO_SESSION_KEY);
  } catch {
    // Sin almacenamiento la sesión dura lo que dure la página. No es crítico.
  }
  window.dispatchEvent(new CustomEvent(DEMO_SESSION_CHANGED));
}

/** Aviso para que las vistas abiertas se enteren del cambio. */
export const DEMO_SESSION_CHANGED = "agentes-ia-session-changed";

export class DemoAuthRepository implements AuthRepository {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const sesion = autenticar(credentials.email, credentials.password);
    guardarSesion(sesion);
    return sesion;
  }

  // Sin parámetros a propósito: TypeScript permite implementar con menos
  // argumentos, y así no queda uno sin usar sólo para cumplir la firma.
  async register(): Promise<AuthSession> {
    // Sin base de datos no hay dónde dar de alta a nadie. Se declara para
    // cumplir el contrato y se falla claro en lugar de fingir que funciona.
    throw new Error("El alta de cuentas necesita una base de datos propia, todavía sin definir.");
  }

  async me(): Promise<AuthSession> {
    const sesion = leerSesion();
    if (!sesion) throw new Error("No hay sesión iniciada.");
    return sesion;
  }

  async updateProfile(): Promise<AuthSession> {
    throw new Error("Editar el perfil necesita una base de datos propia, todavía sin definir.");
  }

  async logout(): Promise<void> {
    guardarSesion(null);
  }
}

/** Lectura directa, para quien sólo necesita saber si hay sesión. */
export function leerSesionDemo(): AuthSession | null {
  return leerSesion();
}
