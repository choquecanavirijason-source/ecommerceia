import { DiagramCard } from "@/presentation/atoms/DiagramCard";
import { IndustriesDiagram, type Reparto } from "@/presentation/molecules/IndustriesDiagram";
import { PricingDiagram } from "@/presentation/molecules/PricingDiagram";

/**
 * Cómo se reparte el catálogo, en cuatro gráficos.
 *
 * Acompañan a los esquemas de encaje sin repetirlos: aquéllos explican cómo
 * trabaja un agente, éstos cuántos hay de cada tipo. Son los dos ejes que el
 * catálogo declara y que no estaban dibujados en ninguna parte: industria y
 * modalidad de precio. No se hace uno de categorías porque cada agente ocupa
 * la suya y saldrían las diez barras iguales.
 *
 * Recibe los repartos ya contados por props: la plantilla lee los fixtures.
 */
export interface RepartosCatalogo {
  industrias: readonly Reparto[];
  precio: readonly Reparto[];
}

export function CatalogueStatsSection({ repartos }: { repartos: RepartosCatalogo }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16" aria-labelledby="catalogue-stats-title">
      <div className="mb-8">
        <h3 id="catalogue-stats-title" className="text-lg font-bold text-[#EAF2F8]">
          Cómo se reparte el catálogo
        </h3>
        <p className="mt-2 text-sm text-[#91A7BC]">
          Recuentos de los diez agentes de ejemplo. Señala cualquier dato para verlo en detalle.
        </p>
      </div>

      <div className="grid auto-rows-fr items-stretch gap-5 lg:grid-cols-2">
        <DiagramCard
          title="Por industria"
          description="En qué sectores se sitúan los agentes de ejemplo. Una ficha puede nombrar más de una industria, así que la suma supera los diez."
          caption="recuento · industrias declaradas"
        >
          <IndustriesDiagram datos={repartos.industrias} />
        </DiagramCard>

        <DiagramCard
          title="Por modalidad de precio"
          description="Cómo se cobraría cada agente si el catálogo fuera real. El importe no está definido: la ficha sólo declara la modalidad."
          caption="recuento · modalidades de precio"
        >
          <PricingDiagram datos={repartos.precio} />
        </DiagramCard>

      </div>
    </section>
  );
}
