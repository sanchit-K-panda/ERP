"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { PartySelector } from "@/modules/parties/components/PartySelector";
import type { PartySearchResult } from "@/modules/parties/types";
import type {
  CreateTransactionPayload,
  CurrencyCode,
  TransactionJobOption,
  TransactionType,
} from "@/modules/finance/types";
import { TRANSACTION_CATEGORIES } from "@/modules/finance/types";

const createTransactionSchema = z.object({
  type: z.enum(["Income", "Expense"]),
  amount: z.number().positive("Amount must be greater than zero."),
  currency: z.enum(["BDT"]),
  category: z.string().min(2, "Category is required."),
  partyId: z.string().optional(),
  partyName: z.string().min(2, "Party is required."),
  jobId: z.string().optional(),
  date: z.string().min(1, "Date is required."),
  description: z.string().min(2, "Description is required."),
});

type TransactionFormValues = {
  type: TransactionType;
  amount: string;
  currency: CurrencyCode;
  category: string;
  partyId: string;
  partyName: string;
  jobId: string;
  date: string;
  description: string;
};

type AddTransactionModalProps = {
  open: boolean;
  jobs: TransactionJobOption[];
  isSubmitting?: boolean;
  prefilledJobId?: string;
  forceType?: TransactionType;
  onClose: () => void;
  onSubmit: (payload: CreateTransactionPayload) => void;
};

function resolveDefaultJobId(jobs: TransactionJobOption[], prefilledJobId?: string) {
  if (prefilledJobId) {
    return prefilledJobId;
  }

  return "";
}

export function AddTransactionModal({
  open,
  jobs,
  isSubmitting = false,
  prefilledJobId,
  forceType,
  onClose,
  onSubmit,
}: AddTransactionModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useFocusTrap(open, dialogRef);

  const [selectedParty, setSelectedParty] = useState<{ id: string; name: string }>({
    id: "",
    name: "",
  });

  const {
    register,
    reset,
    setError,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    defaultValues: {
      type: forceType ?? "Income",
      amount: "",
      currency: "BDT",
      category: "",
      partyId: "",
      partyName: "",
      jobId: resolveDefaultJobId(jobs, prefilledJobId),
      date: new Date().toISOString().slice(0, 10),
      description: "",
    },
  });

  const syncPartyFromJob = useCallback(
    (jobId: string) => {
      if (!jobId) {
        setSelectedParty({ id: "", name: "" });
        setValue("partyId", "", {
          shouldDirty: true,
          shouldValidate: true,
        });
        setValue("partyName", "", {
          shouldDirty: true,
          shouldValidate: true,
        });
        return;
      }

      const selected = jobs.find((item) => item.jobId === jobId);
      if (!selected) {
        return;
      }

      setSelectedParty({
        id: selected.partyId ?? "",
        name: selected.clientName,
      });

      setValue("partyId", selected.partyId ?? "", {
        shouldDirty: true,
        shouldValidate: true,
      });

      setValue("partyName", selected.clientName, {
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

    const defaultJobId = resolveDefaultJobId(jobs, prefilledJobId);

    reset({
      type: forceType ?? "Income",
      amount: "",
      currency: "BDT",
      category: "",
      partyId: "",
      partyName: "",
      jobId: defaultJobId,
      date: new Date().toISOString().slice(0, 10),
      description: "",
    });

    const timeout = window.setTimeout(() => {
      syncPartyFromJob(defaultJobId);
    }, 0);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [forceType, jobs, open, prefilledJobId, reset, syncPartyFromJob]);

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

  const submitForm = (values: TransactionFormValues) => {
    const parsed = createTransactionSchema.safeParse({
      ...values,
      amount: Number(values.amount),
      partyId: values.partyId || undefined,
      jobId: values.jobId || undefined,
      type: forceType ?? values.type,
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      if (fieldErrors.type?.[0]) {
        setError("type", { message: fieldErrors.type[0] });
      }
      if (fieldErrors.amount?.[0]) {
        setError("amount", { message: fieldErrors.amount[0] });
      }
      if (fieldErrors.category?.[0]) {
        setError("category", { message: fieldErrors.category[0] });
      }
      if (fieldErrors.partyName?.[0]) {
        setError("partyName", { message: fieldErrors.partyName[0] });
      }
      if (fieldErrors.date?.[0]) {
        setError("date", { message: fieldErrors.date[0] });
      }
      if (fieldErrors.description?.[0]) {
        setError("description", { message: fieldErrors.description[0] });
      }
      return;
    }

    onSubmit(parsed.data);
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
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            onClick={(event) => event.stopPropagation()}
            ref={dialogRef}
            role="dialog"
            tabIndex={-1}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-start justify-between border-b border-border p-4">
              <div>
                <h2 className="section-title text-foreground" id={titleId}>Add Transaction</h2>
                <p className="mt-1 text-sm text-muted-foreground" id={descriptionId}>
                  Record an income or expense movement.
                </p>
              </div>
              <button
                aria-label="Close add transaction modal"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground"
                onClick={onClose}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form className="space-y-3 p-4" onSubmit={handleSubmit(submitForm)}>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground" htmlFor="transaction-type">
                    Type
                  </label>
                  <select
                    className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                    disabled={Boolean(forceType)}
                    id="transaction-type"
                    {...register("type")}
                  >
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </select>
                  {errors.type?.message ? (
                    <p className="text-xs text-danger">{errors.type.message}</p>
                  ) : null}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground" htmlFor="transaction-amount">
                    Amount
                  </label>
                  <Input id="transaction-amount" placeholder="0.00" {...register("amount")} />
                  {errors.amount?.message ? (
                    <p className="text-xs text-danger">{errors.amount.message}</p>
                  ) : null}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground" htmlFor="transaction-currency">
                    Currency
                  </label>
                  <select
                    className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                    id="transaction-currency"
                    {...register("currency")}
                  >
                    <option value="BDT">BDT</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground" htmlFor="transaction-category">
                    Category
                  </label>
                  <select
                    className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                    id="transaction-category"
                    {...register("category")}
                  >
                    <option value="">Select category</option>
                    {TRANSACTION_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.category?.message ? (
                    <p className="text-xs text-danger">{errors.category.message}</p>
                  ) : null}
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="transaction-party">
                    Party
                  </label>
                  <input type="hidden" {...register("partyId")} />
                  <input type="hidden" {...register("partyName")} />
                  <PartySelector
                    inputId="transaction-party"
                    onClear={() => {
                      setSelectedParty({ id: "", name: "" });
                      setValue("partyId", "", {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      setValue("partyName", "", {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                    onSelect={(party: PartySearchResult) => {
                      setSelectedParty({ id: party.id, name: party.name });
                      setValue("partyId", party.id, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      setValue("partyName", party.name, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                    valueId={selectedParty.id}
                    valueName={selectedParty.name}
                  />
                  {errors.partyName?.message ? (
                    <p className="text-xs text-danger">{errors.partyName.message}</p>
                  ) : null}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground" htmlFor="transaction-job-id">
                    Job (optional)
                  </label>
                  <select
                    className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                    id="transaction-job-id"
                    {...register("jobId")}
                    onChange={(event) => {
                      setValue("jobId", event.target.value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      syncPartyFromJob(event.target.value);
                    }}
                  >
                    <option value="">No job linked</option>
                    {jobs.map((job) => (
                      <option key={job.jobId} value={job.jobId}>
                        {job.jobId} - {job.clientName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground" htmlFor="transaction-date">
                    Date
                  </label>
                  <Input id="transaction-date" type="date" {...register("date")} />
                  {errors.date?.message ? (
                    <p className="text-xs text-danger">{errors.date.message}</p>
                  ) : null}
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="transaction-description">
                    Description
                  </label>
                  <textarea
                    className="min-h-20 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    id="transaction-description"
                    placeholder="Short transaction note"
                    {...register("description")}
                  />
                  {errors.description?.message ? (
                    <p className="text-xs text-danger">{errors.description.message}</p>
                  ) : null}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button onClick={onClose} size="sm" type="button" variant="secondary">
                  Cancel
                </Button>
                <Button disabled={isSubmitting} size="sm" type="submit">
                  {isSubmitting ? "Saving..." : "Add Transaction"}
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
