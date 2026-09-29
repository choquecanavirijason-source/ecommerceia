import type { Post } from "@/domain/entities/Post";
import type { PostRepository } from "@/domain/repositories/PostRepository";

export class GetPostBySlugUseCase {
  constructor(private readonly postRepo: PostRepository) {}

  async execute(slug: string): Promise<Post | null> {
    return this.postRepo.getBySlug(slug);
  }
}
