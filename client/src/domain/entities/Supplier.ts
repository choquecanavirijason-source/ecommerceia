export interface Supplier {
  id: number;
  name: string;
  code?: string | null;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  notes?: string | null;
  isActive: boolean;
  productsCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpsertSupplierData {
  name: string;
  code?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  notes?: string;
  isActive?: boolean;
}
