import { apiRequest } from "@/infrastructure/http/client";
import type {
  AdminListProductsParams,
  ListProductsParams,
  PaginateProductsParams,
  ProductRepository,
  UpsertProductData,
} from "@/domain/repositories/ProductRepository";
import type { Product } from "@/domain/entities/Product";
import { paginated, type Paginated } from "@/domain/entities/Order";

interface ApiProduct {
  id: number;
  slug: string;
  name: string;
  price: number;
  price_raw: string;
  original_price: number | null;
  tag: string | null;
  sku: string | null;
  stock: number;
  in_stock: boolean;
  is_active: boolean;
  is_featured?: boolean;
  is_flash_deal?: boolean;
  flash_deal_starts_at?: string | null;
  flash_deal_ends_at?: string | null;
  description: string | null;
  long_description: string | null;
  details: string[] | null;
  sizes: string[] | null;
  colors: string[] | null;
  tags: string[] | null;
  weight: string | null;
  warranty: string | null;
  image: string | null;
  images: string[];
  category_id: number;
  category: string | null;
  category_slug: string | null;
  supplier_id?: number | null;
  supplier_name?: string | null;
  rating: number;
  reviews_count: number;
  created_at: string;
  updated_at: string;
}

function mapProduct(p: ApiProduct): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    originalPrice: p.original_price ?? undefined,
    rating: p.rating,
    reviews: p.reviews_count,
    image: p.image ?? "",
    images: p.images,
    category: p.category ?? "",
    categoryId: p.category_id,
    badge: p.tag ?? undefined,
    weight: p.weight ?? undefined,
    inStock: p.in_stock,
    stock: p.stock,
    isActive: p.is_active,
    isFeatured: p.is_featured,
    isFlashDeal: p.is_flash_deal,
    flashDealStartsAt: p.flash_deal_starts_at ?? undefined,
    flashDealEndsAt: p.flash_deal_ends_at ?? undefined,
    sku: p.sku ?? undefined,
    tags: p.tags ?? undefined,
    description: p.description ?? undefined,
    longDescription: p.long_description ?? undefined,
    warranty: p.warranty ?? undefined,
    supplierId: p.supplier_id,
    supplierName: p.supplier_name,
  };
}

interface PaginatedPayload<T> {
  data: T[];
  meta?: {
    total?: number;
    current_page?: number;
    last_page?: number;
  };
}

async function fetchProducts(search = ""): Promise<Product[]> {
  const query = new URLSearchParams({ limit: "200" });
  if (search) query.set("search", search);

  const payload = await apiRequest<PaginatedPayload<ApiProduct>>(`/products?${query.toString()}`);
  return payload.data.map(mapProduct);
}

const FLASH_DEAL_TAGS = ["Oferta", "Nuevo"];

export class HttpProductRepository implements ProductRepository {
  async list(params?: ListProductsParams): Promise<Product[]> {
    const products = await fetchProducts(params?.search ?? "");

    if (!params?.category || params.category === "Todos") return products;
    return products.filter((p) => p.category === params.category);
  }

  async listFlashDeals(): Promise<Product[]> {
    const products = await fetchProducts();
    return products.filter((p) => {
      const tag = p.badge?.toLowerCase();
      return tag !== undefined && FLASH_DEAL_TAGS.some((t) => t.toLowerCase() === tag);
    });
  }

  async paginate(params?: PaginateProductsParams): Promise<Paginated<Product>> {
    const query = new URLSearchParams({
      limit: String(params?.limit ?? 12),
      page: String(params?.page ?? 1),
    });

    if (params?.category) query.set("category", params.category);
    if (params?.search) query.set("search", params.search);
    if (params?.tag) query.set("tag", params.tag);
    if (params?.isFeatured !== undefined) query.set("is_featured", String(params.isFeatured));
    if (params?.isFlashDeal !== undefined) query.set("is_flash_deal", String(params.isFlashDeal));

    const payload = await apiRequest<PaginatedPayload<ApiProduct>>(`/products?${query.toString()}`);
    return paginated({ data: payload.data.map(mapProduct), meta: payload.meta });
  }

  async getById(id: number): Promise<Product | null> {
    try {
      const payload = await apiRequest<{ data: ApiProduct }>(`/products/${id}`);
      return mapProduct(payload.data);
    } catch {
      return null;
    }
  }

  async adminList(params?: AdminListProductsParams): Promise<Paginated<Product>> {
    const query = new URLSearchParams({
      limit: String(params?.limit ?? 10),
      page: String(params?.page ?? 1),
    });

    if (params?.search) query.set("search", params.search);
    if (params?.category) query.set("category", params.category);
    if (params?.isActive !== undefined && params.isActive !== "") {
      query.set("is_active", String(params.isActive));
    }
    if (params?.isFeatured !== undefined && params.isFeatured !== "") {
      query.set("is_featured", String(params.isFeatured));
    }
    if (params?.isFlashDeal !== undefined && params.isFlashDeal !== "") {
      query.set("is_flash_deal", String(params.isFlashDeal));
    }
    if (params?.sort) {
      query.set("sort", params.sort);
      query.set("direction", params.direction ?? "asc");
    }

    const payload = await apiRequest<PaginatedPayload<ApiProduct>>(`/admin/products?${query.toString()}`, {
      auth: true,
    });

    return paginated({ data: payload.data.map(mapProduct), meta: payload.meta });
  }

  async toggleActive(id: number, isActive: boolean): Promise<Product> {
    const payload = await apiRequest<{ data: ApiProduct }>(`/admin/products/${id}/status`, {
      method: "PATCH",
      auth: true,
      body: { is_active: isActive },
    });
    return mapProduct(payload.data);
  }

  async delete(id: number): Promise<void> {
    await apiRequest(`/products/${id}`, { method: "DELETE", auth: true });
  }

  async update(id: number, data: UpsertProductData): Promise<Product> {
    const payload = await apiRequest<{ data: ApiProduct }>(`/products/${id}`, {
      method: "PUT",
      auth: true,
      body: {
        name: data.name,
        category_id: data.categoryId,
        price: data.price,
        original_price: data.originalPrice ?? null,
        tag: data.tag ?? null,
        sku: data.sku ?? null,
        stock: data.stock ?? 0,
        weight: data.weight ?? null,
        warranty: data.warranty ?? null,
        is_active: data.isActive ?? true,
        is_featured: data.isFeatured,
        is_flash_deal: data.isFlashDeal,
        flash_deal_starts_at: data.flashDealStartsAt ?? null,
        flash_deal_ends_at: data.flashDealEndsAt ?? null,
        description: data.description ?? "",
        images: [{ url: data.image, alt: data.name }],
      },
    });
    return mapProduct(payload.data);
  }
}