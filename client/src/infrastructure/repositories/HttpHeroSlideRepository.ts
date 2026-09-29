import { apiRequest } from "@/infrastructure/http/client";
import type { HeroSlideRepository } from "@/domain/repositories/HeroSlideRepository";
import type { HeroSlide } from "@/domain/entities/HeroSlide";
import { heroSlidesSeed } from "@/infrastructure/data/heroSlides.data";

interface ApiBanner {
  id: number;
  title: string;
  subtitle: string | null;
  desc: string | null;
  cta: string;
  link_url: string | null;
  bg: string;
  accent: string;
  image: string;
  position: string;
  order: number;
  is_active: boolean;
}

function mapBanner(b: ApiBanner): HeroSlide {
  return {
    id: b.id,
    title: b.title,
    subtitle: b.subtitle ?? "",
    desc: b.desc ?? "",
    cta: b.cta,
    linkUrl: b.link_url ?? "/categorias",
    bg: b.bg,
    accent: b.accent,
    image: b.image,
    position: b.position,
    order: b.order,
    isActive: b.is_active,
  };
}

export class HttpHeroSlideRepository implements HeroSlideRepository {
  async list(): Promise<HeroSlide[]> {
    try {
      const res = await apiRequest<{ data: ApiBanner[] }>("/banners/hero");
      if (res?.data && res.data.length > 0) {
        return res.data.map(mapBanner);
      }
      return heroSlidesSeed;
    } catch {
      return heroSlidesSeed;
    }
  }
}
