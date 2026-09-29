"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/infrastructure/http/client";
import type { HeroSlide } from "@/domain/entities/HeroSlide";

interface ApiBanner {
  id: number;
  title: string;
  subtitle: string | null;
  desc: string | null;
  cta: string;
  link_url: string | null;
  bg: string;
  accent: string;
  image: string;
  position: string;
  order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type BannerData = {
  id?: number;
  title: string;
  subtitle?: string;
  desc?: string;
  cta?: string;
  linkUrl?: string;
  bg?: string;
  accent?: string;
  image: string;
  imageFile?: File;
  position?: string;
  order?: number;
  isActive?: boolean;
};

function mapBanner(b: ApiBanner): BannerData {
  return {
    id: b.id,
    title: b.title,
    subtitle: b.subtitle ?? "",
    desc: b.desc ?? "",
    cta: b.cta,
    linkUrl: b.link_url ?? "/categorias",
    bg: b.bg,
    accent: b.accent,
    image: b.image,
    position: b.position,
    order: b.order,
    isActive: b.is_active,
  };
}

export function useAdminBanners(params?: { position?: string; status?: string }) {
  return useQuery({
    queryKey: ["admin", "banners", params],
    queryFn: async () => {
      const q = new URLSearchParams();
      if (params?.position) q.set("position", params.position);
      if (params?.status) q.set("status", params.status);

      const res = await apiRequest<{ data: ApiBanner[] }>(`/admin/banners?${q.toString()}`, {
        auth: true,
      });

      return (res.data || []).map(mapBanner);
    },
  });
}

export function useCreateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: BannerData) => {
      const body = new FormData();
      body.append("title", data.title);
      body.append("subtitle", data.subtitle || "");
      body.append("desc", data.desc || "");
      body.append("cta", data.cta || "Comprá ahora");
      body.append("link_url", data.linkUrl || "/categorias");
      body.append("bg", data.bg || "from-orange-50 via-white to-amber-50");
      body.append("accent", data.accent || "#FF6A00");
      body.append("image", data.imageFile ?? data.image);
      body.append("position", data.position || "hero");
      body.append("order", String(data.order ?? 0));
      body.append("is_active", data.isActive ? "1" : "0");

      const res = await apiRequest<{ data: ApiBanner }>("/admin/banners", {
        method: "POST",
        auth: true,
        body,
      });
      return mapBanner(res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "banners"] });
      queryClient.invalidateQueries({ queryKey: ["hero-slides"] });
    },
  });
}

export function useUpdateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: BannerData }) => {
      const body = new FormData();
      body.append("_method", "PUT");
      body.append("title", data.title);
      body.append("subtitle", data.subtitle || "");
      body.append("desc", data.desc || "");
      body.append("cta", data.cta || "Comprá ahora");
      body.append("link_url", data.linkUrl || "/categorias");
      body.append("bg", data.bg || "from-orange-50 via-white to-amber-50");
      body.append("accent", data.accent || "#FF6A00");
      body.append("image", data.imageFile ?? data.image);
      body.append("position", data.position || "hero");
      body.append("order", String(data.order ?? 0));
      body.append("is_active", data.isActive ? "1" : "0");

      const res = await apiRequest<{ data: ApiBanner }>(`/admin/banners/${id}`, {
        method: "POST",
        auth: true,
        body,
      });
      return mapBanner(res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "banners"] });
      queryClient.invalidateQueries({ queryKey: ["hero-slides"] });
    },
  });
}

export function useToggleBannerStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest<{ data: ApiBanner }>(`/admin/banners/${id}/toggle`, {
        method: "PATCH",
        auth: true,
      });
      return mapBanner(res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "banners"] });
      queryClient.invalidateQueries({ queryKey: ["hero-slides"] });
    },
  });
}

export function useDeleteBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/admin/banners/${id}`, {
        method: "DELETE",
        auth: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "banners"] });
      queryClient.invalidateQueries({ queryKey: ["hero-slides"] });
    },
  });
}
