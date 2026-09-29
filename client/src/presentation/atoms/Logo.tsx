import Image from "next/image";
import logoHorizontal from "@/shared/assets/unocompras-horizontal.webp";
import logoPrincipal from "@/shared/assets/unocompras-principal.webp";
import logoIsotipo from "@/shared/assets/unocompras-isotipo.webp";
import { cn } from "@/shared/lib/utils";

export interface LogoProps {
  variant?: "horizontal" | "principal" | "isotipo" | "responsive" | "light" | "dark";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  imageClassName?: string;
  showTagline?: boolean;
  responsive?: boolean;
}

export function Logo({
  variant = "horizontal",
  size = "md",
  className,
  imageClassName,
  showTagline = false,
  responsive = false,
}: LogoProps) {
  const isDark = variant === "dark";
  const isResponsive = variant === "responsive" || responsive;
  const isIsotipo = variant === "isotipo";
  const isPrincipal = variant === "principal";

  const heightClasses = {
    sm: "h-7",
    md: "h-9",
    lg: "h-12",
    xl: "h-16",
  }[size] || "h-9";

  if (isResponsive) {
    return (
      <span className={cn("inline-flex items-center gap-2 select-none", className)}>
        <span
          className={cn(
            "relative flex items-center justify-center transition-transform hover:scale-[1.02]",
            isDark && "bg-white px-2.5 py-1 rounded-xl shadow-sm"
          )}
        >
          {/* Móvil (< 640px): Isotipo */}
          <Image
            src={logoIsotipo}
            alt="UNO COMPRAS"
            priority
            className="w-auto object-contain block sm:hidden h-10 w-10"
          />

          {/* Tablet / Pantallas intermedias (640px a 1023px): Logotipo principal */}
          <Image
            src={logoPrincipal}
            alt="UNO COMPRAS"
            priority
            className="w-auto object-contain hidden sm:block lg:hidden h-12 md:h-14 w-auto"
          />

          {/* Escritorio (>= 1024px): Logotipo horizontal */}
          <Image
            src={logoHorizontal}
            alt="UNO COMPRAS"
            priority
            className={cn(
              "w-auto object-contain hidden lg:block",
              heightClasses || "h-9",
              imageClassName
            )}
          />
        </span>
        {showTagline && (
          <span
            className={cn(
              "text-[10px] tracking-widest uppercase font-semibold text-[#FF6A00] mt-0.5 hidden lg:inline-block",
              isDark && "text-[#FF8533]"
            )}
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Comprá fácil
          </span>
        )}
      </span>
    );
  }

  const selectedAsset = isIsotipo
    ? logoIsotipo
    : isPrincipal
      ? logoPrincipal
      : logoHorizontal;

  return (
    <span className={cn("inline-flex items-center gap-2 select-none", className)}>
      <span
        className={cn(
          "relative flex items-center justify-center transition-transform hover:scale-[1.02]",
          isDark && "bg-white px-2.5 py-1 rounded-xl shadow-sm"
        )}
      >
        <Image
          src={selectedAsset}
          alt="UNO COMPRAS"
          priority
          className={cn("w-auto object-contain", heightClasses, imageClassName)}
        />
      </span>
      {showTagline && !isIsotipo && (
        <span
          className={cn(
            "text-[10px] tracking-widest uppercase font-semibold text-[#FF6A00] mt-0.5",
            isDark && "text-[#FF8533]"
          )}
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Comprá fácil
        </span>
      )}
    </span>
  );
}


