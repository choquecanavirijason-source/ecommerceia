import { HeroSection } from "@/presentation/organisms/HeroSection";
import { FeaturesBar } from "@/presentation/organisms/FeaturesBar";
import { CategorySection } from "@/presentation/organisms/CategorySection";
import { FeaturedAgentsSection } from "@/presentation/organisms/FeaturedAgentsSection";
import { PromoBannerGrid } from "@/presentation/organisms/PromoBannerGrid";

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
      <CategorySection activeCategory={activeCategory} onCategoryChange={onCategoryChange} />
      <FeaturedAgentsSection activeCategory={activeCategory} onCategoryChange={onCategoryChange} />
      <PromoBannerGrid />
    </>
  );
}

