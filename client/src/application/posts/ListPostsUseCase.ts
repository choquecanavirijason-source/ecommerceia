import type { Post } from "@/domain/entities/Post";
import type { ListPostsParams, PostRepository } from "@/domain/repositories/PostRepository";

export class ListPostsUseCase {
  constructor(private readonly postRepo: PostRepository) {}

  async execute(params?: ListPostsParams): Promise<Post[]> {
    return this.postRepo.list(params);
  }
}
