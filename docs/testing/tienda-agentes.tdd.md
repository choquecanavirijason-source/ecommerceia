# Evidencia P0 — preparación de pruebas

Fecha: 28 de septiembre de 2026. Plan: [tienda-agentes.plan.md](../plans/tienda-agentes.plan.md).

## Alcance y método

El usuario autorizó P0: preparar herramientas y CI, ejecutar la base existente y registrar problemas heredados. Se escribieron seis pruebas de caracterización antes de añadir la configuración del runner. No se implementaron reglas de agentes, solicitudes ni cambios de comportamiento del comercio.

Estas pruebas comprueban comportamiento que ya existía; pasaron en su primera ejecución. No hay un RED de negocio y no se declara un ciclo RED/GREEN completado. Los errores de dependencias, extensiones y configuración encontrados no cuentan como RED. No se crearon checkpoints RED/GREEN ficticios. P1 deberá comenzar con las pruebas de catálogo y checkpoints indicados en el plan.

Historias verificadas:

- Como cliente, veo un resumen que suma importes y unidades, incluido un carrito vacío y productos gratuitos.
- Como cliente, cambio cantidades sin bajar de una unidad y puedo hacerlo con teclado sin enviar el formulario contenedor.
- Como desarrollador, ejecuto los tests existentes de autenticación y la página raíz en una base aislada, sin credenciales reales.

## Preparación realizada

- El detector ECC eligió Bun por `bun.lockb`; se hizo explícita la decisión npm mediante `packageManager: npm@10.9.2`, coherente con el README y el plan. Se preservó el lockfile de Bun como legado.
- Instalación inicial de cliente con `npm.cmd ci --no-audit --no-fund`: 476 paquetes. Instalación final limpia desde el lockfile actualizado: 595 paquetes, salida 0.
- Backend: se instaló `composer.lock` sin actualizar dependencias. Se habilitaron GD/SQLite para el proceso de instalación mediante opciones de PHP, sin editar el `php.ini` global.
- Vitest y coverage-v8 fijados a 4.1.11; Testing Library, jsdom, alias `@`, limpieza de DOM y scripts de test/watch/cobertura configurados.
- ESLint pasó de 10.8.1 a 9.39.5 y TypeScript de 7.0.2 a 6.0.3 para compatibilidad con los plugins instalados. Next y React conservaron sus versiones.
- npm 10 falló al cambiar versiones con `Cannot read properties of null (reading 'edgesOut')`; npm 11 se usó temporalmente para resolver el lockfile. La instalación limpia final fue verificada con npm 10.9.2.
- PHP: clave pública exclusiva de tests en `phpunit.xml`, entorno y SQLite en memoria forzados, correo simulado y `.env.testing.example`. La copia local `.env.testing` permanece ignorada.
- CI definido en `.github/workflows/quality.yml`: tests frontend con cobertura, lint, build y Pest. Sin tolerar fallos silenciosamente. No ejecutado todavía en GitHub.

## Problemas iniciales y resultado

| Comprobación | Resultado inicial | Resolución / estado |
|---|---|---|
| Composer | Falta GD en el PHP del entorno aislado | Instalación completada habilitando la extensión en el proceso |
| `php artisan test --no-ansi` | 3 fallos, 1 pasa: SQLite no disponible y clave ausente | Configuración de testing completada; Pest directo con SQLite pasa |
| Pest con SQLite y clave | Advertencias por `.env` ausente | `.env.testing.example` copiado localmente; ejecución estricta sin advertencias |
| Lint | `typescript-eslint does not support TS 7.0` | Herramientas alineadas con TypeScript 6 y ESLint 9; baseline de código registrado abajo |
| Tipos de tests | Matchers de jest-dom incompatibles con la interfaz de Assertion de Vitest 5 | Vitest 4.1.11; comprobación final de tipos sin errores |

## Comandos y garantías

Los comandos de cliente se ejecutaron desde `client` con los binarios locales de los scripts npm; los de servidor, desde `server`.

| Garantía | Archivo / comando realmente ejecutado | Resultado |
|---|---|---|
| Carrito vacío, cantidades distintas, producto gratuito | `src/application/cart/GetCartSummaryUseCase.test.ts` | 3 pruebas de caracterización |
| Cantidad mínima, incremento/decremento y teclado sin submit | `src/presentation/molecules/QuantitySelector.test.tsx` | 3 pruebas de componente |
| Tipos coherentes con el proyecto y la suite | `node node_modules/typescript/bin/tsc --noEmit` | PASS, salida 0 |
| Login/token, sesión, logout y raíz | `php -d extension=pdo_sqlite -d extension=sqlite3 vendor/bin/pest --colors=never --fail-on-warning` | PASS: 4 tests, 17 aserciones, sin advertencias |

Resultados finales de cobertura, lint y build: en verificación al crear este informe; completar antes de entregar P0.

## Límites

- No hay nuevas pruebas de comportamiento de agentes ni E2E; corresponden a P1–P4.
- La cobertura PHP no se midió: el PHP local no tiene PCOV/Xdebug cargado. El paso CI de backend valida Pest y no presenta un porcentaje de cobertura.
- ESLint 9 emite aviso de fin de soporte en el registro; es una fijación de compatibilidad con los plugins heredados. Su actualización coordinada queda pendiente. Recharts 2 también mantiene su advertencia de deprecación previa.
- No se ejecutaron despliegues ni se enviaron correos. El build usa una URL local no disponible para caracterizar el fallback actual, no un catálogo de producción.
- La imagen de referencia ya se recibió y quedó documentada en [dirección visual](../design/marketplace-reference.md). Su implementación pertenece a P5.
