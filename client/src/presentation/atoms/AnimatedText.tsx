"use client";

import { useEffect, useRef, useState, useMemo } from "react";

interface AnimatedTextProps {
  text: string;
  className?: string;
  mode?: "words" | "chars";
  minOpacity?: number;
}

export function AnimatedText({
  text,
  className = "",
  mode = "words",
  minOpacity = 0.2,
}: AnimatedTextProps) {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const [progress, setProgress] = useState(0);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function handleScroll() {
      if (!el) return;

      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }

      rafId.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Rango de progreso: desde el 85% de la pantalla hasta el 25%
        const start = windowHeight * 0.85;
        const end = windowHeight * 0.25;

        const current = rect.top;
        const rawProgress = (start - current) / (start - end);
        const clamped = Math.min(1, Math.max(0, rawProgress));
        setProgress(clamped);
      });
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const tokens = useMemo(
    () => (mode === "words" ? text.split(" ") : text.split("")),
    [text, mode],
  );

  return (
    <p ref={containerRef} className={`leading-relaxed ${className}`}>
      {tokens.map((token, index) => {
        const tokenThreshold = index / tokens.length;
        const isRevealed = progress >= tokenThreshold;
        const opacity = isRevealed ? 1 : minOpacity;

        return (
          <span
            key={index}
            style={{
              opacity: isRevealed ? 1 : 0,
              transition: "opacity 0.2s cubic-bezier(0.2, 0.8, 0.4, 1)",
              color:  "#EAF2F8",
            }}
          >
            {token}
            {mode === "words" ? " " : ""}
          </span>
        );
      })}
    </p>
  );
}
