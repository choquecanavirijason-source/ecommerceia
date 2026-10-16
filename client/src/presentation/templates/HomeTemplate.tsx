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
import { agentCollections } from "@/demo/agents";

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
      <CapabilitiesSection />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <AgentCollections collections={agentCollections} />
      </div>
      <PromoBannerGrid />
      <FaqSection />
    </>
  );
}
