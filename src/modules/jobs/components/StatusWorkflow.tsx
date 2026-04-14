"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { JobStatusBadge } from "@/modules/jobs/components/JobStatusBadge";
import { JOB_STATUS_ORDER, type JobStatus } from "@/modules/jobs/types";

type StatusWorkflowProps = {
  currentStatus: JobStatus;
  allowedTransitions: JobStatus[];
  isUpdating?: boolean;
  onConfirm: (nextStatus: JobStatus) => void;
};

export function StatusWorkflow({
  currentStatus,
  allowedTransitions,
  isUpdating = false,
  onConfirm,
}: StatusWorkflowProps) {
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<JobStatus | null>(null);

  const effectiveSelectedStatus =
    selectedStatus && allowedTransitions.includes(selectedStatus)
      ? selectedStatus
      : allowedTransitions[0] ?? null;

  const timeline = useMemo(() => {
    const currentIndex = JOB_STATUS_ORDER.indexOf(currentStatus);
    const isCancelled = currentStatus === "Cancelled";

    return JOB_STATUS_ORDER.map((status, index) => {
      const done = isCancelled ? status === "Created" : currentIndex >= index;
      const active = !isCancelled && status === currentStatus;

      return {
        status,
        done,
        active,
      };
    });
  }, [currentStatus]);

  return (
    <section className="space-y-3 rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Status Workflow</p>
          <div className="mt-1 flex items-center gap-2">
            <JobStatusBadge status={currentStatus} />
            {currentStatus === "Cancelled" ? (
              <span className="inline-flex items-center gap-1 text-xs text-rose-700">
                <AlertTriangle className="h-3.5 w-3.5" />
                Job cancelled
              </span>
            ) : null}
          </div>
        </div>

        <Button
          disabled={allowedTransitions.length === 0 || isUpdating}
          onClick={() => setOpen(true)}
          size="sm"
          variant="secondary"
        >
          {isUpdating ? "Updating..." : "Update Status"}
        </Button>
      </div>

      <ol className="grid gap-2 md:grid-cols-5">
        {timeline.map((item, index) => (
          <li
            className="relative rounded-md border border-border px-2 py-2 text-xs"
            key={item.status}
          >
            <div className="flex items-center gap-1.5">
              {item.done ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              ) : item.active ? (
                <Clock3 className="h-3.5 w-3.5 text-sky-600" />
              ) : (
                <span className="inline-flex h-3.5 w-3.5 rounded-full border border-border" />
              )}
              <span className={item.active ? "font-semibold text-foreground" : "text-muted-foreground"}>
                {item.status}
              </span>
            </div>
            {index < timeline.length - 1 ? (
              <ArrowRight className="absolute -right-2 top-1/2 hidden h-3 w-3 -translate-y-1/2 text-muted-foreground md:block" />
            ) : null}
          </li>
        ))}
      </ol>

      <Modal
        description="Transitions are restricted to the next valid state."
        onClose={() => setOpen(false)}
        open={open}
        title="Confirm status update"
      >
        {allowedTransitions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No valid transitions available.</p>
        ) : (
          <div className="space-y-4">
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-foreground">Move to</legend>
              {allowedTransitions.map((status) => (
                <label
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
                  key={status}
                >
                  <input
                    checked={effectiveSelectedStatus === status}
                    className="h-4 w-4"
                    name="status"
                    onChange={() => setSelectedStatus(status)}
                    type="radio"
                  />
                  <span>{status}</span>
                </label>
              ))}
            </fieldset>

            <div className="flex justify-end gap-2">
              <Button onClick={() => setOpen(false)} size="sm" variant="secondary">
                Cancel
              </Button>
              <Button
                disabled={!effectiveSelectedStatus || isUpdating}
                onClick={() => {
                  if (!effectiveSelectedStatus) {
                    return;
                  }
                  onConfirm(effectiveSelectedStatus);
                  setOpen(false);
                }}
                size="sm"
              >
                Confirm Update
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
