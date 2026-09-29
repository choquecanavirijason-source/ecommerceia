"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { container } from "@/infrastructure/container";
import type { AdminListOrdersParams, CreateOrderInput } from "@/domain/repositories/OrderRepository";
import type { OrderStatus } from "@/domain/entities/Order";

export function useMyOrders() {
  const query = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => container.listMyOrders.execute(),
  });

  return {
    orders: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: CreateOrderInput) => container.createOrder.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
  });

  return {
    createOrder: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
  };
}

export function useAdminOrders(params?: AdminListOrdersParams) {
  const query = useQuery({
    queryKey: ["admin-orders", params],
    queryFn: () => container.adminListOrders.execute(params),
  });

  const queryClient = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: ({ id, status: next }: { id: number; status: OrderStatus }) =>
      container.adminUpdateOrderStatus.execute(id, next),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    updateStatus: updateStatus.mutateAsync,
    isUpdating: updateStatus.isPending,
  };
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => container.getAdminStats.execute(),
  });
}