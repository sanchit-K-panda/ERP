import { Badge } from "@/components/ui/Badge";
import type { JobStatus } from "@/modules/jobs/types";

const STATUS_VARIANTS: Record<
  JobStatus,
  "default" | "muted" | "info" | "success" | "warning" | "danger"
> = {
  Created: "muted",
  Processing: "info",
  "In Transit": "info",
  Delivered: "success",
  Completed: "success",
  Cancelled: "danger",
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  return <Badge variant={STATUS_VARIANTS[status]}>{status}</Badge>;
}
