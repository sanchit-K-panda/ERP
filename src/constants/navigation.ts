import type { Role } from "@/types/auth";

export const SIDEBAR_ROUTE_RULES = {
  dashboard: ["BUSINESS_OWNER", "BUSINESS_MANAGER", "SALES_PERSON"],
  jobs: ["BUSINESS_OWNER", "BUSINESS_MANAGER", "SALES_PERSON"],
  parties: ["BUSINESS_OWNER", "BUSINESS_MANAGER", "SALES_PERSON"],
  freight: ["BUSINESS_OWNER", "BUSINESS_MANAGER", "SALES_PERSON"],
  finance: ["BUSINESS_OWNER", "BUSINESS_MANAGER"],
  warehouse: ["BUSINESS_OWNER", "BUSINESS_MANAGER"],
  documents: ["BUSINESS_OWNER", "BUSINESS_MANAGER", "SALES_PERSON"],
  reports: ["BUSINESS_OWNER"],
  settings: ["BUSINESS_OWNER"],
} as Record<string, Role[]>;

export function canAccessPath(pathname: string, role: Role | null) {
  if (!role) {
    return false;
  }

  if (pathname.startsWith("/dashboard")) {
    return SIDEBAR_ROUTE_RULES.dashboard.includes(role);
  }

  if (pathname.startsWith("/jobs")) {
    return SIDEBAR_ROUTE_RULES.jobs.includes(role);
  }

  if (pathname.startsWith("/parties")) {
    return SIDEBAR_ROUTE_RULES.parties.includes(role);
  }

  if (pathname.startsWith("/freight")) {
    return SIDEBAR_ROUTE_RULES.freight.includes(role);
  }

  if (pathname.startsWith("/finance")) {
    return SIDEBAR_ROUTE_RULES.finance.includes(role);
  }

  if (pathname.startsWith("/warehouse")) {
    return SIDEBAR_ROUTE_RULES.warehouse.includes(role);
  }

  if (pathname.startsWith("/documents")) {
    return SIDEBAR_ROUTE_RULES.documents.includes(role);
  }

  if (pathname.startsWith("/reports")) {
    return SIDEBAR_ROUTE_RULES.reports.includes(role);
  }

  if (pathname.startsWith("/settings")) {
    return SIDEBAR_ROUTE_RULES.settings.includes(role);
  }

  return true;
}
