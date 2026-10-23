# Plan vigente — marketplace de agentes

Actualizado: 16 de octubre de 2026. Este es el único plan activo; [client/README.md](../../client/README.md) explica cómo retomar y ejecutar, y [client/AGENTS.md](../../client/AGENTS.md) contiene las instrucciones para agentes de IA.

## Alcance y límites

Demo de catálogo de agentes propios, orientada a solicitudes de demo/cotización. No incluye checkout, pagos, vendedores externos ni ejecución de agentes. Mantener la paleta negra/azul/cian, robot sin recuadro, pulsación del robot y rebote de la mano; respetar movimiento reducido. Logo temporal AGENTES.IA.

**La base del ecommerce pertenece a OTRO CLIENTE.** No consultarla, modificarla, copiar datos, cambiar conexiones, ejecutar migraciones/seeders ni iniciar su API. Usamos fixtures para validar la experiencia mientras se define una infraestructura independiente para este marketplace.

El aislamiento cubre solo `/`, `/agentes`, sus fichas y las vistas de solicitud. Las rutas heredadas de productos, cuenta, administración y checkout pueden llamar al ecommerce. El build/deploy heredado tampoco está aislado: `buildParams.ts` consulta la API y el deploy escribe en `server/public`. No ejecutarlos antes de separar el marketplace.

## Estado real

| Área | Estado |
|---|---|
| Etapa 1: descubrimiento | Implementada con fixtures: búsqueda de múltiples palabras, filtros combinables, URL compartible, orden por relevancia/nombre y seis tarjetas por página |
| Datos | Diez agentes; slugs explícitos, etiquetas, industria, integraciones, autonomía y modalidad de precio. Todos los atributos comerciales son ejemplos |
| Colecciones | Cuatro selecciones editoriales por caso de uso, visibles en portada y catálogo; sin popularidad, ratings o estadísticas inventadas |
| Navegación y soluciones | Menú "Soluciones" derivado de fixtures por industria, con iconos, recuento, cierre con Escape y adaptación móvil vertical |
| Chat guiado | `/chat` con asesor OpenRouter opcional y modo local. Contexto de fixtures, sin embeddings/BD. Clave solo en servidor Next, límites de consumo en memoria y respuestas estructuradas. Configuración en README raíz; el modelo puede equivocarse y el proveedor recibe mensajes |
| Portada | Hero con la imagen 2D `robot-demo.jpg` (el robot 3D y la mano que rebotaba se retiraron a petición del cliente); cuatro esquemas de encaje del catálogo y dos recuentos (la rejilla de funciones se retiró: cada categoría tiene un solo agente y el filtrado lo cubre el selector del catálogo), todos en SVG con ciclo automático y respuesta al ratón; efecto magnético conservado en el botón CTA; Marquee bidireccional de integraciones y capacidades acelerado por hardware; Manifiesto con 4 elementos ciber flotantes y revelación de texto en scroll (`AnimatedText`); 3 escenarios demostrativos en tarjetas apilables fijas (`StickyScenarios`); capacidades; banners de próximos pasos útiles y FAQ accesible |
| Carrusel | Bucle cuando hay suficientes tarjetas, avance cada 5 s; pausa manual/hover/foco/arrastre, pestaña oculta y movimiento reducido |
| Fichas y solicitudes | Fichas por slug. Las vistas de demo/cotización conservan el agente seleccionado, sin formulario real, envío ni almacenamiento |
| Aislamiento de rutas | Cubre `/`, `/agentes`, fichas, `/chat`, `/solicitar-demo` y `/solicitar-cotizacion` frente al ecommerce |
| Backend | No implementado para el marketplace; backend heredado fuera del alcance |
| Docker | Frontend de desarrollo independiente, puerto local 3001, usuario no root y healthcheck; sin servicios de API o BD |

La lógica de descubrimiento y recomendación (`application/agents/`) recibe datos y colecciones por argumentos. Las tarjetas/carrusel reciben agentes por props.

El hero usa la imagen 2D `robot-demo.jpg`. Hubo una escena 3D (GLB con rig de 18 huesos animado por código, optimizada de 5,7 MB a 1,4 MB con Meshopt y texturas WebP) que se retiró a petición del cliente junto con la mano que rebotaba; su código y el modelo se borraron y quedan en el historial de git.

## Próximas etapas

1. **Ficha comercial:** casos de uso, requisitos y límites del agente; comparación y presentación de planes cuando exista contenido definido. No presentar capacidades ficticias como disponibles.
2. **Experiencia de demo:** playground explícitamente simulado y formulario local reutilizable de demo/cotización, con validación y confirmación simulada. No almacenar datos personales ni aparentar envíos reales.
3. **Separación técnica:** aislar rutas antiguas y generación estática; definir infraestructura, credenciales y entorno de pruebas propios. Después habilitar persistencia y despliegue seguro.
4. **Servicios reales:** API del catálogo/solicitudes y administración con permisos. Integraciones, ejecución, medición de uso y monetización requieren decisiones de producto y seguridad propias; no forman parte de esta demo.

## Escala y continuidad

La portada muestra una selección y el catálogo monta una página a la vez. La prueba con 205 agentes comprueba límites de paginación, no rendimiento de producción. Los fixtures completos siguen viajando al navegador; con una API futura, trasladar filtros, búsqueda y paginación al servidor. Conservar slugs al renombrar agentes.

Reutilizar dependencias y componentes; TDD puntual para lógica nueva, revisión visual para CSS. Mantener README como entrada, este plan como estado y AGENTS como reglas. No generar informes por cambio, alterar staging ni borrar assets del usuario. La documentación de testing histórica no autoriza pruebas backend.

## Validación previa a OpenRouter

Dieciséis pruebas acotadas aprobadas (cinco de descubrimiento, tres de fixtures, tres de recomendación, tres de soluciones por industria y dos de aislamiento de rutas demo en AppShell), con fallo inicial antes de implementar. TypeScript sin emisión aprobado sin errores tanto en host como en Docker (`npx tsc --noEmit --incremental false`). Verificación visual y funcional en navegador: Hero interactivo, partículas deterministas, menú de soluciones por industria, alternancia de tres escenarios de demo, acordeón de FAQ accesible y chat guiado simulado con sugerencias rápidas, enlaces a catálogo filtrado y solicitudes de demo. Docker frontend saludable en `http://localhost:3001`; no se ejecutó el build de producción ni se accedió al backend/BD del cliente.
