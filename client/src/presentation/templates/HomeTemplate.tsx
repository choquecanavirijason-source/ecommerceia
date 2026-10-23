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
import { agentCategories, agentCollections, agents } from "@/demo/agents";

/** Las herramientas distintas que nombra el catálogo, sin repetir. */
const catalogueIntegrations = [...new Set(agents.flatMap(agent => agent.integrations))];

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
      <FeaturedAgentsSection activeCategory={activeCategory} onCategoryChange={onCategoryChange} />
      <ManifestoSection />
      <StickyScenarios />
      <CatalogueDiagramsSection integrations={catalogueIntegrations} categories={agentCategories} />
      <CapabilitiesSection />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <AgentCollections collections={agentCollections} />
      </div>
      <PromoBannerGrid />
      <FaqSection />
    </>
  );
}
