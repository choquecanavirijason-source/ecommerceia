"use client";

import Link from "next/link";
import { GitCompare, X, Trash2, ArrowRight } from "lucide-react";
import { useCompareStore } from "@/infrastructure/state/compareStore";
import { useHasMounted } from "@/presentation/hooks/useHasMounted";
import { formatPrice } from "@/shared/lib/format";

export function CompareFloatingBar() {
  const mounted = useHasMounted();
  const { items, removeFromCompare, clearCompare } = useCompareStore();

  if (!mounted || items.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-orange-200 p-3 sm:p-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
      <div className="flex items-center justify-between gap-4">
        {/* Left info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-primary shrink-0">
            <GitCompare className="w-5 h-5" />
          </div>
          <div className="hidden sm:block">
            <h4 className="text-sm font-bold text-gray-900 leading-tight">
              Comparador de productos
            </h4>
            <p className="text-xs text-muted-foreground">
              {items.length} de 4 productos seleccionados
            </p>
          </div>
        </div>

        {/* Middle thumbnails */}
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {items.map((item) => (
            <div
              key={item.id}
              className="relative group shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[10px] text-gray-400">Sin img</span>
              )}
              <button
                type="button"
                onClick={() => removeFromCompare(item.id)}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                title="Quitar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {Array.from({ length: Math.max(0, 4 - items.length) }).map((_, idx) => (
            <div
              key={idx}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 shrink-0 text-xs font-bold"
            >
              +
            </div>
          ))}
        </div>

        {/* Right buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={clearCompare}
            title="Limpiar lista"
            className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <Link
            href="/comparar"
            className="flex items-center gap-2 bg-[#FF6A00] hover:bg-[#e65f00] text-white px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            <span>Comparar ({items.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
