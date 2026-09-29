import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function SectionEyebrow({
  icon: Icon,
  children,
  tone = "primary",
  className,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
  tone?: "primary" | "accent";
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2 font-subheading",
        tone === "primary" ? "text-primary" : "text-accent",
        className,
      )}
    >
      <Icon className="w-3.5 h-3.5" /> {children}
    </p>
  );
}
