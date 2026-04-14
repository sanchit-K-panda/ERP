import { Badge } from "@/components/ui/Badge";
import type { ShipmentStatus } from "@/modules/shipments/types";

const STATUS_VARIANTS: Record<
  ShipmentStatus,
  "default" | "muted" | "info" | "success" | "warning" | "danger"
> = {
  Processing: "info",
  "In Transit": "info",
  Delivered: "success",
  Delayed: "danger",
};

export function ShipmentStatusBadge({ status }: { status: ShipmentStatus }) {
  return <Badge variant={STATUS_VARIANTS[status]}>{status}</Badge>;
}
