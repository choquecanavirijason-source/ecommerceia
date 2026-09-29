"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { container } from "@/infrastructure/container";

export function useInfiniteProducts({
  category,
  search,
  tag,
  isFeatured,
  isFlashDeal,
  pageSize = 12,
  startPage = 1,
  enabled = true,
}: {
  category?: string;
  search?: string;
  tag?: string;
  isFeatured?: boolean;
  isFlashDeal?: boolean;
  pageSize?: number;
  startPage?: number;
  enabled?: boolean;
}) {
  return useInfiniteQuery({
    queryKey: [
      "infinite-products",
      category ?? "",
      search ?? "",
      tag ?? "",
      isFeatured,
      isFlashDeal,
      pageSize,
    ],
    queryFn: ({ pageParam }) =>
      container.paginateProducts.execute({
        category,
        search,
        tag,
        isFeatured,
        isFlashDeal,
        page: pageParam,
        limit: pageSize,
      }),
    initialPageParam: startPage,
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.lastPage ? lastPage.currentPage + 1 : undefined,
    enabled,
  });
}