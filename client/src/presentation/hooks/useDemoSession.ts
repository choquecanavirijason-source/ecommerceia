"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { AuthSession } from "@/domain/repositories/AuthRepository";
import {
  DEMO_SESSION_CHANGED,
  DemoAuthRepository,
  leerSesionDemo,
} from "@/infrastructure/repositories/DemoAuthRepository";
import { LoginUseCase } from "@/application/auth/LoginUseCase";
import { LogoutUseCase } from "@/application/auth/LogoutUseCase";

/**
 * Sesión de la demo de agentes.
 *
 * No se reutiliza `useAuth`: aquél resuelve el repositorio HTTP del ecommerce
 * desde el contenedor y además sincroniza el carrito, cosas que aquí no
 * aplican. Los casos de uso sí se reutilizan, porque reciben el repositorio
 * por constructor.
 */

const repositorio = new DemoAuthRepository();
const iniciarSesion = new LoginUseCase(repositorio);
const cerrarSesion = new LogoutUseCase(repositorio);

function subscribe(alCambiar: () => void) {
  window.addEventListener(DEMO_SESSION_CHANGED, alCambiar);
  window.addEventListener("storage", alCambiar);
  return () => {
    window.removeEventListener(DEMO_SESSION_CHANGED, alCambiar);
    window.removeEventListener("storage", alCambiar);
  };
}

// `useSyncExternalStore` compara por referencia, así que se cachea el valor
// leído: devolver un objeto nuevo en cada llamada provocaría un bucle.
let cache: { crudo: string | null; valor: AuthSession | null } = { crudo: null, valor: null };

function getSnapshot(): AuthSession | null {
  const sesion = leerSesionDemo();
  const crudo = sesion ? JSON.stringify(sesion) : null;
  if (crudo !== cache.crudo) cache = { crudo, valor: sesion };
  return cache.valor;
}

function getServerSnapshot(): AuthSession | null {
  return null;
}

export function useDemoSession() {
  const session = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const entrar = useCallback(
    (email: string, password: string) => iniciarSesion.execute({ email, password }),
    [],
  );
  const salir = useCallback(() => cerrarSesion.execute(), []);

  return { session, entrar, salir };
}
