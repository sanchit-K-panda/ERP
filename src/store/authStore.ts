import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { authService } from "@/services/authService";
import type { AuthUser, Role } from "@/types/auth";

type AuthStore = {
  user: AuthUser | null;
  role: Role | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: AuthUser, role: Role) => void;
  setLoading: (loading: boolean) => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      isAuthenticated: false,
      // Start in loading state until persisted auth is rehydrated.
      loading: true,
      login: async (email, password) => {
        set({ loading: true });

        try {
          const result = await authService.login(email, password);
          set({
            user: result.user,
            role: result.role,
            isAuthenticated: true,
            loading: false,
          });
        } catch (error) {
          set({
            user: null,
            role: null,
            isAuthenticated: false,
            loading: false,
          });
          throw error;
        }
      },
      logout: () =>
        set({
          user: null,
          role: null,
          isAuthenticated: false,
          loading: false,
        }),
      setUser: (user, role) =>
        set({
          user,
          role,
          isAuthenticated: true,
          loading: false,
        }),
      setLoading: (loading) => set({ loading }),
    }),
    {
      name: "neo-crm-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setLoading(false);
      },
    },
  ),
);
