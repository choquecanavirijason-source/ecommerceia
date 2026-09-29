"use client";

import { createContext, createElement, useContext, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiRequest } from "@/infrastructure/http/client";
import { AUTH_SESSION_CHANGED, getAuthToken, getCurrentUser } from "@/shared/lib/marketplaceStorage";

export interface CatalogSyncItem {
  id: number;
  supplier_sku: string;
  action: "create" | "update" | "deactivate" | "unchanged" | "pending";
  issues: string[];
  skipped: boolean;
  payload: {
    name: string;
    category: string;
    category_id: number | null;
    price: string | null;
    stock: number | null;
    source_images: string[];
    track_source?: boolean;
  };
  before: { name: string; price: string; stock: number; category_id: number; supplier_id: number | null; is_active: boolean } | null;
}

export type CatalogSyncFilter = "all" | "pending" | "create" | "update" | "deactivate" | "unchanged";

interface CatalogSyncPreview {
  id: number;
  status: "scanning" | "ready" | "applying" | "applied" | "failed" | "cancelled";
  counts: Record<string, number> | null;
  error: string | null;
  stalled: boolean;
  created_at: string;
  updated_at: string;
  scanned_at: string | null;
  expires_at: string | null;
  summary: { external: number; absent: number; compared: number; eligible: Record<"create" | "update" | "deactivate" | "unchanged", number> };
  progress: { pages_done: number; pages_total: number; products: number; images_done: number; images_total: number };
  unmapped: string[];
  items: CatalogSyncItem[];
  pagination: { page: number; last_page: number; total: number };
}

function subscribeSession(callback: () => void) {
  window.addEventListener(AUTH_SESSION_CHANGED, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(AUTH_SESSION_CHANGED, callback);
    window.removeEventListener("storage", callback);
  };
}

function adminSessionId() {
  const user = getCurrentUser();
  return getAuthToken() && user?.roleName === "admin" ? user.id : null;
}

function useCatalogSyncController() {
  const adminId = useSyncExternalStore(subscribeSession, adminSessionId, () => null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<CatalogSyncFilter>("all");
  const cache = useQueryClient();
  const notified = useRef<number | null>(null);
  const current = useQuery({
    queryKey: ["catalog-sync", "current", adminId],
    queryFn: () => apiRequest<{ id: number | null }>("/admin/catalog-sync/current", { auth: true }),
    enabled: adminId !== null,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    refetchInterval: 30000,
    retry: 1,
  });

  const id = current.data?.id ?? null;

  useEffect(() => {
    setModalOpen(false);
    setPage(1);
    setFilter("all");
    notified.current = null;
  }, [adminId]);

  const query = useQuery({
    queryKey: ["catalog-sync", id, page, filter, adminId],
    enabled: adminId !== null && id !== null,
    staleTime: 0,
    refetchOnMount: "always",
    placeholderData: (previous, previousQuery) => previous?.id === id && previousQuery?.queryKey[4] === adminId ? previous : undefined,
    queryFn: () => apiRequest<CatalogSyncPreview>(`/admin/catalog-sync/${id}?page=${page}&pending=${filter === "pending" ? 1 : 0}${filter !== "all" && filter !== "pending" ? `&action=${filter}` : ""}`, { auth: true }),
    refetchInterval: (q) => q.state.data && ["scanning", "applying"].includes(q.state.data.status) ? 2500 : false,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: "always",
    refetchOnReconnect: "always",
    retry: 1,
  });

  const start = useMutation({
    mutationFn: (fresh: boolean) => apiRequest<{ id: number }>("/admin/catalog-sync/preview", { method: "POST", auth: true, body: { fresh } }),
    onSuccess: ({ id: nextId }) => {
      cache.setQueryData(["catalog-sync", "current", adminId], { id: nextId });
      setPage(1);
      setFilter("all");
      cache.invalidateQueries({ queryKey: ["catalog-sync", nextId] });
    },
  });
  const resolve = useMutation({
    mutationFn: (body: { mappings: { external_category: string; category_id: number }[]; stocks: { item_id: number; stock: number }[] }) =>
      apiRequest(`/admin/catalog-sync/${id}/resolve`, { method: "POST", auth: true, body }),
    onSuccess: () => cache.invalidateQueries({ queryKey: ["catalog-sync", id] }),
  });
  const apply = useMutation({
    mutationFn: (skipInvalid: boolean) => apiRequest("/admin/catalog-sync/apply", { method: "POST", auth: true, body: { id, skip_invalid: skipInvalid } }),
    onSuccess: () => cache.invalidateQueries({ queryKey: ["catalog-sync", id] }),
  });
  const cancel = useMutation({
    mutationFn: () => apiRequest(`/admin/catalog-sync/${id}/cancel`, { method: "POST", auth: true }),
    onSuccess: () => cache.invalidateQueries({ queryKey: ["catalog-sync", id] }),
  });

  useEffect(() => {
    if (adminId !== null && query.data?.status === "applied" && notified.current !== query.data.id) {
      notified.current = query.data.id;
      toast.success("Catálogo actualizado");
      cache.invalidateQueries({ predicate: (q) => q.queryKey[0] !== "catalog-sync" });
    }
  }, [adminId, query.data, cache]);

  function begin(fresh = false) {
    resolve.reset();
    apply.reset();
    cancel.reset();
    start.mutate(fresh);
  }

  function openDetails() {
    setModalOpen(true);
    if (id !== null) void query.refetch();
    else begin();
  }

  return { ...query, isAdmin: adminId !== null, adminId, isModalOpen, setModalOpen, openDetails, error: query.error || (id === null ? current.error : null), recovering: (id === null && current.isFetching) || (id !== null && query.isLoading), page, setPage, filter, setFilter, start, resolve, apply, cancel, begin };
}

const CatalogSyncContext = createContext<ReturnType<typeof useCatalogSyncController> | null>(null);

export function CatalogSyncProvider({ children }: { children: ReactNode }) {
  const sync = useCatalogSyncController();
  return createElement(CatalogSyncContext.Provider, { value: sync }, children);
}

export function useCatalogSync() {
  const sync = useContext(CatalogSyncContext);
  if (!sync) throw new Error("useCatalogSync requiere CatalogSyncProvider");
  return sync;
}
