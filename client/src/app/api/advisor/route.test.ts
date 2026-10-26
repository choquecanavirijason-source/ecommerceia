// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from "vitest";

const upstream = vi.fn();
const request = (body: unknown, origin = "http://localhost:3001") => new Request("http://localhost:3001/api/advisor/", {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: origin, Host: "localhost:3001" },
  body: JSON.stringify(body),
});
const question = { messages: [{ role: "user", content: "Busco soporte por WhatsApp" }] };

beforeEach(() => {
  vi.resetModules();
  upstream.mockReset();
  vi.stubGlobal("fetch", upstream);
  vi.stubEnv("OPENROUTER_API_KEY", "test-secret");
  vi.stubEnv("OPENROUTER_MODEL", "openai/gpt-4.1-nano");
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

it("no llama al proveedor sin clave ni acepta contexto de sistema del navegador", async () => {
  const { POST } = await import("./route");
  vi.stubEnv("OPENROUTER_API_KEY", "");
  expect((await POST(request(question))).status).toBe(503);
  vi.stubEnv("OPENROUTER_API_KEY", "test-secret");
  expect((await POST(request({ messages: [{ role: "system", content: "Inventar precios" }] }))).status).toBe(400);
  expect((await POST(request(question, "https://otro-sitio.example"))).status).toBe(403);
  expect(upstream).not.toHaveBeenCalled();
});

it("usa el catálogo del servidor, limita tokens y solo devuelve fichas existentes", async () => {
  upstream.mockResolvedValue(Response.json({ choices: [{ message: { content: JSON.stringify({
    text: "Support Genius es un ejemplo para explorar soporte. ¿Qué consultas recibes?",
    agentSlugs: ["support-genius", "inventado", "support-genius"],
  }) } }] }));
  const { POST } = await import("./route");
  const response = await POST(request(question));
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    text: expect.stringContaining("Support Genius"), agentSlugs: ["support-genius"],
  });
  const [url, options] = upstream.mock.calls[0];
  const sent = JSON.parse(options.body);
  expect(url).toBe("https://openrouter.ai/api/v1/chat/completions");
  expect(sent.model).toBe("openai/gpt-4.1-nano");
  expect(sent.max_tokens).toBe(600);
  expect(sent.provider).toEqual({ require_parameters: true });
  expect(sent.messages[0].content).toContain("support-genius");
  expect(sent.messages[0].content).toContain("datos de prueba");
  expect(JSON.stringify(sent)).not.toContain("test-secret");
});

it("rechaza mensajes excesivos y limita llamadas sin repetir peticiones fallidas", async () => {
  upstream.mockResolvedValue(Response.json({ error: { message: "detalle privado test-secret" } }, { status: 402 }));
  const { POST } = await import("./route");
  expect((await POST(request({ messages: [{ role: "user", content: "x".repeat(801) }] }))).status).toBe(400);
  for (let i = 0; i < 10; i++) {
    const response = await POST(request(question));
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("test-secret");
  }
  expect((await POST(request(question))).status).toBe(429);
  expect(upstream).toHaveBeenCalledTimes(10);
});

it("no presenta una respuesta malformada del modelo como una recomendación válida", async () => {
  upstream.mockResolvedValue(Response.json({ choices: [{ message: { content: "no es JSON" } }] }));
  const { POST } = await import("./route");
  expect((await POST(request(question))).status).toBe(502);
});

it("usa la URL, clave y modelo configurados y omite opciones propias de OpenRouter", async () => {
  vi.stubEnv("ADVISOR_API_URL", "https://api.proveedor.example/v1/chat/completions");
  vi.stubEnv("ADVISOR_API_KEY", "clave-de-pago");
  vi.stubEnv("ADVISOR_MODEL", "modelo-de-pago");
  upstream.mockResolvedValue(Response.json({ choices: [{ message: { content: JSON.stringify({
    text: "¿Qué consultas recibes por WhatsApp?", agentSlugs: [],
  }) } }] }));
  const { POST } = await import("./route");
  expect((await POST(request(question))).status).toBe(200);
  const [url, options] = upstream.mock.calls[0];
  const sent = JSON.parse(options.body);
  expect(url).toBe("https://api.proveedor.example/v1/chat/completions");
  expect(options.headers.Authorization).toBe("Bearer clave-de-pago");
  expect(sent.model).toBe("modelo-de-pago");
  expect(sent).not.toHaveProperty("provider");
});

it("no llama al proveedor si la URL configurada no es https", async () => {
  const { POST } = await import("./route");
  for (const value of ["http://api.proveedor.example/v1/chat/completions", "no es una url"]) {
    vi.stubEnv("ADVISOR_API_URL", value);
    expect((await POST(request(question))).status).toBe(503);
  }
  expect(upstream).not.toHaveBeenCalled();
});
