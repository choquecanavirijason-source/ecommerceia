import { apiRequest } from "@/infrastructure/http/client";
import type { Post } from "@/domain/entities/Post";
import type { ListPostsParams, PostRepository } from "@/domain/repositories/PostRepository";
import { blogPostsData } from "@/infrastructure/data/blogPosts.data";

interface ApiPost {
  id: number;
  slug: string;
  title: string;
  category: string;
  category_color?: string;
  tag_bg?: string;
  excerpt: string;
  content: string;
  image?: string;
  read_time: string;
  icon?: string;
  banner_gradient?: string;
  is_published: boolean;
  published_at?: string;
  created_at?: string;
}

function mapPost(p: ApiPost): Post {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    category: p.category,
    categoryColor: p.category_color || "#18D6D1",
    tagBg: p.tag_bg,
    excerpt: p.excerpt,
    content: p.content,
    image: p.image,
    readTime: p.read_time,
    icon: p.icon,
    bannerGradient: p.banner_gradient,
    isPublished: p.is_published,
    publishedAt: p.published_at,
    createdAt: p.created_at,
  };
}

export class HttpPostRepository implements PostRepository {
  async list(params?: ListPostsParams): Promise<Post[]> {
    try {
      const query = new URLSearchParams();
      if (params?.category && params.category !== "Todos") {
        query.set("category", params.category);
      }
      if (params?.limit) {
        query.set("limit", String(params.limit));
      }
      query.set("all", "true");

      const response = await apiRequest<{ data: ApiPost[] }>(`/posts?${query.toString()}`);
      if (response && Array.isArray(response.data) && response.data.length > 0) {
        return response.data.map(mapPost);
      }
    } catch {
      // Fallback a datos estáticos sembrados
    }

    // Fallback gracioso
    return blogPostsData.map((p) => ({
      id: p.id,
      slug: p.id,
      title: p.title,
      category: p.category,
      categoryColor: p.categoryColor,
      tagBg: p.tagBg,
      excerpt: p.excerpt,
      content: p.excerpt,
      readTime: p.readTime,
      bannerGradient: p.bannerGradient,
    }));
  }

  async getBySlug(slug: string): Promise<Post | null> {
    try {
      const response = await apiRequest<{ data: ApiPost }>(`/posts/${slug}`);
      if (response?.data) {
        return mapPost(response.data);
      }
    } catch {
      // Fallback
    }

    const fallback = blogPostsData.find((p) => p.id === slug);
    if (!fallback) return null;

    return {
      id: fallback.id,
      slug: fallback.id,
      title: fallback.title,
      category: fallback.category,
      categoryColor: fallback.categoryColor,
      tagBg: fallback.tagBg,
      excerpt: fallback.excerpt,
      content: fallback.excerpt,
      readTime: fallback.readTime,
      bannerGradient: fallback.bannerGradient,
    };
  }
}
