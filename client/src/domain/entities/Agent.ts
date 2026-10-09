export type AgentAutonomy = "assisted" | "supervised" | "autonomous";
export type AgentPriceModel = "free" | "monthly" | "usage" | "quote";

/** Contrato de lectura, independiente del origen de los datos. */
export interface Agent {
  id: number;
  slug: string;
  name: string;
  desc: string;
  img: string;
  cat: string;
  tags: readonly string[];
  industries: readonly string[];
  integrations: readonly string[];
  autonomy: AgentAutonomy;
  pricing: { model: AgentPriceModel };
}

export interface AgentCollection {
  slug: string;
  title: string;
  description: string;
  agentSlugs: readonly string[];
}
