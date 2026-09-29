export function isDemoRoute(pathname: string) {
  const path = pathname.replace(/\/$/, "") || "/";
  return path === "/" || path === "/agentes" || path.startsWith("/agentes/") ||
    path === "/solicitar-demo" || path === "/solicitar-cotizacion";
}
