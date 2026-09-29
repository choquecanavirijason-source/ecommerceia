import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { agents, findAgent } from "@/demo/agents";

export const dynamicParams = false;

export function generateStaticParams() {
  return agents.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const agent = findAgent((await params).slug);
  return { title: agent ? `${agent.name} | Demo de agentes` : "Agente no encontrado" };
}

export default async function AgentPage({ params }: { params: Promise<{ slug: string }> }) {
  const agent = findAgent((await params).slug);
  if (!agent) notFound();

  return <section className="mx-auto max-w-6xl px-4 py-12 sm:py-20">
    <Link href="/agentes" className="text-sm text-[#42C7E8]">← Volver al catálogo</Link>
    <div className="mt-8 grid items-center gap-10 md:grid-cols-2">
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-[#1a3353] bg-[#0B1D34]">
        <Image src={agent.img} alt={agent.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
      </div>
      <div>
        <p className="text-sm font-bold uppercase tracking-widest text-[#42C7E8]">{agent.cat}</p>
        <h1 className="mt-3 text-4xl font-black sm:text-5xl">{agent.name}</h1>
        <p className="mt-5 text-lg text-[#91A7BC]">{agent.desc}</p>
        <div className="my-8 rounded-2xl border border-[#1a3353] bg-[#0B1D34] p-5 text-sm text-[#91A7BC]">
          Agente de ejemplo para explorar la demo. Las capacidades, integraciones, requisitos y condiciones comerciales están pendientes de definir.
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/solicitar-demo?agente=${agent.slug}`} className="rounded-full bg-[#287FF0] px-6 py-3 font-bold text-white hover:bg-[#287FF0]/80">Solicitar demo</Link>
          <Link href={`/solicitar-cotizacion?agente=${agent.slug}`} className="rounded-full border border-[#42C7E8] px-6 py-3 font-bold text-[#42C7E8] hover:bg-[#42C7E8]/10">Solicitar cotización</Link>
        </div>
      </div>
    </div>
  </section>;
}
