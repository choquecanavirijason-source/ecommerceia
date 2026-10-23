import { DiagramCard } from "@/presentation/atoms/DiagramCard";
import { IntegrationsDiagram } from "@/presentation/molecules/IntegrationsDiagram";
import { AutonomyDiagram } from "@/presentation/molecules/AutonomyDiagram";
import { CoverageDiagram } from "@/presentation/molecules/CoverageDiagram";
import { RequestFlowDiagram } from "@/presentation/molecules/RequestFlowDiagram";

/**
 * Panorama del catálogo en dos esquemas, para la portada.
 *
 * Mismos componentes que la ficha, con datos distintos: aquí las herramientas
 * de todo el catálogo y las tres modalidades sin resaltar ninguna; en la ficha,
 * las del agente y su modalidad. Recibe las integraciones por props: la
 * plantilla es quien lee los fixtures.
 */
interface CatalogueDiagramsSectionProps {
  integrations: readonly string[];
  categories: readonly { name: string; count: number }[];
}

export function CatalogueDiagramsSection({ integrations, categories }: CatalogueDiagramsSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20" aria-labelledby="catalogue-diagrams-title">
      <div className="mb-10 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#42C7E8]">Cómo encaja</p>
        <h2 id="catalogue-diagrams-title" className="text-2xl font-bold text-[#EAF2F8] sm:text-3xl">
          Dónde entra un agente en tu operación
        </h2>
        <p className="mt-3 text-sm text-[#91A7BC]">Esquemas ilustrativos del catálogo de demo.</p>
      </div>

      <div // `auto-rows-fr` iguala también entre filas: con `items-stretch` sólo
        // las de una misma fila medían igual, y las de abajo quedaban más bajas
        // porque su descripción ocupa una línea menos.
        className="grid auto-rows-fr items-stretch gap-5 lg:grid-cols-2">
        <DiagramCard
          title="Conecta con lo que ya usas"
          description="Las fichas declaran con qué herramientas está pensado cada agente. El agente queda en medio: recibe de un lado y deja el resultado del otro."
          caption="esquema · integraciones de ejemplo"
        >
          <IntegrationsDiagram integrations={integrations} />
        </DiagramCard>

        <DiagramCard
          title="Tú decides cuánto decide"
          description="Las tres modalidades del catálogo cambian dónde entra una persona: ejecutando lo que el agente propone, aprobando antes de actuar, o fuera del paso."
          caption="esquema · modalidades del catálogo"
        >
          <AutonomyDiagram />
        </DiagramCard>

        <DiagramCard
          title="Cubre diez funciones"
          description="Cada punto es una función del catálogo y su tamaño sigue al número de agentes de ejemplo que hay en ella."
          caption="esquema · categorías del catálogo"
        >
          <CoverageDiagram categories={categories} />
        </DiagramCard>

        <DiagramCard
          title="Del catálogo a la solicitud"
          description="El recorrido que la demo ya permite: explorar, abrir una ficha y pedir demo o cotización con el agente preseleccionado."
          caption="esquema · recorrido de la demo"
        >
          <RequestFlowDiagram />
        </DiagramCard>
      </div>
    </section>
  );
}
