"use client";

import { useState } from "react";
import { getAuthToken } from "@/shared/lib/marketplaceStorage";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

interface ExportParams {
  search?: string;
  category?: string;
  isActive?: boolean | "";
  isFeatured?: boolean;
  isFlashDeal?: boolean;
  sort?: string;
  direction?: "asc" | "desc";
}

export function useExportProducts() {
  const [isExporting, setIsExporting] = useState(false);

  const exportExcel = async (params: ExportParams) => {
    setIsExporting(true);
    try {
      const query = new URLSearchParams();

      if (params.search) query.set("search", params.search);
      if (params.category) query.set("category", params.category);
      if (params.isActive !== undefined && params.isActive !== "") {
        query.set("is_active", String(params.isActive));
      }
      if (params.isFeatured !== undefined && params.isFeatured !== false) {
        query.set("is_featured", String(params.isFeatured));
      }
      if (params.isFlashDeal !== undefined && params.isFlashDeal !== false) {
        query.set("is_flash_deal", String(params.isFlashDeal));
      }
      if (params.sort) {
        query.set("sort", params.sort);
        query.set("direction", params.direction ?? "asc");
      }

      const token = getAuthToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE_URL}/admin/products/export?${query.toString()}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error("Error al generar el reporte");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Extraer nombre del archivo del header Content-Disposition si existe
      const disposition = response.headers.get("Content-Disposition");
      const filenameMatch = disposition?.match(/filename="?([^"]+)"?/);
      link.download = filenameMatch?.[1] ?? "catalogo_productos.xlsx";

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  return { exportExcel, isExporting };
}
