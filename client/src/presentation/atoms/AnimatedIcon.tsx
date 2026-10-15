import type { LucideIcon } from "lucide-react";
import styles from "./AnimatedIcon.module.css";

export interface AnimatedIconProps {
  icon: LucideIcon;
  motion?: "lift" | "wave" | "pulse" | "scan" | "draw" | "bars";
  size?: number;
}

/** The enclosing link/button opts in with data-icon-trigger; no timers or listeners. */
export function AnimatedIcon({ icon: Icon, motion = "pulse", size = 20 }: AnimatedIconProps) {
  return <span className={styles.icon} data-motion={motion} aria-hidden="true">
    <Icon size={size} focusable="false" />
  </span>;
}
