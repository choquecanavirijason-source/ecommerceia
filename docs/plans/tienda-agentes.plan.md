# Plan vigente — marketplace de agentes

Actualizado: 9 de octubre de 2026. Este es el único plan activo; [client/README.md](../../client/README.md) explica cómo retomar y ejecutar, y [client/AGENTS.md](../../client/AGENTS.md) contiene las instrucciones para agentes de IA.

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
| Portada | Hero con textos en slider fijado al scroll y video sincronizado; carrusel de hasta 12 agentes por categoría y enlace al catálogo filtrado |
| Carrusel | Bucle cuando hay suficientes tarjetas, avance cada 5 s; pausa manual/hover/foco/arrastre, pestaña oculta y movimiento reducido |
| Fichas y solicitudes | Fichas por slug. Las vistas de demo/cotización conservan el agente seleccionado, sin formulario real, envío ni almacenamiento |
| Backend | No implementado para el marketplace; backend heredado fuera del alcance |
| Docker | Frontend de desarrollo independiente, puerto local 3001, usuario no root y healthcheck; sin servicios de API o BD |

La lógica de descubrimiento en `application/agents/discovery.ts` recibe datos y colecciones por argumentos. Las tarjetas/carrusel reciben agentes por props. No se añadieron dependencias ni documentos nuevos para esta etapa.

## Próximas etapas

1. **Ficha comercial:** casos de uso, requisitos y límites del agente; comparación y presentación de planes cuando exista contenido definido. No presentar capacidades ficticias como disponibles.
2. **Experiencia de demo:** playground explícitamente simulado y formulario local reutilizable de demo/cotización, con validación y confirmación simulada. No almacenar datos personales ni aparentar envíos reales.
3. **Separación técnica:** aislar rutas antiguas y generación estática; definir infraestructura, credenciales y entorno de pruebas propios. Después habilitar persistencia y despliegue seguro.
4. **Servicios reales:** API del catálogo/solicitudes y administración con permisos. Integraciones, ejecución, medición de uso y monetización requieren decisiones de producto y seguridad propias; no forman parte de esta demo.

## Escala y continuidad

La portada muestra una selección y el catálogo monta una página a la vez. La prueba con 205 agentes comprueba límites de paginación, no rendimiento de producción. Los fixtures completos siguen viajando al navegador; con una API futura, trasladar filtros, búsqueda y paginación al servidor. Conservar slugs al renombrar agentes.

Reutilizar dependencias y componentes; TDD puntual para lógica nueva, revisión visual para CSS. Mantener README como entrada, este plan como estado y AGENTS como reglas. No generar informes por cambio, alterar staging ni borrar assets del usuario. La documentación de testing histórica no autoriza pruebas backend.

## Validación de esta etapa

Ocho pruebas acotadas aprobadas (cinco nuevas de descubrimiento y tres existentes de fixtures), con fallo inicial antes de implementar. TypeScript sin emisión aprobado. Navegación comprobada: búsqueda sin tildes, vuelta atrás, filtros combinados desde URL y segunda página. Catálogo sin desbordamiento horizontal en 320, 768 y 1280 px. Docker reconstruido y frontend saludable en `http://localhost:3001`; no se ejecutó el build de producción ni se accedió al backend/BD del cliente.
