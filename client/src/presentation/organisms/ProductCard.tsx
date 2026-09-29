"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  Eye,
  GitCompare,
  Heart,
  ShoppingCart,
} from "lucide-react";
import type { Product } from "@/domain/entities/Product";
import { ProductStatusBadge } from "@/presentation/atoms/ProductStatusBadge";
import { StarRating } from "@/presentation/molecules/StarRating";
import { ProductPriceBlock } from "@/presentation/molecules/ProductPriceBlock";
import { useFavorites } from "@/presentation/hooks/useFavorites";
import { useCompareStore } from "@/infrastructure/state/compareStore";
import { useHasMounted } from "@/presentation/hooks/useHasMounted";
import { cn } from "@/shared/lib/utils";

const ORANGE = "#FF6A00";

function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden bg-neutral-200/60 ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
    </div>
  );
}

function LoadableImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && <Shimmer />}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
        onLoad={() => setLoaded(true)}
        className={cn(
          className,
          "transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0",
        )}
      />
    </>
  );
}

export function ProductCard({
  product,
  onAddToCart,
  onSelect,
}: {
  product: Product;
  onAddToCart: (product: Product) => void;
  onSelect: (product: Product) => void;
}) {
  const [added, setAdded] = useState(false);
  const mounted = useHasMounted();
  const { isFavorite, toggleFavorite } = useFavorites();
  const wished = mounted && isFavorite(product.id);
  const { addToCompare, removeFromCompare, isInCompare } = useCompareStore();
  const inCompare = mounted && isInCompare(product.id);

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) *
        100,
      )
      : null;

  return (
    <article className="group relative flex flex-col bg-card rounded-2xl overflow-hidden border border-border hover:border-orange-200 hover:shadow-xl hover:shadow-orange-100/60 transition-all duration-300 hover:-translate-y-1">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
        {product.isFlashDeal ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#FF6A00] text-white px-2.5 py-1 text-[10px] sm:text-[11px] font-bold shadow-sm font-subheading">
            ⚡ Flash
          </span>
        ) : product.badge ? (
          <ProductStatusBadge badge={product.badge} />
        ) : product.isFeatured ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 text-white px-2.5 py-1 text-[10px] sm:text-[11px] font-bold shadow-sm font-subheading">
            ⭐ Destacado
          </span>
        ) : null}

        {discount !== null && (
          <span className="inline-flex items-center rounded-full bg-red-500 text-white px-2.5 py-1 text-[10px] sm:text-[11px] font-bold shadow-sm font-subheading">
            -{discount}%
          </span>
        )}
      </div>

      {/* Acciones flotantes */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
        <button
          type="button"
          title={inCompare ? "Quitar de comparar" : "Agregar a comparar"}
          aria-label={inCompare ? "Quitar de comparar" : "Agregar a comparar"}
          aria-pressed={inCompare}
          onClick={(e) => {
            e.stopPropagation();
            if (inCompare) removeFromCompare(product.id);
            else addToCompare(product);
          }}
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center shadow-sm backdrop-blur transition-all",
            "bg-white/95 hover:bg-orange-50",
            inCompare
              ? "opacity-100 text-primary ring-1 ring-primary/30"
              : "opacity-0 group-hover:opacity-100 text-gray-500 hover:text-primary",
          )}
        >
          <GitCompare className="w-4 h-4" />
        </button>

        <button
          type="button"
          aria-label={wished ? "Quitar de favoritos" : "Agregar a favoritos"}
          aria-pressed={wished}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product);
          }}
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center shadow-sm backdrop-blur transition-all",
            "bg-white/95 hover:bg-red-50",
            wished
              ? "opacity-100 ring-1 ring-red-200"
              : "opacity-0 group-hover:opacity-100",
          )}
        >
          <Heart
            className={cn(
              "w-4 h-4 transition-colors",
              wished ? "fill-red-500 text-red-500" : "text-gray-500",
            )}
          />
        </button>
      </div>

      {/* Imagen */}
      <div
        className="relative overflow-hidden bg-secondary aspect-square cursor-pointer"
        onClick={() => onSelect(product)}
      >
        {product.image ? (
          <LoadableImage
            src={product.image}
            alt={product.name}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs font-medium">
            Sin imagen
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="bg-white/95 backdrop-blur text-foreground text-xs font-semibold px-4 py-2 rounded-full shadow-md flex items-center gap-1.5 hover:bg-primary hover:text-white transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Vista rápida
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 font-medium">
          {product.category}
        </p>

        <h3
          onClick={() => onSelect(product)}
          className="font-semibold text-sm sm:text-[15px] text-foreground leading-snug mb-2 line-clamp-2 min-h-[2.5rem] cursor-pointer hover:text-primary transition-colors"
        >
          {product.name}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={product.rating} small />
          <span className="text-xs text-muted-foreground">
            ({product.reviews})
          </span>
        </div>

        {product.weight && (
          <p className="text-xs text-muted-foreground mb-2">{product.weight}</p>
        )}

        <div className="mt-auto">
          <ProductPriceBlock
            price={product.price}
            originalPrice={product.originalPrice}
          />

          <button
            type="button"
            onClick={() => {
              onAddToCart(product);
              setAdded(true);
              setTimeout(() => setAdded(false), 1500);
            }}
            aria-live="polite"
            className={cn(
              "w-full mt-3 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm",
              added
                ? "bg-emerald-500 text-white"
                : "text-white hover:scale-[1.02] active:scale-[0.98]",
            )}
            style={{
              fontFamily: "'Montserrat', sans-serif",
              backgroundColor: added ? undefined : ORANGE,
            }}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" /> ¡Sumado!
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                Sumalo al carrito
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </article>
  );
}