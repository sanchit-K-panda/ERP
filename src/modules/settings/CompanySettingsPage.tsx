"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Building2, Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { settingsService } from "@/services/settingsService";
import type { CompanySettings, CompanySettingsStatus } from "@/modules/settings/types";

const companySettingsSchema = z.object({
  companyName: z.string().trim().min(2, "Company name is required."),
  code: z.string().trim().min(2, "Code is required."),
  businessType: z.string().trim().min(2, "Business type is required."),
  logoName: z.string().optional(),
  status: z.enum(["Active", "Draft"]),
});

type CompanyFormValues = {
  companyName: string;
  code: string;
  businessType: string;
  logoName: string;
  status: CompanySettingsStatus;
};

export function CompanySettingsPage() {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<string | null>(null);

  const companyQuery = useQuery({
    queryKey: ["settings", "company"],
    queryFn: settingsService.getCompanySettings,
    staleTime: 30_000,
  });

  const updateMutation = useMutation({
    mutationFn: settingsService.updateCompanySettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "company"] });
      setFeedback("Company settings have been saved.");
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors },
  } = useForm<CompanyFormValues>({
    defaultValues: {
      companyName: "",
      code: "",
      businessType: "",
      logoName: "",
      status: "Draft",
    },
  });

  useEffect(() => {
    if (!companyQuery.data) {
      return;
    }

    reset({
      companyName: companyQuery.data.companyName,
      code: companyQuery.data.code,
      businessType: companyQuery.data.businessType,
      logoName: companyQuery.data.logoName ?? "",
      status: companyQuery.data.status,
    });
  }, [companyQuery.data, reset]);

  const onSubmit = (values: CompanyFormValues) => {
    setFeedback(null);

    const parsed = companySettingsSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      if (fieldErrors.companyName?.[0]) {
        setError("companyName", { message: fieldErrors.companyName[0] });
      }
      if (fieldErrors.code?.[0]) {
        setError("code", { message: fieldErrors.code[0] });
      }
      if (fieldErrors.businessType?.[0]) {
        setError("businessType", { message: fieldErrors.businessType[0] });
      }
      return;
    }

    const payload: CompanySettings = {
      companyName: parsed.data.companyName,
      code: parsed.data.code,
      businessType: parsed.data.businessType,
      logoName: parsed.data.logoName?.trim() || undefined,
      status: parsed.data.status,
    };

    updateMutation.mutate(payload);
  };

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="page-title">Company Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure company identity, business profile, and operational status.
        </p>
      </header>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <section className="rounded-lg border border-border bg-background p-4">
          <div className="mb-3 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Company Profile</h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-foreground" htmlFor="company-name">
                Company Name
              </label>
              <Input id="company-name" placeholder="Company name" {...register("companyName")} />
              {errors.companyName?.message ? (
                <p className="text-xs text-danger">{errors.companyName.message}</p>
              ) : null}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground" htmlFor="company-code">
                Code
              </label>
              <Input id="company-code" placeholder="SCS-001" {...register("code")} />
              {errors.code?.message ? <p className="text-xs text-danger">{errors.code.message}</p> : null}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground" htmlFor="company-type">
                Business Type
              </label>
              <Input
                id="company-type"
                placeholder="Logistics & Trading"
                {...register("businessType")}
              />
              {errors.businessType?.message ? (
                <p className="text-xs text-danger">{errors.businessType.message}</p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-background p-4">
          <div className="mb-3 flex items-center gap-2">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Branding & Status</h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground" htmlFor="company-logo">
                Logo Upload (UI only)
              </label>
              <input
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                id="company-logo"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) {
                    return;
                  }

                  setValue("logoName", file.name, { shouldDirty: true });
                }}
                type="file"
              />
              <Input readOnly {...register("logoName")} />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground" htmlFor="company-status">
                Status
              </label>
              <select
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                id="company-status"
                {...register("status")}
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {feedback ?? "Changes are applied to mock service state."}
          </p>
          <Button disabled={updateMutation.isPending || companyQuery.isLoading} type="submit">
            <Save className="h-4 w-4" />
            {updateMutation.isPending ? "Saving..." : "Save Company Settings"}
          </Button>
        </div>
      </form>
    </section>
  );
}
