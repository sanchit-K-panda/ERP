"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import type { CreatePartyPayload, PartyRecord, PartyType } from "@/modules/parties/types";

const partySchema = z.object({
  name: z.string().min(2, "Name is required."),
  type: z.enum(["Client", "Vendor", "Agent", "Broker"]),
  email: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || z.string().email().safeParse(value).success, {
      message: "Enter a valid email.",
    }),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^\+?[0-9\-\s]{7,20}$/.test(value), {
      message: "Enter a valid phone number.",
    }),
  country: z.string().min(2, "Country is required."),
  address: z.string().optional(),
});

type PartyFormValues = {
  name: string;
  type: PartyType;
  email: string;
  phone: string;
  country: string;
  address: string;
};

type AddEditPartyModalProps = {
  open: boolean;
  initialParty?: PartyRecord | null;
  isSaving?: boolean;
  onClose: () => void;
  onSubmit: (payload: CreatePartyPayload) => void;
};

export function AddEditPartyModal({
  open,
  initialParty,
  isSaving = false,
  onClose,
  onSubmit,
}: AddEditPartyModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useFocusTrap(open, dialogRef);

  const {
    register,
    reset,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm<PartyFormValues>({
    defaultValues: {
      name: "",
      type: "Client",
      email: "",
      phone: "",
      country: "India",
      address: "",
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      name: initialParty?.name ?? "",
      type: initialParty?.type ?? "Client",
      email: initialParty?.email ?? "",
      phone: initialParty?.phone ?? "",
      country: initialParty?.country ?? "India",
      address: initialParty?.address ?? "",
    });
  }, [initialParty, open, reset]);

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

  const submitForm = (values: PartyFormValues) => {
    const parsed = partySchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;

      if (fieldErrors.name?.[0]) {
        setError("name", { message: fieldErrors.name[0] });
      }
      if (fieldErrors.type?.[0]) {
        setError("type", { message: fieldErrors.type[0] });
      }
      if (fieldErrors.email?.[0]) {
        setError("email", { message: fieldErrors.email[0] });
      }
      if (fieldErrors.phone?.[0]) {
        setError("phone", { message: fieldErrors.phone[0] });
      }
      if (fieldErrors.country?.[0]) {
        setError("country", { message: fieldErrors.country[0] });
      }
      return;
    }

    onSubmit({
      ...parsed.data,
      email: parsed.data.email?.trim() || undefined,
      phone: parsed.data.phone?.trim() || undefined,
      address: parsed.data.address?.trim() || undefined,
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
                <h2 className="section-title text-foreground" id={titleId}>
                  {initialParty ? "Edit Party" : "Add Party"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground" id={descriptionId}>
                  Maintain CRM contacts for jobs, shipments, and finance.
                </p>
              </div>
              <button
                aria-label="Close party modal"
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
                  <label className="text-sm font-medium text-foreground" htmlFor="party-name">
                    Name
                  </label>
                  <Input id="party-name" placeholder="Party name" {...register("name")} />
                  {errors.name?.message ? (
                    <p className="text-xs text-danger">{errors.name.message}</p>
                  ) : null}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground" htmlFor="party-type">
                    Type
                  </label>
                  <select
                    className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                    id="party-type"
                    {...register("type")}
                  >
                    <option value="Client">Client</option>
                    <option value="Vendor">Vendor</option>
                    <option value="Agent">Agent</option>
                    <option value="Broker">Broker</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground" htmlFor="party-country">
                    Country
                  </label>
                  <Input id="party-country" placeholder="Country" {...register("country")} />
                  {errors.country?.message ? (
                    <p className="text-xs text-danger">{errors.country.message}</p>
                  ) : null}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground" htmlFor="party-email">
                    Email
                  </label>
                  <Input id="party-email" placeholder="email@example.com" {...register("email")} />
                  {errors.email?.message ? (
                    <p className="text-xs text-danger">{errors.email.message}</p>
                  ) : null}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground" htmlFor="party-phone">
                    Phone
                  </label>
                  <Input id="party-phone" placeholder="+91-9XXXXXXXXX" {...register("phone")} />
                  {errors.phone?.message ? (
                    <p className="text-xs text-danger">{errors.phone.message}</p>
                  ) : null}
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="party-address">
                    Address
                  </label>
                  <textarea
                    className="min-h-20 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    id="party-address"
                    placeholder="Address"
                    {...register("address")}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button onClick={onClose} size="sm" type="button" variant="secondary">
                  Cancel
                </Button>
                <Button disabled={isSaving} size="sm" type="submit">
                  {isSaving ? "Saving..." : initialParty ? "Update Party" : "Create Party"}
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
