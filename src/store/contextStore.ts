import { create } from "zustand";
import type { ActiveCompany, ActiveHub } from "@/types/context";

const DEFAULT_COMPANY: ActiveCompany = {
  id: "c2",
  name: "Alpha Exim",
};

const DEFAULT_HUB: ActiveHub = {
  id: "h3",
  name: "Chittagong Sea Port",
};

type ContextStore = {
  activeCompany: ActiveCompany | null;
  activeHub: ActiveHub | null;
  setActiveCompany: (company: ActiveCompany) => void;
  setActiveHub: (hub: ActiveHub) => void;
  clearContext: () => void;
  reset: () => void;
};

export const useContextStore = create<ContextStore>((set) => ({
  activeCompany: DEFAULT_COMPANY,
  activeHub: DEFAULT_HUB,
  setActiveCompany: (company) => set({ activeCompany: company, activeHub: null }),
  setActiveHub: (hub) => set({ activeHub: hub }),
  clearContext: () => set({ activeCompany: null, activeHub: null }),
  reset: () => set({ activeCompany: DEFAULT_COMPANY, activeHub: DEFAULT_HUB }),
}));
