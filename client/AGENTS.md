# Contexto del marketplace de agentes

Leer primero [README.md](README.md) y el [plan vigente](../docs/plans/tienda-agentes.plan.md). Son las fuentes de continuidad; actualizar esas páginas, sin crear un informe por cambio.

- Este frontend es una demo de catálogo de agentes propios para solicitar demo/cotización. Los datos están en `src/demo/agents.ts`; no son agentes comerciales disponibles ni un backend real.
- La base configurada en el ecommerce pertenece a OTRO CLIENTE. No consultarla, iniciar su API, cambiar sus conexiones, ejecutar migraciones/seeders ni copiar datos. La persistencia de este marketplace requiere una base independiente aún no definida.
- Solo las rutas públicas indicadas en el README están aisladas del ecommerce. No navegar por administración, cuenta, productos o checkout para validar esta demo. El build completo conserva consultas heredadas a la API: no ejecutarlo ni desplegar hasta separar esas rutas.
- Conservar paleta oscura/cian y robot sin recuadro. El hero es la imagen 2D `robot-demo.jpg`: el robot 3D y la mano que rebotaba se retiraron a petición del cliente. Respetar movimiento reducido. Logo `AgentLogo` temporal; carrusel con pausa y autoavance de 5 s.
- Reutilizar componentes y separar contratos de fixtures. TDD puntual para comportamiento nuevo; para ajustes visuales, revisar los anchos afectados. Evitar instalaciones repetidas, cobertura global y pruebas backend. No alterar staging, borrar assets del usuario ni dejar archivos temporales.
- La documentación de testing previa es histórica y no autoriza operaciones sobre el backend actual.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
