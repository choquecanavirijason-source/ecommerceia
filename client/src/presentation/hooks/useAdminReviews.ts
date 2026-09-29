"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/infrastructure/http/client";

export interface AdminReview {
  id: number;
  productId: number;
  productName?: string;
  userId: number;
  userName: string;
  userEmail?: string;
  rating: number;
  title?: string;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

export interface ReviewStats {
  total: number;
  approved: number;
  pending: number;
  averageRating: number;
}

interface ApiReview {
  id: number;
  product_id: number;
  product_name?: string;
  user_id: number;
  user_name: string;
  user_email?: string;
  rating: number;
  title?: string;
  comment: string;
  is_approved: boolean;
  created_at: string;
}

function mapReview(r: ApiReview): AdminReview {
  return {
    id: r.id,
    productId: r.product_id,
    productName: r.product_name,
    userId: r.user_id,
    userName: r.user_name,
    userEmail: r.user_email,
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    isApproved: r.is_approved,
    createdAt: r.created_at,
  };
}

export function useAdminReviews(params?: { status?: string; rating?: string; page?: number }) {
  return useQuery({
    queryKey: ["admin", "reviews", params],
    queryFn: async () => {
      const q = new URLSearchParams();
      if (params?.status) q.set("status", params.status);
      if (params?.rating) q.set("rating", params.rating);
      if (params?.page) q.set("page", String(params.page));

      const res = await apiRequest<{
        data: ApiReview[];
        meta?: { total: number; current_page: number; last_page: number };
      }>(`/admin/reviews?${q.toString()}`, { auth: true });

      return {
        data: (res.data || []).map(mapReview),
        meta: res.meta,
      };
    },
  });
}

export function useReviewStats() {
  return useQuery({
    queryKey: ["admin", "reviews", "stats"],
    queryFn: async () => {
      const res = await apiRequest<{
        data: {
          total: number;
          approved: number;
          pending: number;
          average_rating: number;
        };
      }>("/admin/reviews/stats", { auth: true });

      return {
        total: res.data.total,
        approved: res.data.approved,
        pending: res.data.pending,
        averageRating: res.data.average_rating,
      };
    },
  });
}

export function useToggleReviewApproval() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest<{ data: ApiReview }>(`/admin/reviews/${id}/toggle-approval`, {
        method: "PATCH",
        auth: true,
      });
      return mapReview(res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/admin/reviews/${id}`, {
        method: "DELETE",
        auth: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
    },
  });
}
