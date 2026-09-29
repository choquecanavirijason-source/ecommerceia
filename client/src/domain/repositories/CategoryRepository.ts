import type { TableSortParams } from "../entities/TableSort";
import type { Category } from "../entities/Category";
import type { Paginated } from "../entities/Order";

export interface AdminListCategoriesParams extends TableSortParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface CategoryRepository {
  list(): Promise<Category[]>;
  getBySlug(slug: string): Promise<Category | null>;
  adminList(params?: AdminListCategoriesParams): Promise<Paginated<Category>>;
  create(name: string, icon?: string): Promise<Category>;
  update(id: number, name: string, icon?: string): Promise<Category>;
  delete(id: number): Promise<void>;
}