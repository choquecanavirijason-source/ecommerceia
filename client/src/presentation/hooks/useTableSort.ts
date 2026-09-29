"use client";

import { useState } from "react";
import type { SortDirection } from "@/domain/entities/TableSort";

export function useTableSort(onSortChange: () => void) {
  const [sort, setSort] = useState<{ column: string; direction: SortDirection } | null>(null);

  const handleSort = (column: string) => {
    setSort((previous) => {
      if (previous?.column !== column) return { column, direction: "asc" };
      if (previous.direction === "asc") return { column, direction: "desc" };
      return null;
    });
    onSortChange();
  };

  return {
    sort,
    sortParams: { sort: sort?.column, direction: sort?.direction },
    headerProps: {
      activeColumn: sort?.column ?? null,
      direction: sort?.direction ?? null,
      onSort: handleSort,
    },
  };
}
