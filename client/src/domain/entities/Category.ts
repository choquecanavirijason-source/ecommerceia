import type { ComponentType } from "react";

export type CategoryIconComponent = ComponentType<{
  className?: string;
  strokeWidth?: number;
}>;

export interface Category {
  id?: number;
  slug?: string;
  name: string;
  icon: CategoryIconComponent;
  iconName?: string;
  count: number;
  color: string;
}
