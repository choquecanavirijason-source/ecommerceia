"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CatalogSyncProvider } from "@/presentation/hooks/useCatalogSync";
import { CatalogSyncProgress } from "@/presentation/organisms/CatalogSyncProgress";
import { usePathname } from "next/navigation";
import { isDemoRoute } from "@/demo/routes";

if (typeof window !== "undefined") {
  window.addEventListener(
    "unhandledrejection",
    (event) => {
      const reason = event.reason;
      const stack = reason?.stack || "";
      const message = reason?.message || String(reason || "");
      if (
        stack.includes("chrome-extension://") ||
        message.includes("chrome-extension://") ||
        message.includes("M_ID")
      ) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    },
    true,
  );
}

export function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>
    {isDemoRoute(pathname) ? children : <CatalogSyncProvider>
      {children}
      <CatalogSyncProgress />
    </CatalogSyncProvider>}
  </QueryClientProvider>;
}
