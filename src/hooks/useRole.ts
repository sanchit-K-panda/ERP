"use client";

import { useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import type { Role } from "@/types/auth";

export function useRole(): {
  role: Role | null;
  hasRole: (candidate: Role | Role[]) => boolean;
};
export function useRole(requiredRole: Role | Role[]): boolean;
export function useRole(requiredRole?: Role | Role[]) {
  const role = useAuthStore((state) => state.role);

  const hasRole = useCallback(
    (candidate: Role | Role[]) => {
      if (!role) {
        return false;
      }

      const allowedRoles = Array.isArray(candidate) ? candidate : [candidate];
      return allowedRoles.includes(role);
    },
    [role],
  );

  if (!requiredRole) {
    return {
      role,
      hasRole,
    };
  }

  return hasRole(requiredRole);
}
