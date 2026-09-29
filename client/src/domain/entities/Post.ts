export interface Post {
  id: number | string;
  slug: string;
  title: string;
  category: string;
  categoryColor: string;
  tagBg?: string;
  excerpt: string;
  content: string;
  image?: string;
  readTime: string;
  icon?: string;
  bannerGradient?: string;
  isPublished?: boolean;
  publishedAt?: string;
  createdAt?: string;
}
