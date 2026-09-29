"use client";

import { useQuery } from "@tanstack/react-query";
import { container } from "@/infrastructure/container";
import type { Product } from "@/domain/entities/Product";

export function useProducts(category?: string, search?: string) {
  return useQuery({
    queryKey: ["products", category ?? "All", search ?? ""],
    queryFn: () => container.listProducts.execute({ category, search }),
  });
}

export function useFlashDeals() {
  return useQuery({
    queryKey: ["flash-deals"],
    queryFn: () => container.listFlashDeals.execute(),
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => container.getProductById.execute(id),
  });
}

export function useRelatedProducts(product: Product) {
  return useQuery({
    queryKey: ["related-products", product.id, product.category],
    queryFn: () => container.listRelatedProducts.execute(product),
  });
}
