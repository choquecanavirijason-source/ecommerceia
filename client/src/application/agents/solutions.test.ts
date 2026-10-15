// @vitest-environment node
import { expect, it } from "vitest";
import { agents } from "@/demo/agents";
import { getIndustrySolutions } from "./solutions";

it("deriva industrias desde los fixtures con conteo y descripción", () => {
  const solutions = getIndustrySolutions(agents);
  expect(solutions.length).toBeGreaterThan(0);
  expect(solutions[0]).toHaveProperty("name");
  expect(solutions[0]).toHaveProperty("icon");
  expect(solutions[0]).toHaveProperty("description");
  expect(solutions[0]).toHaveProperty("count");
  expect(solutions[0].count).toBeGreaterThan(0);
});

it("ordena las soluciones por número de agentes de forma descendente", () => {
  const solutions = getIndustrySolutions(agents);
  for (let i = 1; i < solutions.length; i++) {
    expect(solutions[i - 1].count).toBeGreaterThanOrEqual(solutions[i].count);
  }
});

it("no incluye industrias sin agentes asociados", () => {
  const emptySolutions = getIndustrySolutions([]);
  expect(emptySolutions).toEqual([]);
});
