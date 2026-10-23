import { HeroSection } from "@/presentation/organisms/HeroSection";
import { FeaturesBar } from "@/presentation/organisms/FeaturesBar";
import { MarqueeSection } from "@/presentation/organisms/MarqueeSection";
import { CategorySection } from "@/presentation/organisms/CategorySection";
import { FeaturedAgentsSection } from "@/presentation/organisms/FeaturedAgentsSection";
import { ManifestoSection } from "@/presentation/organisms/ManifestoSection";
import { StickyScenarios } from "@/presentation/organisms/StickyScenarios";
import { CapabilitiesSection } from "@/presentation/organisms/CapabilitiesSection";
import { PromoBannerGrid } from "@/presentation/organisms/PromoBannerGrid";
import { AgentCollections } from "@/presentation/organisms/AgentCollections";
import { FaqSection } from "@/presentation/organisms/FaqSection";
import { CatalogueDiagramsSection } from "@/presentation/organisms/CatalogueDiagramsSection";
import { CatalogueStatsSection } from "@/presentation/organisms/CatalogueStatsSection";
import { pricingLabels } from "@/presentation/molecules/agentLabels";
import { agentCollections, agents } from "@/demo/agents";

/** Las herramientas distintas que nombra el catálogo, sin repetir. */
const catalogueIntegrations = [...new Set(agents.flatMap(agent => agent.integrations))];

/** Cuenta ocurrencias y las devuelve de mayor a menor. */
function repartir(valores: readonly string[], etiquetar: (v: string) => string = v => v) {
  const conteo = new Map<string, number>();
  for (const valor of valores) {
    const clave = etiquetar(valor);
    conteo.set(clave, (conteo.get(clave) ?? 0) + 1);
  }
  return [...conteo.entries()]
    .map(([etiqueta, total]) => ({ etiqueta, total }))
    .sort((a, b) => b.total - a.total);
}

/** Colecciones con los slugs que agrupa cada una, para el esquema. */
const resumenColecciones = agentCollections.map(coleccion => ({
  titulo: coleccion.title,
  agentes: coleccion.agentSlugs,
}));

const repartosCatalogo = {
  industrias: repartir(agents.flatMap(agent => agent.industries)),
  precio: repartir(agents.map(agent => agent.pricing.model), modelo => pricingLabels[modelo as keyof typeof pricingLabels]),
};

export function HomeTemplate({
  activeCategory,
  onCategoryChange,
}: {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}) {
  return (
    <>
      <HeroSection />
      <FeaturesBar />
      <MarqueeSection />
      <CategorySection activeCategory={activeCategory} onCategoryChange={onCategoryChange} />
      <CatalogueDiagramsSection integrations={catalogueIntegrations} colecciones={resumenColecciones} />
      <CatalogueStatsSection repartos={repartosCatalogo} />
      <FeaturedAgentsSection activeCategory={activeCategory} onCategoryChange={onCategoryChange} />
      <ManifestoSection />
      <StickyScenarios />
      <CapabilitiesSection />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <AgentCollections collections={agentCollections} />
      </div>
      <PromoBannerGrid />
      <FaqSection />
    </>
  );
}
