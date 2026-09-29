"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { DashboardLayout, adminNavItems } from "@/presentation/organisms/DashboardLayout";
import { getCurrentUser, isCustomerAuthenticated } from "@/shared/lib/marketplaceStorage";

export function AdminLayoutClient({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!isCustomerAuthenticated()) {
      router.push(`/cuenta/ingresar?redirect=${encodeURIComponent(pathname || "/admin")}`);
      return;
    }
    if (getCurrentUser()?.roleName !== "admin") {
      router.push("/");
      return;
    }
    setAuthChecked(true);
  }, [router, pathname]);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] px-4 py-24 text-center text-neutral-400 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#FF6A00] border-t-transparent animate-spin" />
        <p className="text-sm font-medium">Verificando credenciales de administrador…</p>
      </div>
    );
  }

  return (
    <DashboardLayout navItems={adminNavItems} title="Panel Administrador">
      {children}
    </DashboardLayout>
  );
}
