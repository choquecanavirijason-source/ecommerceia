import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/domain/entities/Product";

interface CompareState {
  items: Product[];
  addToCompare: (product: Product) => boolean;
  removeFromCompare: (productId: number) => void;
  clearCompare: () => void;
  isInCompare: (productId: number) => boolean;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      addToCompare: (product) => {
        const current = get().items;
        if (current.some((p) => p.id === product.id)) {
          return true;
        }
        if (current.length >= 4) {
          return false;
        }
        set({ items: [...current, product] });
        return true;
      },
      removeFromCompare: (productId) => {
        set({ items: get().items.filter((p) => p.id !== productId) });
      },
      clearCompare: () => {
        set({ items: [] });
      },
      isInCompare: (productId) => {
        return get().items.some((p) => p.id === productId);
      },
    }),
    { name: "unocompras-compare" },
  ),
);
