"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { canAccessPath } from "@/constants/navigation";
import { useRequireHub } from "@/hooks/useRequireHub";
import { useAuthStore } from "@/store/authStore";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const role = useAuthStore((state) => state.role);
  const { ready } = useRequireHub();

  useEffect(() => {
    if (!ready) {
      return;
    }

    if (!canAccessPath(pathname, role)) {
      router.replace("/dashboard");
    }
  }, [pathname, ready, role, router]);

  if (!ready) {
    return null;
  }

  if (!canAccessPath(pathname, role)) {
    return null;
  }

  return <AppShell>{children}</AppShell>;
}
