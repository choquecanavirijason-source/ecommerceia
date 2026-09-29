"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { container } from "@/infrastructure/container";
import type { AdminListProductsParams } from "@/domain/repositories/ProductRepository";

export function useAdminProducts(params?: AdminListProductsParams) {
  const query = useQuery({
    queryKey: [
      "admin-products",
      params?.search ?? "",
      params?.category ?? "",
      params?.isActive ?? "",
      params?.isFeatured ?? "",
      params?.isFlashDeal ?? "",
      params?.page ?? 1,
      params?.sort ?? "",
      params?.direction ?? "",
    ],
    queryFn: () => container.adminListProducts.execute(params),
    placeholderData: keepPreviousData,
  });

  const queryClient = useQueryClient();

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      container.toggleProductActive.execute(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => container.deleteProduct.execute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
    toggleActive: toggleActive.mutateAsync,
    isToggling: toggleActive.isPending,
    remove: remove.mutateAsync,
    isRemoving: remove.isPending,
  };
}