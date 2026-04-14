"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export function useRequireAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loading = useAuthStore((state) => state.loading);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!isAuthenticated && pathname !== "/login") {
      router.replace("/login");
    }
  }, [isAuthenticated, loading, pathname, router]);

  return {
    isAuthenticated,
    loading,
    ready: !loading && isAuthenticated,
  };
}
