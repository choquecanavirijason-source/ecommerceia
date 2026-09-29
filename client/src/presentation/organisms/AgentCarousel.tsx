"use client";

import type { Agent } from "@/domain/entities/Agent";
import { useId, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useCarouselAutoplay } from "@/presentation/hooks/useCarouselAutoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/presentation/atoms/carousel";
import { AgentCard } from "@/presentation/molecules/AgentCard";

const controlClassName = "static size-11 translate-x-0 translate-y-0 border-[#42C7E8]/40 bg-[#05080C] text-[#42C7E8] hover:bg-[#42C7E8]/10 hover:text-[#42C7E8] disabled:opacity-30";

/** Recibe datos del padre: reutilizable con fixtures o con un futuro repositorio. */
export function AgentCarousel({ agents }: { agents: readonly Agent[] }) {
  if (agents.length === 0) return null;
  return <AgentCarouselContent key={agents.map(agent => agent.id).join(",")} agents={agents} />;
}

function AgentCarouselContent({ agents }: { agents: readonly Agent[] }) {
  const [api, setApi] = useState<CarouselApi>();
  const id = useId();
  const autoplay = useCarouselAutoplay(api);

  return (
    <div onMouseEnter={() => autoplay.setHovered(true)} onMouseLeave={() => autoplay.setHovered(false)}>
      {agents.length > 1 && <div className="mb-3 flex justify-end">
        <button type="button" aria-controls={id} onClick={autoplay.toggle} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#1a3353] px-4 py-2 text-xs text-[#91A7BC] hover:border-[#42C7E8] hover:text-[#42C7E8]">
          {autoplay.playing ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
          {autoplay.playing ? "Pausar movimiento" : "Reanudar movimiento"}
        </button>
      </div>}
    <Carousel
      id={id}
      setApi={setApi}
      onFocusCapture={autoplay.pause}
      aria-label="Agentes disponibles"
      aria-roledescription="carrusel"
      tabIndex={0}
      opts={{
        align: "start",
        slidesToScroll: 1,
        loop: true,
        breakpoints: { "(prefers-reduced-motion: reduce)": { duration: 0 } },
      }}
      className="rounded-2xl focus-visible:outline-2 focus-visible:outline-[#42C7E8] focus-visible:outline-offset-4"
    >
      <CarouselContent className="-ml-6 touch-pan-y touch-pinch-zoom py-3">
        {agents.map((agent, index) => (
          <CarouselItem
            key={agent.id}
            aria-roledescription="diapositiva"
            aria-label={`${index + 1} de ${agents.length}: ${agent.name}`}
            className="basis-[85%] pl-6 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
          >
            <AgentCard agent={agent} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs text-[#91A7BC]">Desliza o utiliza las flechas para explorar.</p>
        <div className="flex gap-2">
          <CarouselPrevious type="button" aria-label="Agentes anteriores" className={controlClassName} />
          <CarouselNext type="button" aria-label="Agentes siguientes" className={controlClassName} />
        </div>
      </div>
    </Carousel>
    </div>
  );
}
