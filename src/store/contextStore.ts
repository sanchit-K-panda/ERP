import { create } from "zustand";
import type { ActiveCompany, ActiveHub } from "@/types/context";

type ContextStore = {
  activeCompany: ActiveCompany | null;
  activeHub: ActiveHub | null;
  setActiveCompany: (company: ActiveCompany) => void;
  setActiveHub: (hub: ActiveHub) => void;
  clearContext: () => void;
  reset: () => void;
};

export const useContextStore = create<ContextStore>((set) => ({
  activeCompany: null,
  activeHub: null,
  setActiveCompany: (company) => set({ activeCompany: company, activeHub: null }),
  setActiveHub: (hub) => set({ activeHub: hub }),
  clearContext: () => set({ activeCompany: null, activeHub: null }),
  reset: () => set({ activeCompany: null, activeHub: null }),
}));
