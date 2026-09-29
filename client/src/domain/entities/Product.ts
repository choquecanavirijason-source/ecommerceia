export interface Product {
  id: number;
  slug?: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  images?: string[];
  category: string;
  categoryId?: number;
  badge?: string;
  weight?: string;
  inStock: boolean;
  stock?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  isFlashDeal?: boolean;
  flashDealStartsAt?: string;
  flashDealEndsAt?: string;
  sku?: string;
  tags?: string[];
  description?: string;
  longDescription?: string;
  warranty?: string;
  supplierId?: number | null;
  supplierName?: string | null;
}
