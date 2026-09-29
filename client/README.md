# Marketplace de agentes — demo frontend

Catálogo de agentes propios para explorar soluciones y, en una etapa posterior, solicitar demos o cotizaciones. Next.js 16, React 19, TypeScript y Tailwind; Embla para los carruseles. No incluye compras, ejecución de agentes ni vendedores externos.

## Por qué usamos datos de prueba

Los diez agentes aportados por el usuario viven en `src/demo/agents.ts`. Nombres, descripciones, categorías e imágenes son ejemplos para validar la experiencia; no acreditan funcionalidades ni disponibilidad comercial. No hay persistencia del marketplace todavía.

**La base de datos configurada en el ecommerce pertenece a otro cliente.** No se puede reutilizar, consultar, migrar, poblar ni modificar su configuración. Tampoco iniciar la API heredada para esta demo. Se necesita una base nueva, independiente, con credenciales y entorno de pruebas propios, aún pendientes de definir.

El aislamiento actual cubre las rutas de la demo mediante `src/demo/routes.ts`, `AppShell` y `Providers`: omiten navegación, sesión y sincronización del ecommerce. **No es un bloqueo global:** las rutas antiguas y el backend continúan en el repositorio. No usarlos al presentar o comprobar la demo.

## Retomar y ejecutar

1. Trabajar dentro de `client`. Usar las dependencias instaladas; en un equipo nuevo, `npm ci` con el lockfile existente.
2. Ejecutar `npm run dev` y abrir la URL indicada por Next. Reutilizar el servidor si ya está iniciado.
3. Limitar el recorrido a `/`, `/agentes`, `/agentes/<slug>`, `/solicitar-demo` y `/solicitar-cotizacion`.
4. Consultar el [plan vigente](../docs/plans/tienda-agentes.plan.md) antes de avanzar. Para agentes de IA, leer también [AGENTS.md](AGENTS.md).

No hace falta Laravel ni una base de datos para este recorrido. Las imágenes de Unsplash y las fuentes externas pueden requerir internet. Los assets del robot están en `public/assets`.

**No ejecutar todavía `npm run build`, `npm run deploy:server` ni comandos de backend.** `src/infrastructure/build/buildParams.ts` conserva consultas a productos/categorías de la API heredada y un fallback de 2.000 productos. La exportación/despliegue debe aislarse antes de utilizarse para este marketplace. El deploy existente copia archivos a `server/public`.

## Qué funciona y qué falta

- Portada, búsqueda/filtro local, categorías con contadores y fichas por slug. La portada muestra hasta 12 agentes del filtro seleccionado.
- Carrusel en bucle, avance cada 5 segundos, pausa manual/hover/foco/arrastre y respeto de movimiento reducido. Con pocas tarjetas, Embla puede desactivar el bucle; no se duplican datos para rellenarlo.
- Las páginas de demo/cotización conservan `?agente=<slug>`, pero son vistas provisionales: **no envían, guardan ni reservan nada**.
- Logo provisional `AGENTES.IA`. Mantener paleta oscura/azul/cian, robot sin recuadro y animaciones de robot/mano; la mano se oculta por debajo de 640 px para dejar espacio al contenido.
- Quedan pendientes formulario, persistencia independiente, administración de agentes/solicitudes, contenido definitivo y publicación segura.

## Mapa para continuar

| Responsabilidad | Ubicación bajo `src/` |
|---|---|
| Contrato de lectura | `domain/entities/Agent.ts` |
| Fixtures, filtros y contadores locales | `demo/agents.ts` |
| Rutas aisladas de la demo | `demo/routes.ts`, `app/AppShell.tsx`, `app/providers.tsx` |
| Navegación, pie y logo temporal | `presentation/templates/AgentDemoShell.tsx`, `presentation/atoms/AgentLogo.tsx` |
| Portada | `presentation/templates/HomeTemplate.tsx`, `presentation/organisms/HeroSection.tsx`, `FeaturedAgentsSection.tsx` |
| Catálogo y tarjetas | `presentation/organisms/AgentCatalogue.tsx`, `AgentCarousel.tsx`, `presentation/molecules/AgentCard.tsx` |
| Movimiento y limpieza de eventos | `presentation/hooks/useCarouselAutoplay.ts`, `presentation/atoms/carousel.tsx` |
| Fichas y selección de solicitudes | `app/agentes/[slug]/page.tsx`, `presentation/organisms/InquiryPreview.tsx` |

Las tarjetas y el carrusel reciben `Agent` por props y no importan fixtures. Sustituir el acceso a datos en los consumidores cuando exista un repositorio real; mantener la UI desacoplada. Actualmente el slug se deriva del nombre: antes de contenido persistente, definir slugs explícitos estables para evitar romper URLs al renombrar agentes.

## Validación acotada

Desde `client`, sin backend:

```sh
npm test -- src/demo/agents.test.ts src/presentation/organisms/AgentCarousel.test.tsx src/app/demo-isolation.test.tsx
npx tsc --noEmit --incremental false
```

Las pruebas del carrusel simulan el motor de layout; no sustituyen la revisión visual ni la prueba táctil en dispositivos reales. Para CSS, revisar 320/390 px (móvil), 768 px (tableta) y 1280 px (escritorio): navegación, categorías, carrusel, fichas y selección de solicitudes. No ejecutar cobertura global o una batería backend por cambios visuales. La documentación de `docs/testing` corresponde a P0 histórico.
