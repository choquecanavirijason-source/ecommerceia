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

El frontend queda en http://localhost:3000 si se ejecuta localmente.

## Contexto para continuar

- [Guía del frontend y mapa de código](client/README.md): fixtures, límites, ejecución local y pruebas puntuales.
- [Instrucciones para agentes de IA](client/AGENTS.md).
- [Plan vigente](docs/plans/tienda-agentes.plan.md): pendientes y separación necesaria antes de persistencia/publicación.

Conservar la paleta oscura/cian, robot sin recuadro, animaciones del robot/mano y carrusel con pausa. Evitar ampliar documentos o pruebas sin relación con el cambio. No utilizar rutas heredadas de productos, cuenta, administración o checkout al revisar la demo fuera de Docker.
