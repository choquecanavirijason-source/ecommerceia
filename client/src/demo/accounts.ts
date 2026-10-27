import type { AuthUser } from "@/domain/repositories/AuthRepository";

/**
 * Cuentas de prueba del marketplace de agentes.
 *
 * No se reutilizan las de `marketplaceStorage` porque son del ecommerce
 * heredado: su correo y sus claves de almacenamiento llevan la marca del otro
 * cliente, y mezclar sesiones entre las dos aplicaciones sería un lío.
 *
 * Son credenciales de demostración, visibles en el propio repositorio y en la
 * pantalla de acceso. No protegen nada: no hay backend, ni cifrado, ni
 * persistencia. Cuando exista una base independiente, esto se sustituye por
 * usuarios reales y el acceso pasa por el servidor.
 */

export interface DemoAccount {
  email: string;
  /** En claro a propósito: es una demo sin backend que las verifique. */
  password: string;
  user: AuthUser;
}

export const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  {
    email: "cliente@agentes.ia",
    password: "demo1234",
    user: {
      id: 1,
      name: "Camila Rojas",
      email: "cliente@agentes.ia",
      mobileNumber: null,
      address: null,
      roleName: "customer",
    },
  },
  {
    email: "admin@agentes.ia",
    password: "admin1234",
    user: {
      id: 2,
      name: "Equipo AGENTES.IA",
      email: "admin@agentes.ia",
      mobileNumber: null,
      address: null,
      roleName: "admin",
    },
  },
];

/** Permisos por rol, para que la UI sepa qué ofrecer. */
export const DEMO_PERMISSIONS: Record<string, readonly string[]> = {
  customer: ["solicitudes.ver", "agentes.ver"],
  admin: ["solicitudes.ver", "solicitudes.gestionar", "agentes.ver", "agentes.gestionar"],
};
