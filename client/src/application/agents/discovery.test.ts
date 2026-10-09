// @vitest-environment node
import { describe, expect, it } from "vitest";
import { agents, agentCollections } from "@/demo/agents";
import { defaultDiscoveryFilters, discoverAgents, readDiscoveryFilters, discoverySearchParams } from "./discovery";

const search = (changes: Partial<typeof defaultDiscoveryFilters>) =>
  discoverAgents(agents, agentCollections, { ...defaultDiscoveryFilters, ...changes });

describe("descubrimiento de agentes", () => {
  it("busca todas las palabras sin depender de mayúsculas o tildes", () => {
    expect(search({ query: "  ATENCION   whatsapp " }).items.map(a => a.slug)).toEqual(["support-genius"]);
    expect(search({ query: "término inexistente" }).total).toBe(0);
  });

  it("combina los filtros y la colección sin ampliar los resultados", () => {
    const filters = { category: "Support", industry: "Comercio", integration: "WhatsApp", autonomy: "supervised" as const, pricing: "monthly" as const, collection: "ventas-atencion" };
    expect(search(filters).items.map(a => a.slug)).toEqual(["support-genius"]);
    expect(search({ ...filters, industry: "Tecnología" }).total).toBe(0);
    expect(search({ ...filters, pricing: "free" }).total).toBe(0);
    expect(search({ collection: "inexistente" }).items).toEqual([]);
  });

  it("conserva filtros compartidos y normaliza parámetros de página inválidos", () => {
    const filters = { ...defaultDiscoveryFilters, query: "ventas & atención", category: "Sales", industry: "Comercio", integration: "Slack", autonomy: "assisted" as const, pricing: "usage" as const, collection: "operaciones", sort: "name" as const, page: 2 };
    expect(readDiscoveryFilters(discoverySearchParams(filters))).toEqual(filters);
    expect(discoverySearchParams(defaultDiscoveryFilters).toString()).toBe("");
    const invalid = readDiscoveryFilters(new URLSearchParams("pagina=-3&autonomia=robot&precio=otro&orden=desconocido"));
    expect(invalid.page).toBe(1);
    expect(invalid.autonomy).toBe("");
    expect(invalid.pricing).toBe("");
    expect(invalid.sort).toBe("relevance");
  });

  it("pagina un catálogo de 205 agentes y limita páginas fuera de rango", () => {
    const source = Array.from({ length: 205 }, (_, i) => ({ ...agents[0], id: i + 1, slug: `agent-${i}` }));
    const result = discoverAgents(source, [], { ...defaultDiscoveryFilters, page: 999 });
    expect(result.total).toBe(205);
    expect(result.pages).toBe(35);
    expect(result.page).toBe(35);
    expect(result.items).toHaveLength(1);
    expect(discoverAgents(source, [], defaultDiscoveryFilters).items).toHaveLength(6);
  });

  it("mantiene colecciones válidas y un orden alfabético explícito", () => {
    const slugs = new Set(agents.map(a => a.slug));
    expect(agentCollections.every(c => c.agentSlugs.length > 0 && c.agentSlugs.every(slug => slugs.has(slug)))).toBe(true);
    const ordered = search({ sort: "name" }).items.map(a => a.name);
    expect(ordered).toEqual([...ordered].sort((a, b) => a.localeCompare(b, "es")));
  });
});
