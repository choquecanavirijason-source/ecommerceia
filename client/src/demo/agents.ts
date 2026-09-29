import type { Agent } from "@/domain/entities/Agent";

// Datos de muestra del usuario: no representan disponibilidad comercial.
export const agents: readonly Agent[] = [
  { id: 1, name: "SalesBot Pro", desc: "Automate your sales funnel with AI.", img: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=400&h=400&fit=crop", cat: "Sales" },
  { id: 2, name: "Support Genius", desc: "24/7 customer support agent.", img: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=400&fit=crop", cat: "Support" },
  { id: 3, name: "Data Miner X", desc: "Extract insights from big data instantly.", img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=400&fit=crop", cat: "Analytics" },
  { id: 4, name: "Copywriter AI", desc: "Generate marketing copy that converts.", img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=400&fit=crop", cat: "Marketing" },
  { id: 5, name: "Code Assistant", desc: "Your pair programming companion.", img: "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400&h=400&fit=crop", cat: "Development" },
  { id: 6, name: "HR Screener", desc: "Automated candidate screening.", img: "https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=400&h=400&fit=crop", cat: "HR" },
  { id: 7, name: "Finance Guru", desc: "Automated bookkeeping and analysis.", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop", cat: "Finance" },
  { id: 8, name: "Design Crafter", desc: "Generate UI layouts and graphics.", img: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=400&fit=crop", cat: "Design" },
  { id: 9, name: "Research Assistant", desc: "Scrape and summarize the web.", img: "https://images.unsplash.com/photo-1495055154266-57bbdeada43e?w=400&h=400&fit=crop", cat: "Research" },
  { id: 10, name: "Security Watcher", desc: "Monitor infrastructure for anomalies.", img: "https://images.unsplash.com/photo-1555949963-aa79dcee57d5?w=400&h=400&fit=crop", cat: "IT" }
].map(agent => ({
  ...agent,
  slug: agent.name.toLowerCase().replace(/\s+/g, "-"),
}));

export const agentCategories = [...new Set(agents.map(agent => agent.cat))].map(name => ({
  name,
  count: agents.filter(agent => agent.cat === name).length,
}));

export function filterAgents(query = "", category = "Todos") {
  const search = query.trim().toLowerCase();
  return agents.filter(agent =>
    (category === "Todos" || agent.cat === category) &&
    `${agent.name} ${agent.desc} ${agent.cat}`.toLowerCase().includes(search),
  );
}

export function findAgent(slug: string) {
  return agents.find(agent => agent.slug === slug);
}
