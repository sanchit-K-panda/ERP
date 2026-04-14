import { create } from "zustand";

type ThemeMode = "light" | "dark";

type AppStore = {
  sidebarCollapsed: boolean;
  theme: ThemeMode;
  toggleSidebar: () => void;
  setTheme: (theme: ThemeMode) => void;
};

export const useAppStore = create<AppStore>((set) => ({
  sidebarCollapsed: false,
  theme: "light",
  toggleSidebar: () =>
    set((state) => ({
      sidebarCollapsed: !state.sidebarCollapsed,
    })),
  setTheme: (theme) => set({ theme }),
}));
