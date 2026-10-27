/**
 * Rutas públicas aisladas del ecommerce heredado.
 *
 * `/acceso` y sus destinos son el acceso propio del marketplace, que no toca
 * la API del otro cliente: van aquí y no en `/cuenta` ni `/admin`, que son
 * las del ecommerce y quedan fuera de la demo.
 */
export function isDemoRoute(pathname: string) {
  const path = pathname.replace(/\/$/, "") || "/";
  return path === "/" || path === "/agentes" || path.startsWith("/agentes/") ||
    path === "/chat" ||
    path === "/solicitar-demo" || path === "/solicitar-cotizacion" ||
    path === "/acceso" || path === "/acceso/admin" ||
    path === "/cuenta-demo" || path === "/panel";
}
