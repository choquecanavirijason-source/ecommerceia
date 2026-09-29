import type { Post } from "@/domain/entities/Post";

export interface ListPostsParams {
  category?: string;
  limit?: number;
  all?: boolean;
}

export interface PostRepository {
  list(params?: ListPostsParams): Promise<Post[]>;
  getBySlug(slug: string): Promise<Post | null>;
}
