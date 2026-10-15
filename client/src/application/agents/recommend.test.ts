// @vitest-environment node
import { expect, it } from "vitest";
import { agents } from "@/demo/agents";
import { recommendAgents } from "./recommend";

it("encuentra agentes del catálogo a partir de una necesidad cotidiana", () => {
  const result = recommendAgents(agents, "Necesito responder consultas por WHATSAPP");
  expect(result.items.map(agent => agent.slug)).toEqual(["support-genius"]);
  expect(result.query).toBe("atencion whatsapp");
});

it("no inventa resultados ni sugiere todo ante una consulta vacía", () => {
  for (const query of ["", "quiero un agente", "astronomía cuántica", "ventas whatsapp"]) {
    expect(recommendAgents(agents, query).items).toEqual([]);
  }
});

it("limita las sugerencias y permite continuar con el catálogo completo", () => {
  const result = recommendAgents(agents, "Slack");
  expect(result.items).toHaveLength(3);
  expect(result.total).toBeGreaterThan(3);
});
