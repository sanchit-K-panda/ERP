"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useContextStore } from "@/store/contextStore";

export function useRequireCompany() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loading = useAuthStore((state) => state.loading);
  const activeCompany = useContextStore((state) => state.activeCompany);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!activeCompany) {
      router.replace("/select-company");
    }
  }, [activeCompany, isAuthenticated, loading, router]);

  return {
    activeCompany,
    ready: isAuthenticated && !loading && Boolean(activeCompany),
  };
}
