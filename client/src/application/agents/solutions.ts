import type { Agent } from "@/domain/entities/Agent";
import {
  ShoppingBag, Wrench, Monitor, DollarSign, GraduationCap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface IndustrySolution {
  name: string;
  icon: LucideIcon;
  description: string;
  count: number;
}

const industryMeta: Record<string, { icon: LucideIcon; description: string }> = {
  Comercio: { icon: ShoppingBag, description: "Agentes para ventas, atención al cliente y análisis de mercado." },
  Servicios: { icon: Wrench, description: "Soluciones para soporte, diseño y gestión de equipos." },
  Tecnología: { icon: Monitor, description: "Desarrollo, seguridad, datos e integraciones técnicas." },
  Finanzas: { icon: DollarSign, description: "Contabilidad, reportes y análisis financiero automatizado." },
  Educación: { icon: GraduationCap, description: "Investigación, resúmenes y apoyo al aprendizaje." },
};

/**
 * Deriva las industrias del catálogo, excluyendo las que no tengan agentes.
 * Los iconos y descripciones son ilustrativos para la demo.
 */
export function getIndustrySolutions(source: readonly Agent[]): IndustrySolution[] {
  const counts = new Map<string, number>();
  for (const agent of source) {
    for (const industry of agent.industries) {
      counts.set(industry, (counts.get(industry) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .filter(([name]) => industryMeta[name])
    .map(([name, count]) => ({
      name,
      ...industryMeta[name],
      count,
    }))
    .sort((a, b) => b.count - a.count);
}
