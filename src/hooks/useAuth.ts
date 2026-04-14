"use client";

import { useMemo } from "react";
import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loading = useAuthStore((state) => state.loading);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const setUser = useAuthStore((state) => state.setUser);

  return useMemo(
    () => ({
      user,
      role,
      isAuthenticated,
      loading,
      login,
      logout,
      setUser,
    }),
    [user, role, isAuthenticated, loading, login, logout, setUser],
  );
}
