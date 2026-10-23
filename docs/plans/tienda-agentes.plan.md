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
| Portada | Hero con robot 3D en primer plano: GLB `aether-02` (CC0, rig de 18 huesos) animado por código con three.js + GSAP en un guión de 12 s en bucle —se activa, busca, se extraña, detecta al visitante y se acerca—, con seguimiento del cursor sumado a la pose, con aberración cromática, rastros y glitches derivados de la velocidad real de la cabeza y pose fija bajo movimiento reducido; sin mandos a la vista (el guión va solo) y sin `drop-shadow` en el canvas, porque se desbordaba por encima del contenedor y la máscara lo cortaba en recto, dejando una línea visible contra el fondo; efecto magnético conservado en el botón CTA y la mano; Marquee bidireccional de integraciones y capacidades acelerado por hardware; Manifiesto con 4 elementos ciber flotantes y revelación de texto en scroll (`AnimatedText`); 3 escenarios demostrativos en tarjetas apilables fijas (`StickyScenarios`); capacidades; banners de próximos pasos útiles y FAQ accesible |
| Carrusel | Bucle cuando hay suficientes tarjetas, avance cada 5 s; pausa manual/hover/foco/arrastre, pestaña oculta y movimiento reducido |
| Fichas y solicitudes | Fichas por slug. Las vistas de demo/cotización conservan el agente seleccionado, sin formulario real, envío ni almacenamiento |
| Aislamiento de rutas | Cubre `/`, `/agentes`, fichas, `/chat`, `/solicitar-demo` y `/solicitar-cotizacion` frente al ecommerce |
| Backend | No implementado para el marketplace; backend heredado fuera del alcance |
| Docker | Frontend de desarrollo independiente, puerto local 3001, usuario no root y healthcheck; sin servicios de API o BD |

La lógica de descubrimiento y recomendación (`application/agents/`) recibe datos y colecciones por argumentos. Las tarjetas/carrusel reciben agentes por props.

Para el robot 3D se añadió `three` (y `@types/three`); GSAP ya estaba instalado. La pose y el rig viven en `presentation/three/` separados de React: `aetherPose.ts` es lógica pura con pruebas y `aetherRig.ts` guarda las transformaciones originales del GLB para que ninguna reproducción acumule desplazamiento. El modelo no tiene hueso de cuello (`chest` es padre directo de `head`), así que la articulación del cuello se resuelve rotando `head` sobre su pivote; la inclinación se limita a 22° para no abrir la junta de la armadura, que tiene pesos rígidos. Los 11 clips del GLB no se usan: mueven los 18 huesos a la vez y pelearían con la pose procedural, así que se eliminaron del modelo servido. Ese GLB se optimizó de 5,7 MB a **1,4 MB** (1,3 MB con gzip) para que la portada sea desplegable sin castigar el LCP: texturas WebP con calidad por ranura —el primer plano sólo encuadra la cabeza, así que color base y normal conservan resolución—, geometría Meshopt (`EXT_meshopt_compression`; su decodificador cuesta ~20 KB frente a los ~200 KB de Draco) y sin el atributo `TANGENT`, que three.js reconstruye por derivadas. Se mantienen los 24.310 triángulos y el skin `AETHER_02_RIG` con sus 18 huesos. El original CC0 y el script reproducible quedan en `client/assets-source/`. Además, la escena espera a estar cerca del viewport antes de descargar el modelo, con plazo máximo de 1,2 s: una pestaña en segundo plano no entrega los callbacks de `IntersectionObserver` y sin ese plazo el robot no llegaba a aparecer. Dos detalles del rig que costaron depuración: GLTFLoader sanea los nombres de nodo y el `shoulder.L` del GLB llega como `shoulderL`, así que la búsqueda de huesos compara sólo letras y dígitos (sin esto los hombros no se encontraban y el movimiento secundario quedaba mudo en silencio); y el encuadre se ancla midiendo la coronilla ya deformada por los huesos y proyectada a pantalla, porque el techo de la caja del modelo está detrás y la coronilla, más cerca de la cámara, proyecta bastante más arriba.

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
