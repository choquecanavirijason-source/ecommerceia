# Marketplace de agentes IA

Demo de catálogo con datos de prueba, construida sobre un repositorio de ecommerce. El frontend está en `client`; el backend heredado está en `server` y no se usa para esta demo.

**La base de datos del ecommerce pertenece a otro cliente. No consultarla, modificarla ni ejecutar migraciones/seeders.** El marketplace aún necesita una base independiente. Las solicitudes de demo/cotización son vistas provisionales y no guardan ni envían datos.

## Ejecutar en desarrollo

Iniciar frontend y Laravel con Docker desde esta carpeta:

```sh
docker compose up --build
```

El frontend queda en http://localhost:3001 y Laravel en http://localhost:8000. Compose no inicia una base de datos. El contenedor del frontend ejecuta `next dev`, así que este Compose es para desarrollo, no una imagen de producción.

Para ejecutar el frontend directamente en lugar del contenedor, usar desde `client`:

```sh
npm ci
npm run dev
```

El Compose incluye solo Next.js: usuario sin privilegios, puerto ligado a loopback y healthcheck. Opcionalmente carga **solo** `client/.env.openrouter.local` para el asesor; no carga archivos de configuración del ecommerce. Las URLs heredadas de API se sustituyen por un destino local inhabilitado. Cambiar `DEMO_PORT` si 3001 está ocupado. Para incorporar cambios de código, repetir `docker compose up --build -d --wait`; las capas de dependencias se reutilizan mientras el lockfile no cambie.

### Activar el asesor con OpenRouter

Copiar una sola vez la plantilla en PowerShell si el archivo local todavía no existe:

```powershell
Copy-Item client/.env.openrouter.example client/.env.openrouter.local
```

Editar `client/.env.openrouter.local` y completar `OPENROUTER_API_KEY`. No usar `export` en ese archivo ni el prefijo `NEXT_PUBLIC_`. Está ignorado por Git y excluido de la imagen; Compose inyecta las variables al arrancar. No compartirlo ni mostrar `docker compose config` con secretos en pantalla.

```sh
docker compose up --build -d --wait frontend
```

Abrir http://localhost:3001/chat/ y elegir **Asesor IA**. Modelo inicial: `openai/gpt-4.1-nano`; `OPENROUTER_MODEL` permite otro modelo con salida JSON por esquema. Repetir el comando al cambiar variables. Sin clave, **Demo local** funciona sin enviar mensajes. Las pruebas simulan OpenRouter y no consumen créditos.

Para cambiar de proveedor sin tocar código, completar en el mismo archivo `ADVISOR_API_URL` (endpoint https de chat completions compatible con OpenAI), `ADVISOR_API_KEY` y `ADVISOR_MODEL`; tienen prioridad sobre las variables `OPENROUTER_*`. La opción `provider` propia de OpenRouter solo se envía cuando la URL es de OpenRouter. El proveedor debe aceptar `response_format` con `json_schema`. Si cambia el proveedor, actualizar también el aviso de privacidad de `/chat`, que hoy nombra a OpenRouter.

Configurar un presupuesto de prueba para la clave en OpenRouter. El límite en memoria se reinicia con el proceso y no sustituye ese presupuesto. El endpoint no tiene autenticación: mantenerlo en localhost; antes de publicarlo requiere autenticación y cuotas persistentes. El asesor necesita servidor Next.js y no funciona mediante exportación HTML estática.

Esta imagen usa `next dev`: **no es un despliegue de producción**. No ejecuta el build/export heredado ni inicia Laravel o una base. `server/Dockerfile` sigue siendo legado: usa `artisan serve`, carece de una arquitectura de producción validada y no forma parte de este Compose. Se añadió `.dockerignore` al backend para excluir credenciales y datos del contexto, sin construir ni ejecutar esa imagen.
El frontend queda en http://localhost:3000 si se ejecuta localmente.

## Contexto para continuar

- [Guía del frontend y mapa de código](client/README.md): fixtures, límites, ejecución local y pruebas puntuales.
- [Instrucciones para agentes de IA](client/AGENTS.md).
- [Plan vigente](docs/plans/tienda-agentes.plan.md): pendientes y separación necesaria antes de persistencia/publicación.

Conservar la paleta oscura/cian, robot sin recuadro, animaciones del robot/mano y carrusel con pausa. Evitar ampliar documentos o pruebas sin relación con el cambio. No utilizar rutas heredadas de productos, cuenta, administración o checkout al revisar la demo fuera de Docker.
