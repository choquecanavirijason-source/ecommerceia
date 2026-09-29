import { cn } from "@/shared/lib/utils";

export function ProductStatusBadge({ badge, className }: { badge: string; className?: string }) {
  const isNew = badge.toLowerCase() === "nuevo";
  const isPopular = badge.toLowerCase() === "popular";

  return (
    <span
      className={cn(
        "text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-xs font-subheading",
        isNew
          ? "bg-[#18D6D1] text-[#151515]"
          : isPopular
          ? "bg-[#FF6A00] text-white"
          : "bg-primary text-primary-foreground",
        className,
      )}
    >
      {badge}
    </span>
  );
}

export function DiscountBadge({ percent, className }: { percent: number; className?: string }) {
  if (percent <= 0) return null;
  return (
    <span
      className={cn(
        "text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FF6A00]/10 text-[#FF6A00] font-subheading",
        className
      )}
    >
      -{percent}%
    </span>
  );
}
