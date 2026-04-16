"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import type {
  CreateShipmentPayload,
  FreightType,
  ShipmentJobOption,
} from "@/modules/shipments/types";

const createShipmentSchema = z
  .object({
    jobId: z.string().min(1, "Job is required."),
    freightType: z.enum(["Air", "Sea"]),
    trackingNumber: z.string().min(3, "Tracking number is required."),
    departureDate: z.string().min(1, "Departure date is required."),
    eta: z.string().min(1, "ETA is required."),
    originHub: z.string().min(2, "Origin route is required."),
    destinationHub: z.string().min(2, "Destination route is required."),
  })
  .refine((data) => new Date(data.eta).getTime() > new Date(data.departureDate).getTime(), {
    path: ["eta"],
    message: "ETA must be after departure date.",
  });

type ShipmentFormValues = {
  jobId: string;
  freightType: FreightType;
  trackingNumber: string;
  departureDate: string;
  eta: string;
  originHub: string;
  destinationHub: string;
};

type AddShipmentModalProps = {
  open: boolean;
  jobs: ShipmentJobOption[];
  prefilledJobId?: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateShipmentPayload) => void;
};

function defaultJobId(jobs: ShipmentJobOption[], prefilledJobId?: string) {
  if (prefilledJobId) {
    return prefilledJobId;
  }

  return jobs[0]?.jobId ?? "";
}

export function AddShipmentModal({
  open,
  jobs,
  prefilledJobId,
  isSubmitting = false,
  onClose,
  onSubmit,
}: AddShipmentModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useFocusTrap(open, dialogRef);

  const {
    register,
    reset,
    setError,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<ShipmentFormValues>({
    defaultValues: {
      jobId: defaultJobId(jobs, prefilledJobId),
      freightType: "Air",
      trackingNumber: "",
      departureDate: "",
      eta: "",
      originHub: "",
      destinationHub: "",
    },
  });

  const applyRouteFromJob = useCallback(
    (jobId: string) => {
      const selectedJob = jobs.find((item) => item.jobId === jobId);
      if (!selectedJob) {
        return;
      }

      setValue("originHub", selectedJob.originHub, { shouldDirty: true, shouldValidate: true });
      setValue("destinationHub", selectedJob.destinationHub, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [jobs, setValue],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const selectedJobId = defaultJobId(jobs, prefilledJobId);

    reset({
      jobId: selectedJobId,
      freightType: "Air",
      trackingNumber: "",
      departureDate: "",
      eta: "",
      originHub: "",
      destinationHub: "",
    });

    applyRouteFromJob(selectedJobId);
  }, [applyRouteFromJob, jobs, open, prefilledJobId, reset]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (open) {
      document.addEventListener("keydown", onKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  const submitForm = (values: ShipmentFormValues) => {
    const parsed = createShipmentSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      if (fieldErrors.jobId?.[0]) {
        setError("jobId", { message: fieldErrors.jobId[0] });
      }
      if (fieldErrors.trackingNumber?.[0]) {
        setError("trackingNumber", { message: fieldErrors.trackingNumber[0] });
      }
      if (fieldErrors.departureDate?.[0]) {
        setError("departureDate", { message: fieldErrors.departureDate[0] });
      }
      if (fieldErrors.eta?.[0]) {
        setError("eta", { message: fieldErrors.eta[0] });
      }
      if (fieldErrors.originHub?.[0]) {
        setError("originHub", { message: fieldErrors.originHub[0] });
      }
      if (fieldErrors.destinationHub?.[0]) {
        setError("destinationHub", { message: fieldErrors.destinationHub[0] });
      }
      return;
    }

    const selectedJob = jobs.find((item) => item.jobId === parsed.data.jobId);
    if (!selectedJob) {
      setError("jobId", { message: "Select a valid job." });
      return;
    }

    onSubmit({
      ...parsed.data,
      partyId: selectedJob.partyId,
      clientName: selectedJob.clientName,
    });

    onClose();
  };

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            aria-describedby={descriptionId}
            aria-labelledby={titleId}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-2xl rounded-lg border border-border bg-background"
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            onClick={(event) => event.stopPropagation()}
            ref={dialogRef}
            role="dialog"
            tabIndex={-1}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-start justify-between border-b border-border p-4">
              <div>
                <h2 className="section-title text-foreground" id={titleId}>Add Shipment</h2>
                <p className="mt-1 text-sm text-muted-foreground" id={descriptionId}>
                  Link cargo movement details to a live job.
                </p>
              </div>
              <button
                aria-label="Close add shipment modal"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground"
                onClick={onClose}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form className="space-y-3 p-4" onSubmit={handleSubmit(submitForm)}>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="shipment-job-id">
                    Job
                  </label>
                  <select
                    className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                    disabled={Boolean(prefilledJobId)}
                    id="shipment-job-id"
                    {...register("jobId")}
                    onChange={(event) => {
                      setValue("jobId", event.target.value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      applyRouteFromJob(event.target.value);
                    }}
                  >
                    {jobs.map((job) => (
                      <option key={job.jobId} value={job.jobId}>
                        {job.jobId} - {job.clientName}
                      </option>
                    ))}
                  </select>
                  {errors.jobId?.message ? (
                    <p className="text-xs text-danger">{errors.jobId.message}</p>
                  ) : null}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground" htmlFor="freight-type">
                    Freight Type
                  </label>
                  <select
                    className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                    id="freight-type"
                    {...register("freightType")}
                  >
                    <option value="Air">Air</option>
                    <option value="Sea">Sea</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground" htmlFor="tracking-number">
                    Tracking Number
                  </label>
                  <Input id="tracking-number" placeholder="INMAA-AIR-7762" {...register("trackingNumber")} />
                  {errors.trackingNumber?.message ? (
                    <p className="text-xs text-danger">{errors.trackingNumber.message}</p>
                  ) : null}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground" htmlFor="departure-date">
                    Departure Date
                  </label>
                  <Input id="departure-date" type="date" {...register("departureDate")} />
                  {errors.departureDate?.message ? (
                    <p className="text-xs text-danger">{errors.departureDate.message}</p>
                  ) : null}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground" htmlFor="eta-date">
                    ETA
                  </label>
                  <Input id="eta-date" type="date" {...register("eta")} />
                  {errors.eta?.message ? (
                    <p className="text-xs text-danger">{errors.eta.message}</p>
                  ) : null}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground" htmlFor="origin-route">
                    Origin Hub
                  </label>
                  <Input id="origin-route" placeholder="Mumbai Port Hub" {...register("originHub")} />
                  {errors.originHub?.message ? (
                    <p className="text-xs text-danger">{errors.originHub.message}</p>
                  ) : null}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground" htmlFor="destination-route">
                    Destination Hub
                  </label>
                  <Input
                    id="destination-route"
                    placeholder="Dubai Sea Port"
                    {...register("destinationHub")}
                  />
                  {errors.destinationHub?.message ? (
                    <p className="text-xs text-danger">{errors.destinationHub.message}</p>
                  ) : null}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button onClick={onClose} size="sm" type="button" variant="secondary">
                  Cancel
                </Button>
                <Button disabled={isSubmitting} size="sm" type="submit">
                  {isSubmitting ? "Saving..." : "Create Shipment"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
