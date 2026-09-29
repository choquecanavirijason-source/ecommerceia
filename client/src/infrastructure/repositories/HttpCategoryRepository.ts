import { apiRequest } from "@/infrastructure/http/client";
import type { AdminListCategoriesParams, CategoryRepository } from "@/domain/repositories/CategoryRepository";
import type { Category } from "@/domain/entities/Category";
import { paginated, type Paginated } from "@/domain/entities/Order";
import { getCategoryIconComponent } from "@/shared/lib/categoryIcons";
import { categoriesSeed } from "@/infrastructure/data/categories.data";

interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
  products_count: number;
}

interface PaginatedPayload<T> {
  data: T[];
  meta?: {
    total?: number;
    current_page?: number;
    last_page?: number;
  };
}

const DEFAULT_COLOR = "#f3f4f6";

function mapCategory(c: ApiCategory): Category {
  const seed = categoriesSeed.find((s) => s.name === c.name);
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    iconName: c.icon ?? undefined,
    icon: getCategoryIconComponent(c.icon),
    count: c.products_count,
    color: seed?.color ?? DEFAULT_COLOR,
  };
}

export class HttpCategoryRepository implements CategoryRepository {
  async list(): Promise<Category[]> {
    const payload = await apiRequest<{ data: ApiCategory[] }>("/categories?limit=100");
    return payload.data.map(mapCategory);
  }

  async getBySlug(slug: string): Promise<Category | null> {
    try {
      const payload = await apiRequest<{ data: ApiCategory }>(`/categories/${slug}`);
      return mapCategory(payload.data);
    } catch {
      return null;
    }
  }

  async adminList(params?: AdminListCategoriesParams): Promise<Paginated<Category>> {
    const query = new URLSearchParams({
      limit: String(params?.limit ?? 10),
      page: String(params?.page ?? 1),
    });

    if (params?.search) query.set("search", params.search);

    if (params?.sort) {
      query.set("sort", params.sort);
      query.set("direction", params.direction ?? "asc");
    }

    const payload = await apiRequest<PaginatedPayload<ApiCategory>>(`/admin/categories?${query.toString()}`, {
      auth: true,
    });

    return paginated({ data: payload.data.map(mapCategory), meta: payload.meta });
  }

  async create(name: string, icon?: string): Promise<Category> {
    const payload = await apiRequest<{ data: ApiCategory }>("/categories", {
      method: "POST",
      auth: true,
      body: { name, icon },
    });
    return mapCategory(payload.data);
  }

  async update(id: number, name: string, icon?: string): Promise<Category> {
    const payload = await apiRequest<{ data: ApiCategory }>(`/categories/${id}`, {
      method: "PUT",
      auth: true,
      body: { name, icon },
    });
    return mapCategory(payload.data);
  }

  async delete(id: number): Promise<void> {
    await apiRequest(`/categories/${id}`, { method: "DELETE", auth: true });
  }
}
