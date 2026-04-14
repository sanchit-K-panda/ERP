"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useContextStore } from "@/store/contextStore";

export function useRequireHub() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loading = useAuthStore((state) => state.loading);
  const activeCompany = useContextStore((state) => state.activeCompany);
  const activeHub = useContextStore((state) => state.activeHub);

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
      return;
    }

    if (!activeHub) {
      router.replace("/select-hub");
    }
  }, [activeCompany, activeHub, isAuthenticated, loading, router]);

  return {
    activeHub,
    ready: isAuthenticated && !loading && Boolean(activeCompany) && Boolean(activeHub),
  };
}
