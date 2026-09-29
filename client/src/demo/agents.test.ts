import { describe, expect, it } from "vitest";
import { agents, agentCategories, filterAgents, findAgent } from "./agents";

describe("catálogo local de la demo", () => {
  it("combina búsqueda normalizada y categoría", () => {
    expect(filterAgents("  SUPPORT  ", "Support").map(a => a.name)).toEqual(["Support Genius"]);
    expect(filterAgents("support", "Sales")).toEqual([]);
    expect(filterAgents("", "Todos")).toHaveLength(10);
  });

  it("deriva los contadores de los datos de prueba", () => {
    expect(agentCategories.reduce((sum, category) => sum + category.count, 0)).toBe(agents.length);
    expect(agentCategories.find(category => category.name === "Sales")?.count).toBe(1);
  });

  it("resuelve fichas por slug sin sustituir agentes desconocidos", () => {
    expect(findAgent("salesbot-pro")?.name).toBe("SalesBot Pro");
    expect(findAgent("desconocido")).toBeUndefined();
    expect(new Set(agents.map(agent => agent.slug)).size).toBe(agents.length);
  });
});
