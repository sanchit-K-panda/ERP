import { Badge } from "@/components/ui/Badge";

const STATUS_VARIANTS = {
  Delivered: "success",
  "In Transit": "info",
  Pending: "warning",
  Delayed: "danger",
} as const;

export function StatusBadge({ status }: { status: keyof typeof STATUS_VARIANTS }) {
  return <Badge variant={STATUS_VARIANTS[status]}>{status}</Badge>;
}
