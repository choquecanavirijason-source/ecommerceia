"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { container } from "@/infrastructure/container";
import type { AdminListCategoriesParams } from "@/domain/repositories/CategoryRepository";

export function useAdminCategories(params?: AdminListCategoriesParams) {
  const query = useQuery({
    queryKey: ["admin-categories", params],
    queryFn: () => container.adminListCategories.execute(params),
  });

  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  const create = useMutation({
    mutationFn: ({ name, icon }: { name: string; icon?: string }) => container.createCategory.execute(name, icon),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, name, icon }: { id: number; name: string; icon?: string }) => container.updateCategory.execute(id, name, icon),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => container.deleteCategory.execute(id),
    onSuccess: invalidate,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
    create: create.mutateAsync,
    isCreating: create.isPending,
    update: update.mutateAsync,
    isUpdating: update.isPending,
    remove: remove.mutateAsync,
    isRemoving: remove.isPending,
  };
}