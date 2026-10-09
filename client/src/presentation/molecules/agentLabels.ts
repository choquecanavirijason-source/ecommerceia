import type { AgentAutonomy, AgentPriceModel } from "@/domain/entities/Agent";

export const autonomyLabels: Record<AgentAutonomy, string> = {
  assisted: "Asistido", supervised: "Con aprobación humana", autonomous: "Autónomo",
};
export const pricingLabels: Record<AgentPriceModel, string> = {
  free: "Gratis", monthly: "Suscripción mensual", usage: "Por uso", quote: "A cotizar",
};
