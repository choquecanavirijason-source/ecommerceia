# Marketplace de agentes IA

Demo de catálogo con datos de prueba, construida sobre un repositorio de ecommerce. El frontend está en `client`; el backend heredado está en `server` y no se usa para esta demo.

**La base de datos del ecommerce pertenece a otro cliente. No consultarla, modificarla ni ejecutar migraciones/seeders.** El marketplace aún necesita una base independiente. Las solicitudes de demo/cotización son vistas provisionales y no guardan ni envían datos.

## Ejecutar con Docker (desarrollo)

Requiere Docker Desktop con motor Linux iniciado. Desde esta carpeta:

```sh
docker compose up --build -d --wait
```

Abrir http://localhost:3001. Para detener únicamente esta demo:

```sh
docker compose down
```

El Compose incluye solo el frontend: usuario sin privilegios, puerto ligado a loopback, healthcheck y sin volúmenes ni archivos `.env` del host. Las URLs heredadas de API se sustituyen por un destino local inhabilitado. Cambiar `DEMO_PORT` si 3001 está ocupado. Para incorporar cambios de código, repetir `docker compose up --build -d --wait`; las capas de dependencias se reutilizan mientras el lockfile no cambie.

Esta imagen usa `next dev`: **no es un despliegue de producción**. No ejecuta el build/export heredado ni inicia Laravel o una base. `server/Dockerfile` sigue siendo legado: usa `artisan serve`, carece de una arquitectura de producción validada y no forma parte de este Compose. Se añadió `.dockerignore` al backend para excluir credenciales y datos del contexto, sin construir ni ejecutar esa imagen.

## Contexto para continuar

- [Guía del frontend y mapa de código](client/README.md): fixtures, límites, ejecución local y pruebas puntuales.
- [Instrucciones para agentes de IA](client/AGENTS.md).
- [Plan vigente](docs/plans/tienda-agentes.plan.md): pendientes y separación necesaria antes de persistencia/publicación.

Conservar la paleta oscura/cian, robot sin recuadro, animaciones del robot/mano y carrusel con pausa. Evitar ampliar documentos o pruebas sin relación con el cambio. No utilizar rutas heredadas de productos, cuenta, administración o checkout al revisar la demo fuera de Docker.
