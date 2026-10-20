# Marketplace de agentes — demo frontend

Catálogo de agentes propios para explorar soluciones y, en una etapa posterior, solicitar demos o cotizaciones. Next.js 16, React 19, TypeScript y Tailwind; Embla para los carruseles. No incluye compras, ejecución de agentes ni vendedores externos.

## Por qué usamos datos de prueba

Los diez agentes aportados por el usuario viven en `src/demo/agents.ts`. Nombres, descripciones, categorías, imágenes y metadatos de descubrimiento son ejemplos para validar la experiencia; no acreditan funcionalidades ni disponibilidad comercial. No hay persistencia del marketplace todavía.

**La base de datos configurada en el ecommerce pertenece a otro cliente.** No se puede reutilizar, consultar, migrar, poblar ni modificar su configuración. Tampoco iniciar la API heredada para esta demo. Se necesita una base nueva, independiente, con credenciales y entorno de pruebas propios, aún pendientes de definir.

El aislamiento actual cubre las rutas de la demo mediante `src/demo/routes.ts`, `AppShell` y `Providers`: omiten navegación, sesión y sincronización del ecommerce. **No es un bloqueo global:** las rutas antiguas y el backend continúan en el repositorio. No usarlos al presentar o comprobar la demo.

Para arrancar el frontend localmente, abrir una terminal en `client` y ejecutar `npm ci` (primera vez) y luego `npm run dev`. No requiere Docker, backend ni base de datos.

## Retomar y ejecutar

1. Trabajar dentro de `client`. Usar las dependencias instaladas; en un equipo nuevo, `npm ci` con el lockfile existente.
2. Ejecutar `npm run dev` y abrir la URL indicada por Next. Reutilizar el servidor si ya está iniciado.
3. Limitar el recorrido a `/`, `/agentes`, `/agentes/<slug>`, `/solicitar-demo` y `/solicitar-cotizacion`.
4. Consultar el [plan vigente](../docs/plans/tienda-agentes.plan.md) antes de avanzar. Para agentes de IA, leer también [AGENTS.md](AGENTS.md).

No hace falta Laravel ni una base de datos para este recorrido. Las imágenes de Unsplash y las fuentes externas pueden requerir internet. Los assets del robot están en `public/assets`; el modelo 3D del hero, en `public/assets/models` junto a su licencia CC0.

El robot de la portada es un GLB con rig de 18 huesos animado por código (three.js + GSAP). El guión de 12 s va en bucle, con una transición de 1,4 s que devuelve la pose al arranque para que no salte, y la cabeza sigue al cursor sumando hasta 12° de giro y 6° de cabeceo sobre la pose del guión (sólo en punteros con hover). three.js y GSAP se cargan con `import()` dentro del efecto, así que no entran en el bundle inicial. Con `prefers-reduced-motion: reduce` se dibuja un único fotograma en pose fija, sin línea de tiempo ni efectos, y si WebGL falla queda la imagen `robot-demo.jpg`.

El GLB servido pesa **1,4 MB** (1,3 MB transferidos con gzip): viene con geometría Meshopt (`EXT_meshopt_compression`, decodificador registrado en `aetherScene.ts`) y texturas WebP, sin los 11 clips de animación que la pose procedural no usa. Conserva los 24.310 triángulos y el skin de 18 huesos del original. Para no competir con el LCP en móvil, la escena no se monta hasta que el contenedor se acerca al viewport, con un plazo máximo de 1,2 s por si el navegador no entrega el `IntersectionObserver` (una pestaña en segundo plano no lo hace). Hasta que aparece, el hueco queda vacío a propósito: enseñar el robot 2D antiguo y sustituirlo después se veía peor. El original y el script que reproduce la optimización están en [`assets-source/`](assets-source/README.md).

**No ejecutar todavía `npm run build`, `npm run deploy:server` ni comandos de backend.** `src/infrastructure/build/buildParams.ts` conserva consultas a productos/categorías de la API heredada y un fallback de 2.000 productos. La exportación/despliegue debe aislarse antes de utilizarse para este marketplace. El deploy existente copia archivos a `server/public`.

## Qué funciona y qué falta

- Portada con carrusel de hasta 12 agentes por categoría, cuatro colecciones editoriales y fichas por slug estable.
- `/agentes`: búsqueda por palabras sin distinción de tildes/mayúsculas, filtros combinados por categoría, industria, integración, autonomía y modalidad de precio; orden por relevancia/nombre y cuadrícula de seis tarjetas por página.
- Los filtros viajan en la URL (`q`, `categoria`, `industria`, `integracion`, `autonomia`, `precio`, `coleccion`, `orden`, `pagina`). La búsqueda se aplica con Buscar/Enter. Precios e integraciones son ilustrativos: no hay conexiones, ejecución, rankings de uso ni cobros reales.
- Carrusel en bucle, avance cada 5 segundos, pausa manual/hover/foco/arrastre y respeto de movimiento reducido. Con pocas tarjetas, Embla puede desactivar el bucle; no se duplican datos para rellenarlo.
- Las páginas de demo/cotización conservan `?agente=<slug>`, pero son vistas provisionales: **no envían, guardan ni reservan nada**.
- Logo provisional `AGENTES.IA`. Mantener paleta oscura/azul/cian, robot sin recuadro y animaciones de robot/mano; la mano se oculta por debajo de 640 px para dejar espacio al contenido.
- Navegación con cristal oscuro adaptable y menú de industrias accesible por teclado. `AnimatedIcon` comparte seis movimientos CSS expresivos que se repiten durante hover/foco de teclado/pulsación; el enlace/botón padre usa `data-icon-trigger`. El mapa tipado de iconos por función está en `CategorySection`. No hay límite de movimiento por diseño: solo se desactivan los efectos si el usuario activa movimiento reducido en su sistema. Sin temporizadores ni dependencias nuevas; la barra tiene fondo de respaldo sin desenfoque.
- Quedan pendientes formulario, persistencia independiente, administración de agentes/solicitudes, contenido definitivo y publicación segura.

## Mapa para continuar

| Responsabilidad | Ubicación bajo `src/` |
|---|---|
| Contrato de lectura | `domain/entities/Agent.ts` |
| Fixtures, colecciones y contadores locales | `demo/agents.ts` |
| Búsqueda, filtros, URL y paginación sin dependencia de fixtures | `application/agents/discovery.ts` |
| Recomendación local para chat guiado | `application/agents/recommend.ts` |
| Soluciones agrupadas por industria | `application/agents/solutions.ts` |
| Rutas aisladas de la demo (`/`, `/agentes`, `/chat`, solicitudes) | `demo/routes.ts`, `app/AppShell.tsx`, `app/providers.tsx` |
| Navegación, menú de soluciones, pie y logo temporal | `presentation/templates/AgentDemoShell.tsx`, `presentation/organisms/SolutionsMenu.tsx`, `presentation/atoms/AgentLogo.tsx` |
| Chat guiado simulado | `app/chat/page.tsx` |
| Portada | `presentation/templates/HomeTemplate.tsx`, `presentation/organisms/HeroSection.tsx`, `FeaturedAgentsSection.tsx` |
| Robot 3D del hero (primer plano animado) | `presentation/organisms/AetherHeroStage.tsx`, `presentation/three/` (`aetherScene.ts`, `aetherRig.ts`, `aetherPose.ts`, `aetherTimeline.ts`, `psychedelicShader.ts`) |
| Efectos interactivos y animación | `presentation/atoms/Magnet.tsx`, `presentation/atoms/AnimatedText.tsx`, `presentation/hooks/usePrefersReducedMotion.ts` |
| Marquee, manifiesto y escenarios sticky | `presentation/organisms/MarqueeSection.tsx`, `presentation/organisms/ManifestoSection.tsx`, `presentation/organisms/StickyScenarios.tsx` |
| Capacidades y FAQ accesible | `presentation/organisms/CapabilitiesSection.tsx`, `presentation/organisms/FaqSection.tsx` |
| Próximos pasos útiles | `presentation/organisms/PromoBannerGrid.tsx` |
| Catálogo y tarjetas | `presentation/organisms/AgentCatalogue.tsx`, `AgentCarousel.tsx`, `presentation/molecules/AgentCard.tsx` |
| Movimiento y limpieza de eventos | `presentation/hooks/useCarouselAutoplay.ts`, `presentation/atoms/carousel.tsx` |
| Fichas y selección de solicitudes | `app/agentes/[slug]/page.tsx`, `presentation/organisms/InquiryPreview.tsx` |

Las tarjetas y el carrusel reciben `Agent` por props y no importan fixtures. Sustituir el acceso a datos en los consumidores cuando exista un repositorio real; mantener la UI desacoplada. Los slugs son explícitos: conservarlos al renombrar agentes. Las colecciones referencian esos slugs. La paginación limita las tarjetas montadas; los fixtures todavía se cargan completos en el cliente, por lo que una API futura deberá asumir búsqueda y paginación.

## Validación acotada

Desde `client`, sin backend:

```sh
npm test -- src/application/agents/ src/demo/agents.test.ts src/app/demo-isolation.test.tsx
npx tsc --noEmit --incremental false
```

Las pruebas del carrusel simulan el motor de layout; no sustituyen la revisión visual ni la prueba táctil en dispositivos reales. Para CSS, revisar 320/390 px (móvil), 768 px (tableta) y 1280 px (escritorio): navegación, categorías, carrusel, fichas y selección de solicitudes. No ejecutar cobertura global o una batería backend por cambios visuales. La documentación de `docs/testing` corresponde a P0 histórico.
