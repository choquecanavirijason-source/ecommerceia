import { HeroSection } from "@/presentation/organisms/HeroSection";
import { FeaturesBar } from "@/presentation/organisms/FeaturesBar";
import { CategorySection } from "@/presentation/organisms/CategorySection";
import { FeaturedAgentsSection } from "@/presentation/organisms/FeaturedAgentsSection";
import { PromoBannerGrid } from "@/presentation/organisms/PromoBannerGrid";
import { AgentCollections } from "@/presentation/organisms/AgentCollections";
import { agentCollections } from "@/demo/agents";

export function HomeTemplate({ activeCategory, onCategoryChange }: {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}) {
  return <>
    <HeroSection />
    <FeaturesBar />
    <CategorySection activeCategory={activeCategory} onCategoryChange={onCategoryChange} />
    <FeaturedAgentsSection activeCategory={activeCategory} onCategoryChange={onCategoryChange} />
    <div className="mx-auto max-w-7xl px-4"><AgentCollections collections={agentCollections} /></div>
    <PromoBannerGrid />
  </>;
}
