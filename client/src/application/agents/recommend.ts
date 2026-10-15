import type { Agent } from "@/domain/entities/Agent";

/**
 * Mapa de necesidades cotidianas a términos de búsqueda del catálogo.
 * Solo devuelve resultados cuando una intención conocida coincide.
 * Sin modelo de lenguaje: mapeo explícito sobre tags, integraciones y categorías.
 */

interface RecommendResult {
  items: Agent[];
  query: string;
  total: number;
}

const normalize = (text: string) =>
  text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

/**
 * Intenciones conocidas: cada entrada mapea patrones del usuario
 * a un query de búsqueda que filtra sobre los campos del agente.
 * Los patrones se evalúan como "todas las palabras deben aparecer en la entrada".
 */
const knownIntents: { patterns: string[][]; query: string; filter?: (agent: Agent) => boolean }[] = [
  { patterns: [["whatsapp", "consulta"], ["whatsapp", "responder"], ["whatsapp", "atencion"], ["whatsapp", "soporte"], ["whatsapp", "cliente"]], query: "atencion whatsapp", filter: a => a.integrations.includes("WhatsApp") && a.tags.some(t => ["atención", "soporte", "clientes"].includes(t)) },
  { patterns: [["venta", "automatizar"], ["ventas", "funnel"], ["leads", "captar"], ["ventas", "crm"], ["venta", "cerrar"]], query: "ventas crm", filter: a => a.cat === "Sales" },
  { patterns: [["soporte", "24"], ["atencion", "cliente"], ["soporte", "automatico"]], query: "soporte clientes", filter: a => a.tags.some(t => ["atención", "soporte", "clientes"].includes(t)) },
  { patterns: [["dato", "analisis"], ["dato", "reporte"], ["dato", "extraer"], ["analisis", "datos"]], query: "datos analisis", filter: a => a.cat === "Analytics" },
  { patterns: [["contenido", "marketing"], ["redaccion", "campana"], ["contenido", "generar"], ["copy", "escribir"]], query: "contenido campanas", filter: a => a.cat === "Marketing" },
  { patterns: [["codigo", "programar"], ["programacion", "asistir"], ["desarrollo", "codigo"], ["code", "review"]], query: "codigo desarrollo", filter: a => a.cat === "Development" },
  { patterns: [["seleccion", "candidato"], ["recurso", "humano"], ["reclutamiento", "filtrar"], ["cv", "analizar"]], query: "seleccion candidatos", filter: a => a.cat === "HR" },
  { patterns: [["contabilidad", "automatizar"], ["finanzas", "reporte"], ["factura", "control"]], query: "contabilidad finanzas", filter: a => a.cat === "Finance" },
  { patterns: [["diseno", "interfaz"], ["ui", "generar"], ["diseno", "grafico"]], query: "diseno interfaces", filter: a => a.cat === "Design" },
  { patterns: [["investigar", "resumir"], ["investigacion", "contenido"], ["web", "scraping"]], query: "investigacion resumenes", filter: a => a.cat === "Research" },
  { patterns: [["seguridad", "monitoreo"], ["infraestructura", "alerta"], ["seguridad", "anomalia"]], query: "seguridad monitoreo", filter: a => a.cat === "IT" },
  { patterns: [["slack"]], query: "integracion slack", filter: a => a.integrations.includes("Slack") },
  { patterns: [["notion", "documentar"], ["notion", "organizar"]], query: "integracion notion", filter: a => a.integrations.includes("Notion") },
  { patterns: [["google", "sheet"], ["spreadsheet", "automatizar"]], query: "google sheets automatizar", filter: a => a.integrations.includes("Google Sheets") },
];

const MAX_SUGGESTIONS = 3;

export function recommendAgents(source: readonly Agent[], userInput: string): RecommendResult {
  const input = normalize(userInput);
  if (!input) return { items: [], query: "", total: 0 };

  // Buscar la primera intención que coincida
  for (const intent of knownIntents) {
    const matched = intent.patterns.some(pattern =>
      pattern.every(word => input.includes(word)),
    );
    if (matched) {
      const filtered = intent.filter
        ? source.filter(intent.filter)
        : source;
      return {
        items: filtered.slice(0, MAX_SUGGESTIONS),
        query: intent.query,
        total: filtered.length,
      };
    }
  }

  return { items: [], query: "", total: 0 };
}
