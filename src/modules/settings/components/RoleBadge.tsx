import { Badge } from "@/components/ui/Badge";
import type { SettingsUserRole } from "@/modules/settings/types";

type RoleBadgeProps = {
  role: SettingsUserRole;
};

const ROLE_LABELS: Record<SettingsUserRole, string> = {
  BUSINESS_OWNER: "Business Owner",
  BUSINESS_MANAGER: "Business Manager",
  SALES_MANAGER: "Sales Manager",
  SALES_PERSON: "Sales Person",
  PROJECT_MANAGER: "Project Manager",
  STOCK_MANAGER: "Stock Manager",
};

const ROLE_VARIANTS: Record<SettingsUserRole, "default" | "warning" | "success" | "muted"> = {
  BUSINESS_OWNER: "default",
  BUSINESS_MANAGER: "success",
  SALES_MANAGER: "warning",
  SALES_PERSON: "muted",
  PROJECT_MANAGER: "success",
  STOCK_MANAGER: "warning",
};

export function RoleBadge({ role }: RoleBadgeProps) {
  return <Badge variant={ROLE_VARIANTS[role]}>{ROLE_LABELS[role]}</Badge>;
}
