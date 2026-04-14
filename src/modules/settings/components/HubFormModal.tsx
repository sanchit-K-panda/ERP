"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import {
  HUB_TYPE_OPTIONS,
  type HubRecord,
  type HubType,
  type UpsertHubPayload,
} from "@/modules/settings/types";

const hubSchema = z.object({
  name: z.string().trim().min(2, "Hub name is required."),
  country: z.string().trim().min(2, "Country is required."),
  city: z.string().trim().min(2, "City is required."),
  type: z.enum(HUB_TYPE_OPTIONS),
  enabled: z.boolean(),
});

type HubFormValues = {
  name: string;
  country: string;
  city: string;
  type: HubType;
  enabled: boolean;
};

type HubFormModalProps = {
  open: boolean;
  initialHub?: HubRecord | null;
  isSaving?: boolean;
  onClose: () => void;
  onSubmit: (payload: UpsertHubPayload) => void;
};

export function HubFormModal({
  open,
  initialHub,
  isSaving = false,
  onClose,
  onSubmit,
}: HubFormModalProps) {
  const isEditMode = Boolean(initialHub);

  const {
    register,
    reset,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm<HubFormValues>({
    defaultValues: {
      name: "",
      country: "",
      city: "",
      type: "Origin",
      enabled: true,
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      name: initialHub?.name ?? "",
      country: initialHub?.country ?? "",
      city: initialHub?.city ?? "",
      type: initialHub?.type ?? "Origin",
      enabled: initialHub?.enabled ?? true,
    });
  }, [initialHub, open, reset]);

  const submitForm = (values: HubFormValues) => {
    const parsed = hubSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      if (fieldErrors.name?.[0]) {
        setError("name", { message: fieldErrors.name[0] });
      }
      if (fieldErrors.country?.[0]) {
        setError("country", { message: fieldErrors.country[0] });
      }
      if (fieldErrors.city?.[0]) {
        setError("city", { message: fieldErrors.city[0] });
      }
      if (fieldErrors.type?.[0]) {
        setError("type", { message: fieldErrors.type[0] });
      }
      return;
    }

    onSubmit(parsed.data);
  };

  return (
    <Modal
      description={
        isEditMode
          ? "Update location profile and operational state for this hub."
          : "Register a new operational hub for routing and execution."
      }
      onClose={onClose}
      open={open}
      title={isEditMode ? "Edit Hub" : "Add Hub"}
    >
      <form className="space-y-3" onSubmit={handleSubmit(submitForm)}>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium text-foreground" htmlFor="hub-name">
              Name
            </label>
            <Input id="hub-name" placeholder="Hub name" {...register("name")} />
            {errors.name?.message ? <p className="text-xs text-danger">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="hub-country">
              Country
            </label>
            <Input id="hub-country" placeholder="Country" {...register("country")} />
            {errors.country?.message ? (
              <p className="text-xs text-danger">{errors.country.message}</p>
            ) : null}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="hub-city">
              City
            </label>
            <Input id="hub-city" placeholder="City" {...register("city")} />
            {errors.city?.message ? <p className="text-xs text-danger">{errors.city.message}</p> : null}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="hub-type">
              Type
            </label>
            <select
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
              id="hub-type"
              {...register("type")}
            >
              {HUB_TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="hub-enabled">
              Enabled
            </label>
            <select
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
              id="hub-enabled"
              {...register("enabled", {
                setValueAs: (value) => value === "true" || value === true,
              })}
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-3">
          <Button onClick={onClose} size="sm" type="button" variant="secondary">
            Cancel
          </Button>
          <Button disabled={isSaving} size="sm" type="submit">
            {isSaving ? "Saving..." : isEditMode ? "Update Hub" : "Create Hub"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
