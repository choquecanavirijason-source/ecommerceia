import type { Agent, AgentAutonomy, AgentCollection, AgentPriceModel } from "@/domain/entities/Agent";

export interface DiscoveryFilters {
  query: string;
  category: string;
  industry: string;
  integration: string;
  autonomy: AgentAutonomy | "";
  pricing: AgentPriceModel | "";
  collection: string;
  sort: "relevance" | "name";
  page: number;
}

export const defaultDiscoveryFilters: DiscoveryFilters = {
  query: "", category: "", industry: "", integration: "", autonomy: "",
  pricing: "", collection: "", sort: "relevance", page: 1,
};

const paramNames: Record<keyof DiscoveryFilters, string> = {
  query: "q", category: "categoria", industry: "industria", integration: "integracion",
  autonomy: "autonomia", pricing: "precio", collection: "coleccion", sort: "orden", page: "pagina",
};
const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const positivePage = (value: number) => Number.isSafeInteger(value) && value > 0 ? value : 1;

export function readDiscoveryFilters(params: Pick<URLSearchParams, "get">): DiscoveryFilters {
  const get = (key: keyof DiscoveryFilters) => params.get(paramNames[key]) ?? "";
  const autonomy = get("autonomy");
  const pricing = get("pricing");
  return {
    query: get("query"), category: get("category"), industry: get("industry"),
    integration: get("integration"), collection: get("collection"),
    autonomy: autonomy === "assisted" || autonomy === "supervised" || autonomy === "autonomous" ? autonomy : "",
    pricing: pricing === "free" || pricing === "monthly" || pricing === "usage" || pricing === "quote" ? pricing : "",
    sort: get("sort") === "name" ? "name" : "relevance",
    page: positivePage(Number(get("page"))),
  };
}

export function discoverySearchParams(filters: DiscoveryFilters): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of Object.keys(paramNames) as (keyof DiscoveryFilters)[]) {
    if (filters[key] !== defaultDiscoveryFilters[key]) params.set(paramNames[key], String(filters[key]));
  }
  return params;
}

export function discoverAgents(
  source: readonly Agent[], collections: readonly AgentCollection[], filters: DiscoveryFilters, pageSize = 6,
) {
  const words = normalize(filters.query).trim().split(/\s+/).filter(Boolean);
  const collection = collections.find(item => item.slug === filters.collection);
  const matches = source.filter(agent => {
    const text = normalize([agent.name, agent.desc, agent.cat, ...agent.tags, ...agent.industries, ...agent.integrations].join(" "));
    return words.every(word => text.includes(word)) &&
      (!filters.category || agent.cat === filters.category) &&
      (!filters.industry || agent.industries.includes(filters.industry)) &&
      (!filters.integration || agent.integrations.includes(filters.integration)) &&
      (!filters.autonomy || agent.autonomy === filters.autonomy) &&
      (!filters.pricing || agent.pricing.model === filters.pricing) &&
      (!filters.collection || collection?.agentSlugs.includes(agent.slug));
  });
  if (filters.sort === "name") matches.sort((a, b) => a.name.localeCompare(b.name, "es"));
  else if (words.length) {
    const score = (agent: Agent) => words.reduce((total, word) => total +
      (normalize(agent.name).includes(word) ? 3 : 0) + (normalize(agent.tags.join(" ")).includes(word) ? 1 : 0), 0);
    matches.sort((a, b) => score(b) - score(a));
  }
  const size = positivePage(pageSize);
  const pages = Math.max(1, Math.ceil(matches.length / size));
  const page = Math.min(positivePage(filters.page), pages);
  return { items: matches.slice((page - 1) * size, page * size), total: matches.length, page, pages };
}
