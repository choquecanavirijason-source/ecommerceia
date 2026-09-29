# Plan vigente — marketplace de agentes

Actualizado: 29 de septiembre de 2026. Este es el único plan activo; [client/README.md](../../client/README.md) contiene la guía para retomar y ejecutar, y [client/AGENTS.md](../../client/AGENTS.md) las instrucciones para agentes de IA.

## Alcance y límites

Catálogo de agentes propios con solicitud de demo/cotización sin registro. No incluye checkout, pagos, vendedores externos ni ejecución de agentes. La estética aprobada es negra/azul/cian, con robot integrado al fondo, pulsación del robot y rebote de la mano; conservar esa personalidad, respetando movimiento reducido. Logo temporal AGENTES.IA; la referencia visual del usuario prevalece sobre el Figma heredado del ecommerce.

La base actual pertenece al ecommerce de OTRO CLIENTE. No leerla, escribirla, copiar sus datos, cambiar conexiones ni ejecutar migraciones/seeders. No iniciar su API para esta demo. La nueva base y el entorno de pruebas del marketplace siguen pendientes; hasta entonces, trabajar con fixtures locales. Esta decisión protege los datos del cliente y permite validar la interfaz sin acoplarla a su negocio.

El aislamiento solo cubre las rutas públicas de la demo. Las rutas heredadas de productos, cuenta, administración y checkout no están desactivadas y pueden llamar al ecommerce. El build/deploy heredado tampoco está aislado: `buildParams.ts` consulta la API y el script de deploy escribe en `server/public`. No ejecutar esas operaciones antes de separar el marketplace.

## Estado real

| Área | Estado |
|---|---|
| Portada | Hero adaptado, logo temporal, textos en español, robot/mano animados, categorías y selección de hasta 12 agentes |
| Datos | Diez fixtures del usuario en `client/src/demo/agents.ts`; contrato en `domain/entities/Agent.ts`; categorías/contadores derivados |
| Catálogo | `/agentes` con búsqueda y categoría; componente de carrusel compartido con portada |
| Carrusel | Bucle cuando hay suficientes tarjetas; avance de una tarjeta cada 5 s; pausa manual, hover, foco y arrastre; pestaña oculta no avanza; movimiento reducido respetado |
| Fichas | `/agentes/[slug]`, parámetros estáticos desde fixtures, enlaces con el agente seleccionado |
| Solicitudes | `/solicitar-demo` y `/solicitar-cotizacion` son vistas provisionales, sin formulario real, envío, almacenamiento ni reserva |
| Backend y administración | No implementados para el marketplace; backend heredado conservado y fuera del alcance actual |
| Código compartido | `AgentCard`, `AgentCarousel` y `AgentLogo` reutilizables; autoavance en `useCarouselAutoplay`; sin nueva dependencia |

## Próximos pasos

1. **Solicitudes locales:** formulario reutilizable con tipo demo/cotización, agente opcional, nombre/email, empresa/teléfono opcionales y mensaje. Validación visible y confirmación explícitamente simulada; no guardar datos personales en fixtures ni aparentar envíos reales.
2. **Separación técnica:** aislar rutas antiguas y generación estática; revisar despliegue. Definir una base y credenciales propias del marketplace, además de una base de testing aislada. Solo después habilitar persistencia.
3. **Backend independiente:** modelos Agent/AgentCategory/Inquiry, visibilidad publicado/borrador/archivado, API pública de lectura y solicitudes, validación, límite de frecuencia e idempotencia. Las rutas propuestas `/api/v1/agents`, `/agent-categories` e `/inquiries` todavía no existen para este módulo.
4. **Administración:** gestión de agentes y solicitudes con permisos, estados nueva/en contacto/cerrada e historial. No reutilizar datos ni tablas del cliente del ecommerce.
5. **Entrega:** contenido comercial real, marca, contacto y privacidad; revisión móvil/escritorio y despliegue aislado. El build final solo se valida después de resolver la separación del punto 2.

## Escala de 200+ miniagentes

Organizar por función/caso de uso. La portada muestra una selección por categoría y enlaza al catálogo; no montar 200 tarjetas ni decenas de carruseles automáticos simultáneos. Antes de cargar ese volumen, añadir paginación y filtros en catálogo/API, consultas acotadas y estados de carga/error/vacío. La búsqueda actual es local: aún no es una solución paginada ni una prueba de rendimiento a esa escala. Definir slugs persistentes antes de permitir renombrados.

## Continuidad y verificación

- Reutilizar dependencias existentes. TDD puntual para lógica nueva; comprobación visual para CSS. Evitar suites, instalaciones y cobertura global repetidas.
- Mantener README como entrada, este plan como estado y AGENTS como reglas. No crear un documento por cambio ni borrar archivos/assets del usuario para limpiar el repositorio.
- Preservar el staging y los cambios locales. El módulo heredado requiere una separación planificada; no eliminarlo como si fuera residuo.
- Evidencia previa: filtros/contadores/slugs y aislamiento aprobados; cuatro pruebas del carrusel (incluyendo autoavance/pausa/movimiento reducido) y tipos aprobados durante la implementación. No hay validación de persistencia del nuevo marketplace.
- La revisión responsive detectó desbordamiento de nombres de categoría a 320 px y una cabecera demasiado alta. Se ajustaron tarjetas, buscador compacto y controles táctiles de 44 px; registrar el resultado final de la comprobación al cerrar esta entrega.

El MVP completo termina cuando se descubre un agente real, se solicita demo/cotización y un administrador puede gestionar la solicitud en infraestructura independiente. La demo visual actual no equivale a ese MVP ni autoriza su publicación con el backend del otro cliente.
