"use client";

import { useQuery } from "@tanstack/react-query";
import { container } from "@/infrastructure/container";
import type { ListPostsParams } from "@/domain/repositories/PostRepository";

export function usePosts(params?: ListPostsParams) {
  return useQuery({
    queryKey: ["posts", params?.category ?? "", params?.limit ?? 0],
    queryFn: () => container.listPosts.execute(params),
  });
}

export function usePost(slug: string) {
  return useQuery({
    queryKey: ["post", slug],
    queryFn: () => container.getPostBySlug.execute(slug),
    enabled: !!slug,
  });
}
