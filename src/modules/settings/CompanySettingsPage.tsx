"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, ChevronLeft, ChevronRight, Plus, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { settingsService } from "@/services/settingsService";
import type {
  CompanyBusinessType,
  CompanyOperationHub,
  CompanySettings,
  CompanySettingsStatus,
} from "@/modules/settings/types";

const STEP_LABELS = [
  "Company Basic Information",
  "Operations Setup",
  "Trade Flow Configuration",
  "Review & Create",
] as const;

const BUSINESS_TYPE_OPTIONS: CompanyBusinessType[] = [
  "Pharma",
  "Logistics",
  "Agriculture",
  "Textile",
];

const OPERATION_HUB_OPTIONS: CompanyOperationHub[] = [
  "Bangladesh",
  "Pakistan",
  "China",
  "USA",
  "UAE",
  "India",
];

const TRADE_COUNTRY_OPTIONS = ["Bangladesh", "Pakistan", "China", "USA", "UAE", "India"];

function toAutoCompanyCode(name: string) {
  const seed = name
    .split(/\s+/)
    .map((token) => token.replace(/[^A-Za-z0-9]/g, "").slice(0, 1).toUpperCase())
    .join("")
    .slice(0, 3)
    .padEnd(3, "X");

  return `${seed}-001`;
}

function buildDefaultCompanySettings(): CompanySettings {
  return {
    id: "c2",
    companyName: "Alpha Exim",
    code: "ALX-001",
    codeMode: "Auto",
    businessTypes: ["Logistics"],
    logoName: "",
    status: "Active",
    operationStartDate: new Date().toISOString().slice(0, 10),
    mainOperationHub: "Bangladesh",
    locationTags: [],
    importConfig: {
      enabled: true,
      countries: [],
      primarySources: [],
      defaultCurrency: "BDT",
    },
    exportConfig: {
      enabled: true,
      countries: [],
      primaryDestinations: [],
      defaultCurrency: "USD",
    },
  };
}

function includesValue(values: string[], value: string) {
  return values.some((item) => item.toLowerCase() === value.toLowerCase());
}

function toDisplayDate(dateValue: string) {
  if (!dateValue) {
    return "-";
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function CompanySettingsPage() {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [formData, setFormData] = useState<CompanySettings>(buildDefaultCompanySettings);
  const [locationTagInput, setLocationTagInput] = useState("");
  const [importSourceInput, setImportSourceInput] = useState("");
  const [exportDestinationInput, setExportDestinationInput] = useState("");

  const companyQuery = useQuery({
    queryKey: ["settings", "company"],
    queryFn: settingsService.getCompanySettings,
    staleTime: 30_000,
  });

  const updateMutation = useMutation({
    mutationFn: settingsService.updateCompanySettings,
    onSuccess: (next) => {
      queryClient.invalidateQueries({ queryKey: ["settings", "company"] });
      setFormData(next);
      setFeedback(
        next.status === "Draft" ? "Company setup saved as draft." : "Company setup has been saved.",
      );
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Unable to save company setup.";
      setFeedback(message);
    },
  });

  useEffect(() => {
    if (!companyQuery.data) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- Sync query response into local wizard draft state.
    setFormData(companyQuery.data);
  }, [companyQuery.data]);

  const autoCode = useMemo(() => toAutoCompanyCode(formData.companyName), [formData.companyName]);

  const updateField = <K extends keyof CompanySettings>(key: K, value: CompanySettings[K]) => {
    setFormData((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const toggleBusinessType = (value: CompanyBusinessType) => {
    setFormData((previous) => {
      const hasValue = previous.businessTypes.includes(value);
      return {
        ...previous,
        businessTypes: hasValue
          ? previous.businessTypes.filter((type) => type !== value)
          : [...previous.businessTypes, value],
      };
    });
  };

  const toggleCountry = (section: "importConfig" | "exportConfig", value: string) => {
    setFormData((previous) => {
      const hasValue = previous[section].countries.includes(value);
      return {
        ...previous,
        [section]: {
          ...previous[section],
          countries: hasValue
            ? previous[section].countries.filter((country) => country !== value)
            : [...previous[section].countries, value],
        },
      };
    });
  };

  const addLocationTag = () => {
    const nextValue = locationTagInput.trim();
    if (!nextValue || includesValue(formData.locationTags, nextValue)) {
      return;
    }

    setFormData((previous) => ({
      ...previous,
      locationTags: [...previous.locationTags, nextValue],
    }));
    setLocationTagInput("");
  };

  const removeLocationTag = (value: string) => {
    setFormData((previous) => ({
      ...previous,
      locationTags: previous.locationTags.filter((item) => item !== value),
    }));
  };

  const addImportSource = () => {
    const nextValue = importSourceInput.trim();
    if (!nextValue || includesValue(formData.importConfig.primarySources, nextValue)) {
      return;
    }

    setFormData((previous) => ({
      ...previous,
      importConfig: {
        ...previous.importConfig,
        primarySources: [...previous.importConfig.primarySources, nextValue],
      },
    }));
    setImportSourceInput("");
  };

  const removeImportSource = (value: string) => {
    setFormData((previous) => ({
      ...previous,
      importConfig: {
        ...previous.importConfig,
        primarySources: previous.importConfig.primarySources.filter((item) => item !== value),
      },
    }));
  };

  const addExportDestination = () => {
    const nextValue = exportDestinationInput.trim();
    if (!nextValue || includesValue(formData.exportConfig.primaryDestinations, nextValue)) {
      return;
    }

    setFormData((previous) => ({
      ...previous,
      exportConfig: {
        ...previous.exportConfig,
        primaryDestinations: [...previous.exportConfig.primaryDestinations, nextValue],
      },
    }));
    setExportDestinationInput("");
  };

  const removeExportDestination = (value: string) => {
    setFormData((previous) => ({
      ...previous,
      exportConfig: {
        ...previous.exportConfig,
        primaryDestinations: previous.exportConfig.primaryDestinations.filter((item) => item !== value),
      },
    }));
  };

  const validateStep = (step: number) => {
    if (step === 1) {
      if (formData.companyName.trim().length < 2) {
        setFeedback("Company name is required.");
        return false;
      }

      if (formData.code.trim().length < 2) {
        setFeedback("Company code is required.");
        return false;
      }

      if (formData.businessTypes.length === 0) {
        setFeedback("Select at least one business type.");
        return false;
      }
    }

    if (step === 2) {
      if (!formData.operationStartDate) {
        setFeedback("Operation start date is required.");
        return false;
      }

      if (!formData.mainOperationHub) {
        setFeedback("Main operation hub is required.");
        return false;
      }
    }

    if (step === 3) {
      if (formData.importConfig.enabled && formData.importConfig.countries.length === 0) {
        setFeedback("Add at least one import country.");
        return false;
      }

      if (formData.exportConfig.enabled && formData.exportConfig.countries.length === 0) {
        setFeedback("Add at least one export country.");
        return false;
      }
    }

    setFeedback(null);
    return true;
  };

  const goToNextStep = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setCurrentStep((previous) => Math.min(4, previous + 1));
  };

  const saveCompany = (status: CompanySettingsStatus) => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      return;
    }

    updateMutation.mutate({
      ...formData,
      code: formData.codeMode === "Auto" ? autoCode : formData.code,
      status,
    });
  };

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="page-title">Create Company Setup</h1>
        <p className="text-sm text-muted-foreground">
          Complete the 4-step wizard to configure company profile, operations, and trade flow.
        </p>
      </header>

      <section className="rounded-lg border border-border bg-background p-4">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {STEP_LABELS.map((label, index) => {
            const step = index + 1;
            const isActive = step === currentStep;
            const isComplete = step < currentStep;

            return (
              <div className="flex items-center gap-2" key={label}>
                <span
                  className={
                    isComplete
                      ? "inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white"
                      : isActive
                        ? "inline-flex h-7 w-7 items-center justify-center rounded-full border border-accent bg-muted text-xs font-semibold text-foreground"
                        : "inline-flex h-7 w-7 items-center justify-center rounded-full border border-border text-xs font-semibold text-muted-foreground"
                  }
                >
                  {step}
                </span>
                <span className={isActive ? "text-sm font-medium text-foreground" : "text-sm text-muted-foreground"}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {currentStep === 1 ? (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-foreground" htmlFor="company-name">
                  Company Name
                </label>
                <Input
                  id="company-name"
                  onChange={(event) => updateField("companyName", event.target.value)}
                  placeholder="DHAKA STOCK Exchange"
                  value={formData.companyName}
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <p className="text-sm font-medium text-foreground">Company Code</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    onClick={() => updateField("codeMode", "Auto")}
                    size="sm"
                    type="button"
                    variant={formData.codeMode === "Auto" ? "primary" : "secondary"}
                  >
                    Auto
                  </Button>
                  <Button
                    onClick={() => updateField("codeMode", "Manual")}
                    size="sm"
                    type="button"
                    variant={formData.codeMode === "Manual" ? "primary" : "secondary"}
                  >
                    Manual
                  </Button>
                </div>
                <Input
                  disabled={formData.codeMode === "Auto"}
                  onChange={(event) => updateField("code", event.target.value.toUpperCase())}
                  placeholder="Auto-generated"
                  value={formData.codeMode === "Auto" ? autoCode : formData.code}
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-foreground" htmlFor="company-logo">
                  Company Logo
                </label>
                <div className="rounded-md border border-dashed border-border p-3">
                  <label
                    className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-foreground"
                    htmlFor="company-logo"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Logo
                  </label>
                  <input
                    className="sr-only"
                    id="company-logo"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) {
                        return;
                      }

                      updateField("logoName", file.name);
                    }}
                    type="file"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formData.logoName ? `Selected: ${formData.logoName}` : "No logo selected"}
                  </p>
                </div>
              </div>

              <div className="space-y-1 md:col-span-2">
                <p className="text-sm font-medium text-foreground">Business Type</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {BUSINESS_TYPE_OPTIONS.map((option) => (
                    <label
                      className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
                      key={option}
                    >
                      <input
                        checked={formData.businessTypes.includes(option)}
                        onChange={() => toggleBusinessType(option)}
                        type="checkbox"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1 md:col-span-2">
                <p className="text-sm font-medium text-foreground">Status</p>
                <div className="inline-flex rounded-md border border-border p-1">
                  <button
                    className={
                      formData.status === "Active"
                        ? "rounded px-3 py-1 text-sm font-medium text-foreground bg-muted"
                        : "rounded px-3 py-1 text-sm text-muted-foreground"
                    }
                    onClick={() => updateField("status", "Active")}
                    type="button"
                  >
                    Active
                  </button>
                  <button
                    className={
                      formData.status === "Draft"
                        ? "rounded px-3 py-1 text-sm font-medium text-foreground bg-muted"
                        : "rounded px-3 py-1 text-sm text-muted-foreground"
                    }
                    onClick={() => updateField("status", "Draft")}
                    type="button"
                  >
                    Draft
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {currentStep === 2 ? (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground" htmlFor="operation-start-date">
                  Operation Start Date
                </label>
                <Input
                  id="operation-start-date"
                  onChange={(event) => updateField("operationStartDate", event.target.value)}
                  type="date"
                  value={formData.operationStartDate}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground" htmlFor="main-operation-hub">
                  Main Operation Hub
                </label>
                <Input
                  id="main-operation-hub"
                  list="operation-hub-options"
                  onChange={(event) =>
                    updateField("mainOperationHub", event.target.value as CompanyOperationHub)
                  }
                  placeholder="Bangladesh"
                  value={formData.mainOperationHub}
                />
                <datalist id="operation-hub-options">
                  {OPERATION_HUB_OPTIONS.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-1 md:col-span-2">
                <p className="text-sm font-medium text-foreground">Location Tag</p>
                <div className="flex gap-2">
                  <Input
                    onChange={(event) => setLocationTagInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addLocationTag();
                      }
                    }}
                    placeholder="Location Tag"
                    value={locationTagInput}
                  />
                  <Button onClick={addLocationTag} type="button" variant="secondary">
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.locationTags.map((tag) => (
                    <span
                      className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 text-xs text-foreground"
                      key={tag}
                    >
                      {tag}
                      <button
                        aria-label={`Remove ${tag}`}
                        onClick={() => removeLocationTag(tag)}
                        type="button"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {currentStep === 3 ? (
          <div className="space-y-4">
            <div className="grid gap-3 xl:grid-cols-2">
              <section className="rounded-md border border-border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Import Configuration</h3>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      checked={formData.importConfig.enabled}
                      onChange={(event) =>
                        setFormData((previous) => ({
                          ...previous,
                          importConfig: {
                            ...previous.importConfig,
                            enabled: event.target.checked,
                          },
                        }))
                      }
                      type="checkbox"
                    />
                    Enable
                  </label>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Countries
                  </p>
                  <div className="grid gap-1 sm:grid-cols-2">
                    {TRADE_COUNTRY_OPTIONS.map((country) => (
                      <label className="inline-flex items-center gap-2 text-sm" key={country}>
                        <input
                          checked={formData.importConfig.countries.includes(country)}
                          onChange={() => toggleCountry("importConfig", country)}
                          type="checkbox"
                        />
                        {country}
                      </label>
                    ))}
                  </div>

                  <p className="pt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Primary Sources
                  </p>
                  <div className="flex gap-2">
                    <Input
                      onChange={(event) => setImportSourceInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addImportSource();
                        }
                      }}
                      placeholder="Add source"
                      value={importSourceInput}
                    />
                    <Button onClick={addImportSource} type="button" variant="secondary">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.importConfig.primarySources.map((source) => (
                      <span
                        className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 text-xs"
                        key={source}
                      >
                        {source}
                        <button onClick={() => removeImportSource(source)} type="button">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <label className="block pt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Default Currency
                  </label>
                  <select
                    className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        importConfig: {
                          ...previous.importConfig,
                          defaultCurrency: event.target.value as "BDT" | "USD" | "EUR",
                        },
                      }))
                    }
                    value={formData.importConfig.defaultCurrency}
                  >
                    <option value="BDT">BDT</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </section>

              <section className="rounded-md border border-border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Export Configuration</h3>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      checked={formData.exportConfig.enabled}
                      onChange={(event) =>
                        setFormData((previous) => ({
                          ...previous,
                          exportConfig: {
                            ...previous.exportConfig,
                            enabled: event.target.checked,
                          },
                        }))
                      }
                      type="checkbox"
                    />
                    Enable
                  </label>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Countries
                  </p>
                  <div className="grid gap-1 sm:grid-cols-2">
                    {TRADE_COUNTRY_OPTIONS.map((country) => (
                      <label className="inline-flex items-center gap-2 text-sm" key={country}>
                        <input
                          checked={formData.exportConfig.countries.includes(country)}
                          onChange={() => toggleCountry("exportConfig", country)}
                          type="checkbox"
                        />
                        {country}
                      </label>
                    ))}
                  </div>

                  <p className="pt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Primary Destinations
                  </p>
                  <div className="flex gap-2">
                    <Input
                      onChange={(event) => setExportDestinationInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addExportDestination();
                        }
                      }}
                      placeholder="Add destination"
                      value={exportDestinationInput}
                    />
                    <Button onClick={addExportDestination} type="button" variant="secondary">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.exportConfig.primaryDestinations.map((destination) => (
                      <span
                        className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 text-xs"
                        key={destination}
                      >
                        {destination}
                        <button onClick={() => removeExportDestination(destination)} type="button">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <label className="block pt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Default Currency
                  </label>
                  <select
                    className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        exportConfig: {
                          ...previous.exportConfig,
                          defaultCurrency: event.target.value as "BDT" | "USD" | "EUR",
                        },
                      }))
                    }
                    value={formData.exportConfig.defaultCurrency}
                  >
                    <option value="USD">USD</option>
                    <option value="BDT">BDT</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </section>
            </div>

            <section className="rounded-md border border-border bg-muted/30 p-4">
              <p className="mb-3 text-sm font-semibold text-foreground">Hub Logic Diagram</p>
              <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
                <div className="space-y-2">
                  {formData.importConfig.countries.slice(0, 3).map((country) => (
                    <div className="rounded-md border border-border bg-background px-2 py-1 text-xs" key={country}>
                      {country}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">→</span>
                <div className="rounded-full border border-accent bg-background px-3 py-2 text-center text-xs font-medium text-foreground">
                  {formData.mainOperationHub || "Main Hub"}
                </div>
                <span className="text-sm text-muted-foreground">→</span>
                <div className="space-y-2">
                  {formData.exportConfig.countries.slice(0, 3).map((country) => (
                    <div className="rounded-md border border-border bg-background px-2 py-1 text-xs" key={country}>
                      {country}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        ) : null}

        {currentStep === 4 ? (
          <div className="grid gap-3 lg:grid-cols-2">
            <section className="rounded-md border border-border p-3">
              <h3 className="mb-2 text-sm font-semibold text-foreground">Company Summary</h3>
              <dl className="grid gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="font-medium text-foreground">{formData.companyName || "-"}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Business Type</dt>
                  <dd className="font-medium text-foreground">
                    {formData.businessTypes.join(", ") || "-"}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Start Date</dt>
                  <dd className="font-medium text-foreground">{toDisplayDate(formData.operationStartDate)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Main Hub</dt>
                  <dd className="font-medium text-foreground">{formData.mainOperationHub || "-"}</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-md border border-border p-3">
              <h3 className="mb-2 text-sm font-semibold text-foreground">Trade Setup Summary</h3>
              <dl className="grid gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Import Enabled</dt>
                  <dd className="font-medium text-foreground">
                    {formData.importConfig.enabled ? "Yes" : "No"}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Import Countries</dt>
                  <dd className="font-medium text-foreground">{formData.importConfig.countries.length}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Export Enabled</dt>
                  <dd className="font-medium text-foreground">
                    {formData.exportConfig.enabled ? "Yes" : "No"}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Export Countries</dt>
                  <dd className="font-medium text-foreground">{formData.exportConfig.countries.length}</dd>
                </div>
              </dl>
            </section>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">
            {feedback ?? "Follow the stepper to complete company setup."}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              disabled={currentStep === 1}
              onClick={() => setCurrentStep((previous) => Math.max(1, previous - 1))}
              type="button"
              variant="secondary"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>

            {currentStep < 4 ? (
              <Button onClick={goToNextStep} type="button">
                Next Step
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button
                  disabled={updateMutation.isPending || companyQuery.isLoading}
                  onClick={() => saveCompany("Draft")}
                  type="button"
                  variant="secondary"
                >
                  Save as Draft
                </Button>
                <Button
                  disabled={updateMutation.isPending || companyQuery.isLoading}
                  onClick={() => saveCompany("Active")}
                  type="button"
                >
                  <Building2 className="h-4 w-4" />
                  {updateMutation.isPending ? "Saving..." : "Create Company"}
                </Button>
              </>
            )}
          </div>
        </div>
      </section>
    </section>
  );
}
