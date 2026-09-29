# Pruebas y validación

## Cliente

Usar Node 22.12 o superior dentro de la rama 22 y npm 10.9.2. `client/package.json` declara npm; `client/package-lock.json` es el lockfile de instalación y CI. `bun.lockb` se conserva como archivo heredado, pero no debe usarse ni actualizarse en este flujo.

Desde `client`:

```sh
npm ci
npm test
npm run test:watch
npm run test:coverage
npm run typecheck
npm run lint
npm run build
```

En PowerShell, usar `npm.cmd` si la política de ejecución impide ejecutar `npm.ps1`.

Vitest descubre `src/**/*.test.ts` y `src/**/*.test.tsx`, con un máximo de dos workers de tipo thread. Las pruebas de componentes usan jsdom, React Testing Library, user-event y matchers de jest-dom. Cada prueba limpia su DOM. Importar `describe`, `it`, `expect` y mocks desde `vitest`; no depender de globals ni usar `bun test`.

La cobertura se escribe en `client/coverage/`. El reporte incluye todo `src`, incluso código heredado sin pruebas. Los umbrales de 80% se aplican únicamente al alcance inicial declarado en `vitest.config.mts`; cada módulo de producción nuevo/modificado deberá agregarse al alcance en la misma entrega. Un reporte global bajo no se presenta como cobertura global del 80%.

La configuración sigue la [guía de Next.js para Vitest](https://nextjs.org/docs/app/guides/testing/vitest), también disponible en `client/node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md`. Los componentes de servidor asíncronos necesitarán pruebas E2E en etapas posteriores. Referencias: [cobertura en Vitest](https://vitest.dev/config/coverage) y [React Testing Library](https://testing-library.com/docs/react-testing-library/setup/).

## Servidor

PHP 8.3, Composer 2 y extensiones requeridas por `composer.lock`, incluyendo GD, ZIP, mbstring y SQLite para pruebas. No usar `composer update` ni ignorar requisitos de extensiones para reproducir la instalación.

Desde `server`:

```sh
composer install --no-interaction --prefer-dist
```

Copiar `.env.testing.example` a `.env.testing` una vez, conservando cualquier archivo local existente. En PowerShell:

```powershell
if (-not (Test-Path .env.testing)) {
    Copy-Item -LiteralPath .env.testing.example -Destination .env.testing
}
php artisan test --no-ansi --fail-on-warning
```

Si SQLite está instalado pero no habilitado en PHP para Windows, ejecutar Pest directamente para que las opciones `-d` lleguen al runner:

```powershell
php -d extension=pdo_sqlite -d extension=sqlite3 vendor/bin/pest --colors=never --fail-on-warning
```

No añadir `-d extension=...` si la extensión ya está cargada. Para instalar con GD disponible pero desactivado, invocar el `composer.phar` de la instalación local con `php -d extension=gd <ruta-a-composer.phar> install --no-interaction --prefer-dist`.

`phpunit.xml` fuerza entorno testing, SQLite en memoria, correo simulado y una clave pública exclusiva de pruebas. `.env.testing` no contiene credenciales reales. No ejecutar la suite con una configuración Laravel cacheada de otro entorno; limpiar la caché local de configuración de pruebas antes de ejecutar si existe. La cobertura PHP requiere PCOV o Xdebug y no se presupone disponible.

## CI y TDD

`.github/workflows/quality.yml` ejecuta frontend con cobertura, lint, build y Pest en trabajos separados para que un fallo de lint no oculte los resultados de tests. Los fallos se conservan como fallos; no hay `continue-on-error`. La exportación se comprueba sin API disponible usando el fallback heredado; no demuestra publicación de datos reales.

El workflow corre en pull requests, pushes a `main` o manualmente. Añadirlo localmente no implica que ya se ejecutó en GitHub.

Para cada funcionalidad futura: prueba del comportamiento esperado → RED válido → checkpoint → implementación mínima → misma prueba GREEN → checkpoint → refactor opcional. Fallos de instalación/configuración no cuentan como RED de negocio. La evidencia y los fallos heredados se registran en [tienda-agentes.tdd.md](tienda-agentes.tdd.md).

Playwright y los recorridos E2E del catálogo se incorporarán en P4, cuando existan esas pantallas y endpoints. P0 valida la infraestructura de pruebas unitarias/componentes y la suite Laravel existente.
