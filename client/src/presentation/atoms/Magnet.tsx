"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface MagnetProps {
  children: ReactNode;
  strength?: number;
  padding?: number;
  className?: string;
  activeTransition?: string;
  inactiveTransition?: string;
}

export function Magnet({
  children,
  strength = 3.5,
  padding = 120,
  className = "",
  activeTransition = "transform 0.25s cubic-bezier(0.25, 1, 0.5, 1)",
  inactiveTransition = "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
}: MagnetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    // Evitar añadir listeners en dispositivos táctiles sin hover
    if (typeof window === "undefined" || !window.matchMedia("(hover: hover)").matches) {
      return;
    }

    const el = ref.current;
    if (!el) return;

    function handleMouseMove(e: MouseEvent) {
      if (!el) return;

      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }

      rafId.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const distX = e.clientX - centerX;
        const distY = e.clientY - centerY;
        const distance = Math.hypot(distX, distY);

        const maxDist = Math.max(rect.width, rect.height) / 2 + padding;

        if (distance < maxDist) {
          setIsHovered(true);
          const pullFactor = 1 - distance / maxDist;
          setPosition({
            x: (distX / strength) * pullFactor,
            y: (distY / strength) * pullFactor,
          });
        } else if (isHovered) {
          setIsHovered(false);
          setPosition({ x: 0, y: 0 });
        }
      });
    }

    function handleMouseLeave() {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
      setIsHovered(false);
      setPosition({ x: 0, y: 0 });
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("blur", handleMouseLeave);

    return () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("blur", handleMouseLeave);
    };
  }, [strength, padding, isHovered]);

  return (
    <div
      ref={ref}
      className={`inline-block ${className}`}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        transition: isHovered ? activeTransition : inactiveTransition,
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}
