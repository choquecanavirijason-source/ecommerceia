import Link from "next/link";
import type { AgentCollection } from "@/domain/entities/Agent";

export function AgentCollections({ collections, selectedSlug }: { collections: readonly AgentCollection[]; selectedSlug?: string }) {
  return <section aria-label="Colecciones del equipo" className="py-8">
    <h2 className="text-xl font-bold text-[#EAF2F8]">Colecciones del equipo</h2>
    <p className="mt-2 text-sm text-[#91A7BC]">Selecciones por caso de uso para explorar la demo.</p>
    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {collections.map(collection => <Link key={collection.slug}
        href={`/agentes?coleccion=${collection.slug}`} scroll={selectedSlug === undefined}
        aria-current={selectedSlug === collection.slug ? "true" : undefined}
        className={`rounded-2xl border p-5 transition-colors hover:border-[#42C7E8] ${selectedSlug === collection.slug ? "border-[#42C7E8] bg-[#123352]" : "border-[#1a3353] bg-[#0B1D34]"}`}>
        <h3 className="font-semibold text-[#EAF2F8]">{collection.title}</h3>
        <p className="mt-2 text-sm text-[#91A7BC]">{collection.description}</p>
        <span className="mt-4 block text-xs font-semibold text-[#42C7E8]">{collection.agentSlugs.length} agentes de ejemplo →</span>
      </Link>)}
    </div>
  </section>;
}
