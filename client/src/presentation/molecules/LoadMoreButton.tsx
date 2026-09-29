"use client";

import { ArrowRight, Loader2 } from "lucide-react";

export function LoadMoreButton({
  hasMore,
  isLoading,
  onLoadMore,
}: {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}) {
  if (!hasMore) return null;

  return (
    <div className="flex justify-center mt-8">
      <button
        type="button"
        onClick={onLoadMore}
        disabled={isLoading}
        className="inline-flex items-center gap-2 border-2 border-[#18D6D1] text-[#00a6a0] font-subheading font-medium px-8 py-3 rounded-full hover:bg-[#18D6D1]/10 transition-all duration-200 disabled:opacity-60 disabled:cursor-wait shadow-sm text-sm"
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {isLoading ? "Cargando…" : "Ver más productos"}
        {!isLoading && <ArrowRight className="w-4 h-4" />}
      </button>
    </div>
  );
}