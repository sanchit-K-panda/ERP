import { Badge } from "@/components/ui/Badge";
import type { PartyType } from "@/modules/parties/types";

const TYPE_VARIANTS: Record<
  PartyType,
  "default" | "muted" | "info" | "success" | "warning" | "danger"
> = {
  Client: "info",
  Vendor: "default",
  Agent: "warning",
  Broker: "muted",
};

export function PartyTypeBadge({ type }: { type: PartyType }) {
  return <Badge variant={TYPE_VARIANTS[type]}>{type}</Badge>;
}
