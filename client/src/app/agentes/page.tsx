import { Suspense } from "react";
import { AgentCatalogue } from "@/presentation/organisms/AgentCatalogue";

export const metadata = { title: "Catálogo de agentes | Demo" };

export default function AgentsPage() {
  return <Suspense fallback={<p role="status" className="p-12 text-center">Cargando catálogo…</p>}><AgentCatalogue /></Suspense>;
}
