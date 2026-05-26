import { create } from "zustand";
import type { ActiveCompany, ActiveHub } from "@/types/context";

/*
  Dev-only defaults were previously hardcoded here which caused "vibe code"
  to leak into non-dev builds. We now only use the in-repo defaults when both:
  - the build is non-production (NODE_ENV !== 'production')
  - and the env flag `NEXT_PUBLIC_USE_DEV_CONTEXT` is set to 'true'

  In production builds this store will initialize with nulls and must be
  populated by proper onboarding/auth flows.
*/

const DEV_DEFAULT_COMPANY: ActiveCompany = {
  id: "c1",
  name: "Bangladesh Shipping Corporation (BSC)",
};

const DEV_DEFAULT_HUB: ActiveHub = {
  id: "h3",
  name: "Chittagong Sea Port",
};

const useDevDefaults =
  process.env.NODE_ENV !== "production" &&
  (process.env.NEXT_PUBLIC_USE_DEV_CONTEXT === "true");

type ContextStore = {
  activeCompany: ActiveCompany | null;
  activeHub: ActiveHub | null;
  setActiveCompany: (company: ActiveCompany) => void;
  setActiveHub: (hub: ActiveHub) => void;
  clearContext: () => void;
  reset: () => void;
};

export const useContextStore = create<ContextStore>((set) => ({
  activeCompany: useDevDefaults ? DEV_DEFAULT_COMPANY : null,
  activeHub: useDevDefaults ? DEV_DEFAULT_HUB : null,
  setActiveCompany: (company) => set({ activeCompany: company, activeHub: null }),
  setActiveHub: (hub) => set({ activeHub: hub }),
  clearContext: () => set({ activeCompany: null, activeHub: null }),
  reset: () =>
    set({
      activeCompany: useDevDefaults ? DEV_DEFAULT_COMPANY : null,
      activeHub: useDevDefaults ? DEV_DEFAULT_HUB : null,
    }),
}));
