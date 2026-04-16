import type { Role } from "@/types/auth";
import type { ActiveCompany, ActiveHub } from "@/types/context";

export const ROLE_COMPANY_CONTEXT: Record<Role, ActiveCompany> = {
  BUSINESS_OWNER: {
    id: "c1",
    name: "Bangladesh Shipping Corporation (BSC)",
  },
  BUSINESS_MANAGER: {
    id: "c2",
    name: "Bangladesh Shipping Agencies (Pvt) Ltd",
  },
  SALES_PERSON: {
    id: "c5",
    name: "Eastern Overseas Shipping Lines Ltd",
  },
};

export const DEFAULT_ROLE_HUB_CONTEXT: ActiveHub = {
  id: "h3",
  name: "Chittagong Sea Port",
};

export function getRoleCompanyContext(role: Role | null): ActiveCompany {
  if (!role) {
    return ROLE_COMPANY_CONTEXT.BUSINESS_OWNER;
  }

  return ROLE_COMPANY_CONTEXT[role];
}
