import { DiagramCard } from "@/presentation/atoms/DiagramCard";
import { IntegrationsDiagram } from "@/presentation/molecules/IntegrationsDiagram";
import { AutonomyDiagram } from "@/presentation/molecules/AutonomyDiagram";
import { autonomyLabels } from "@/presentation/molecules/agentLabels";
import type { Agent } from "@/domain/entities/Agent";

/**
 * Los dos esquemas de la ficha, dibujados con los datos del propio agente.
 *
 * Son ilustrativos: la ficha ya avisa de que integraciones y condiciones
 * están pendientes de definir, así que aquí no se promete nada más. El
 * componente recibe el agente por props y no toca fixtures.
 */
export function AgentDiagrams({ agent }: { agent: Agent }) {
  const herramientas = agent.integrations.join(" y ");

  return (
    <section className="mt-16" aria-labelledby="agent-diagrams-title">
      <h2 id="agent-diagrams-title" className="text-xl font-bold text-[#EAF2F8]">
        Cómo encajaría en tu operación
      </h2>
      <p className="mt-2 text-sm text-[#91A7BC]">Esquemas ilustrativos de este agente de ejemplo.</p>

      <div className="mt-6 grid items-stretch gap-5 lg:grid-cols-2">
        <DiagramCard
          title="Con lo que ya usas"
          description={
            agent.integrations.length > 0
              ? `Pensado para trabajar con ${herramientas}. El agente queda en medio: recibe de un lado y deja el resultado del otro.`
              : "Sin integraciones de ejemplo declaradas en esta ficha."
          }
          caption="esquema · integraciones de ejemplo"
        >
          <IntegrationsDiagram integrations={agent.integrations} />
        </DiagramCard>

        <DiagramCard
          title={`Modalidad: ${autonomyLabels[agent.autonomy]}`}
          description="Las tres modalidades del catálogo cambian dónde entra una persona. La de este agente va resaltada; las otras quedan como referencia."
          caption="esquema · modalidades del catálogo"
        >
          <AutonomyDiagram active={agent.autonomy} />
        </DiagramCard>
      </div>
    </section>
  );
}
