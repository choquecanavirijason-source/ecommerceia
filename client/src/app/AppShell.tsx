"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@/presentation/organisms/SiteHeader";
import { SiteFooter } from "@/presentation/organisms/SiteFooter";
import { CompareFloatingBar } from "@/presentation/molecules/CompareFloatingBar";
import { AgentDemoShell } from "@/presentation/templates/AgentDemoShell";
import { isDemoRoute } from "@/demo/routes";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  if (isDemoRoute(pathname)) return <AgentDemoShell>{children}</AgentDemoShell>;
  const usesDashboardLayout = pathname.startsWith("/admin") || pathname.startsWith("/cuenta");

  if (usesDashboardLayout) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <CompareFloatingBar />
      <SiteFooter />
    </>
  );
}
