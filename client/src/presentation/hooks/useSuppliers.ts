"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TableSortParams } from "@/domain/entities/TableSort";
import { apiRequest } from "@/infrastructure/http/client";
import type { Supplier, UpsertSupplierData } from "@/domain/entities/Supplier";

interface ApiSupplier {
  id: number;
  name: string;
  code: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  notes: string | null;
  is_active: boolean;
  products_count: number;
  created_at: string;
  updated_at: string;
}

function mapSupplier(s: ApiSupplier): Supplier {
  return {
    id: s.id,
    name: s.name,
    code: s.code,
    contactName: s.contact_name,
    email: s.email,
    phone: s.phone,
    address: s.address,
    website: s.website,
    notes: s.notes,
    isActive: s.is_active,
    productsCount: s.products_count ?? 0,
    createdAt: s.created_at,
    updatedAt: s.updated_at,
  };
}

export function useActiveSuppliers() {
  return useQuery({
    queryKey: ["suppliers", "active"],
    queryFn: async () => {
      const res = await apiRequest<{ data: ApiSupplier[] }>("/admin/suppliers/all", { auth: true });
      return (res.data || []).map(mapSupplier);
    },
  });
}

export function useAdminSuppliers(params?: TableSortParams & { search?: string; status?: string; page?: number }) {
  return useQuery({
    queryKey: ["admin", "suppliers", params],
    queryFn: async () => {
      const q = new URLSearchParams();
      if (params?.search) q.set("search", params.search);
      if (params?.status) q.set("is_active", String(params.status === "active"));
      if (params?.page) q.set("page", String(params.page));
      if (params?.sort) {
        q.set("sort", params.sort);
        q.set("direction", params.direction ?? "asc");
      }

      const res = await apiRequest<{
        data: ApiSupplier[];
        meta?: { total: number; current_page: number; last_page: number };
      }>(`/admin/suppliers?${q.toString()}`, { auth: true });

      return {
        data: (res.data || []).map(mapSupplier),
        meta: res.meta,
      };
    },
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpsertSupplierData) => {
      const res = await apiRequest<{ data: ApiSupplier }>("/admin/suppliers", {
        method: "POST",
        auth: true,
        body: {
          name: data.name,
          code: data.code || null,
          contact_name: data.contactName || null,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address || null,
          website: data.website || null,
          notes: data.notes || null,
          is_active: data.isActive ?? true,
        },
      });
      return mapSupplier(res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpsertSupplierData }) => {
      const res = await apiRequest<{ data: ApiSupplier }>(`/admin/suppliers/${id}`, {
        method: "PUT",
        auth: true,
        body: {
          name: data.name,
          code: data.code || null,
          contact_name: data.contactName || null,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address || null,
          website: data.website || null,
          notes: data.notes || null,
          is_active: data.isActive ?? true,
        },
      });
      return mapSupplier(res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}

export function useToggleSupplierStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest<{ data: ApiSupplier }>(`/admin/suppliers/${id}/toggle-status`, {
        method: "PATCH",
        auth: true,
      });
      return mapSupplier(res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/admin/suppliers/${id}`, {
        method: "DELETE",
        auth: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}
