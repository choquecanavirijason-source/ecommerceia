import { defaultDiscoveryFilters, discoverAgents } from "@/application/agents/discovery";
import type { Agent, AgentCollection } from "@/domain/entities/Agent";

// Datos de muestra: precios, autonomía e integraciones son ilustrativos, sin conexiones ni cobros.
export const agents: readonly Agent[] = [
  { id: 1, slug: "salesbot-pro", tags: ["ventas", "leads", "crm"], industries: ["Comercio", "Servicios"], integrations: ["HubSpot", "Slack"], autonomy: "assisted", pricing: { model: "monthly" }, name: "SalesBot Pro", desc: "Automate your sales funnel with AI.", img: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=400&h=400&fit=crop", cat: "Sales" },
  { id: 2, slug: "support-genius", tags: ["atención", "soporte", "clientes"], industries: ["Comercio", "Servicios"], integrations: ["WhatsApp", "Slack"], autonomy: "supervised", pricing: { model: "monthly" }, name: "Support Genius", desc: "24/7 customer support agent.", img: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=400&fit=crop", cat: "Support" },
  { id: 3, slug: "data-miner-x", tags: ["datos", "análisis", "reportes"], industries: ["Tecnología", "Finanzas"], integrations: ["Google Sheets", "API"], autonomy: "assisted", pricing: { model: "usage" }, name: "Data Miner X", desc: "Extract insights from big data instantly.", img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=400&fit=crop", cat: "Analytics" },
  { id: 4, slug: "copywriter-ai", tags: ["contenido", "redacción", "campañas"], industries: ["Comercio", "Servicios"], integrations: ["Notion"], autonomy: "assisted", pricing: { model: "free" }, name: "Copywriter AI", desc: "Generate marketing copy that converts.", img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=400&fit=crop", cat: "Marketing" },
  { id: 5, slug: "code-assistant", tags: ["código", "programación", "desarrollo"], industries: ["Tecnología"], integrations: ["GitHub", "MCP"], autonomy: "assisted", pricing: { model: "monthly" }, name: "Code Assistant", desc: "Your pair programming companion.", img: "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400&h=400&fit=crop", cat: "Development" },
  { id: 6, slug: "hr-screener", tags: ["selección", "candidatos", "recursos humanos"], industries: ["Servicios", "Tecnología"], integrations: ["Google Sheets", "Slack"], autonomy: "supervised", pricing: { model: "quote" }, name: "HR Screener", desc: "Automated candidate screening.", img: "https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=400&h=400&fit=crop", cat: "HR" },
  { id: 7, slug: "finance-guru", tags: ["contabilidad", "finanzas", "reportes"], industries: ["Finanzas", "Comercio"], integrations: ["Google Sheets"], autonomy: "supervised", pricing: { model: "quote" }, name: "Finance Guru", desc: "Automated bookkeeping and analysis.", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop", cat: "Finance" },
  { id: 8, slug: "design-crafter", tags: ["diseño", "interfaces", "gráficos"], industries: ["Tecnología", "Servicios"], integrations: ["Figma"], autonomy: "assisted", pricing: { model: "usage" }, name: "Design Crafter", desc: "Generate UI layouts and graphics.", img: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=400&fit=crop", cat: "Design" },
  { id: 9, slug: "research-assistant", tags: ["investigación", "resúmenes", "contenido"], industries: ["Educación", "Servicios"], integrations: ["Notion", "API"], autonomy: "assisted", pricing: { model: "free" }, name: "Research Assistant", desc: "Scrape and summarize the web.", img: "https://images.unsplash.com/photo-1495055154266-57bbdeada43e?w=400&h=400&fit=crop", cat: "Research" },
  { id: 10, slug: "security-watcher", tags: ["seguridad", "monitoreo", "alertas"], industries: ["Tecnología"], integrations: ["Slack", "API"], autonomy: "autonomous", pricing: { model: "monthly" }, name: "Security Watcher", desc: "Monitor infrastructure for anomalies.", img: "https://images.unsplash.com/photo-1555949963-aa79dcee57d5?w=400&h=400&fit=crop", cat: "IT" }
];

export const agentCategories = [...new Set(agents.map(agent => agent.cat))].map(name => ({
  name,
  count: agents.filter(agent => agent.cat === name).length,
}));

export function filterAgents(query = "", category = "Todos") {
  return discoverAgents(agents, agentCollections, {
    ...defaultDiscoveryFilters, query, category: category === "Todos" ? "" : category,
  }, agents.length).items;
}

export function findAgent(slug: string) {
  return agents.find(agent => agent.slug === slug);
}

export const agentCollections: readonly AgentCollection[] = [
  { slug: "ventas-atencion", title: "Ventas y atención", description: "Acompaña a tus clientes, desde el primer contacto hasta el soporte.", agentSlugs: ["salesbot-pro", "support-genius"] },
  { slug: "marketing-contenido", title: "Ideas que conectan", description: "Explora ejemplos para investigar, escribir y diseñar.", agentSlugs: ["copywriter-ai", "design-crafter", "research-assistant"] },
  { slug: "operaciones", title: "Operaciones del equipo", description: "Descubre propuestas para datos, talento, finanzas y monitoreo.", agentSlugs: ["data-miner-x", "hr-screener", "finance-guru", "security-watcher"] },
  { slug: "para-empezar", title: "Para empezar", description: "Una selección del equipo para conocer el catálogo de demo.", agentSlugs: ["support-genius", "copywriter-ai", "research-assistant"] },
];
