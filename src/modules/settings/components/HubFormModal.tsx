"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import {
  HUB_TYPE_OPTIONS,
  type HubRecord,
  type HubType,
  type UpsertHubPayload,
} from "@/modules/settings/types";

const STEP_TITLES = [
  "Hub Basic Info",
  "Operation Settings",
  "Trade Connections",
  "Review",
] as const;

const COUNTRY_OPTIONS = ["Bangladesh", "Pakistan", "China", "USA", "UAE", "India"];

const HUB_CONNECTION_OPTIONS = [
  "Mumbai Port Hub",
  "Dhaka Air Cargo",
  "Chittagong Sea Port",
  "Dubai Sea Port",
  "Karachi Port",
  "Singapore Sea Port",
];

function toAutoHubCode(name: string) {
  const seed = name.replace(/[^A-Za-z0-9]/g, "").slice(0, 3).toUpperCase().padEnd(3, "X");
  return `${seed}-001`;
}

function createDefaultPayload(initialHub?: HubRecord | null): UpsertHubPayload {
  if (initialHub) {
    return {
      name: initialHub.name,
      hubCode: initialHub.hubCode,
      country: initialHub.country,
      city: initialHub.city,
      type: initialHub.type,
      enabled: initialHub.enabled,
      operationSettings: {
        ...initialHub.operationSettings,
      },
      tradeConnections: {
        ...initialHub.tradeConnections,
      },
    };
  }

  return {
    name: "",
    hubCode: "",
    country: "Bangladesh",
    city: "",
    type: "HQ",
    enabled: true,
    operationSettings: {
      enableImport: true,
      enableExport: false,
      enableTransit: false,
      financialControlHub: true,
      inventoryControlHub: true,
      activeStatus: true,
    },
    tradeConnections: {
      importCountries: [],
      importAdditional: [],
      importHubs: [],
      exportCountries: [],
      exportAdditional: [],
      exportHubs: [],
    },
  };
}

function includesValue(values: string[], value: string) {
  return values.some((item) => item.toLowerCase() === value.toLowerCase());
}

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
  const [currentStep, setCurrentStep] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpsertHubPayload>(() => createDefaultPayload(initialHub));
  const [importAdditionalInput, setImportAdditionalInput] = useState("");
  const [exportAdditionalInput, setExportAdditionalInput] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- Resetting wizard step on modal open.
    setCurrentStep(1);
    setFeedback(null);
    setImportAdditionalInput("");
    setExportAdditionalInput("");
    setFormData(createDefaultPayload(initialHub));
  }, [initialHub, open]);

  const autoHubCode = useMemo(() => toAutoHubCode(formData.name), [formData.name]);

  const updateField = <K extends keyof UpsertHubPayload>(key: K, value: UpsertHubPayload[K]) => {
    setFormData((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const updateOperationFlag = (key: keyof UpsertHubPayload["operationSettings"], value: boolean) => {
    setFormData((previous) => ({
      ...previous,
      enabled: key === "activeStatus" ? value : previous.enabled,
      operationSettings: {
        ...previous.operationSettings,
        [key]: value,
      },
    }));
  };

  const toggleConnectionValue = (
    key: keyof UpsertHubPayload["tradeConnections"],
    value: string,
  ) => {
    setFormData((previous) => {
      const hasValue = previous.tradeConnections[key].includes(value);

      return {
        ...previous,
        tradeConnections: {
          ...previous.tradeConnections,
          [key]: hasValue
            ? previous.tradeConnections[key].filter((item) => item !== value)
            : [...previous.tradeConnections[key], value],
        },
      };
    });
  };

  const addConnectionTag = (
    key: "importAdditional" | "exportAdditional",
    value: string,
    clear: () => void,
  ) => {
    const nextValue = value.trim();
    if (!nextValue || includesValue(formData.tradeConnections[key], nextValue)) {
      return;
    }

    setFormData((previous) => ({
      ...previous,
      tradeConnections: {
        ...previous.tradeConnections,
        [key]: [...previous.tradeConnections[key], nextValue],
      },
    }));

    clear();
  };

  const removeConnectionTag = (key: "importAdditional" | "exportAdditional", value: string) => {
    setFormData((previous) => ({
      ...previous,
      tradeConnections: {
        ...previous.tradeConnections,
        [key]: previous.tradeConnections[key].filter((item) => item !== value),
      },
    }));
  };

  const validateStep = (step: number) => {
    if (step === 1) {
      if (formData.name.trim().length < 2) {
        setFeedback("Hub name is required.");
        return false;
      }

      if (formData.country.trim().length < 2) {
        setFeedback("Country is required.");
        return false;
      }

      if (formData.city.trim().length < 2) {
        setFeedback("City is required.");
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

  const submit = (asDraft: boolean) => {
    if (!validateStep(1)) {
      return;
    }

    const payload: UpsertHubPayload = {
      ...formData,
      name: formData.name.trim(),
      hubCode: (formData.hubCode || autoHubCode).trim().toUpperCase(),
      country: formData.country.trim(),
      city: formData.city.trim(),
      enabled: asDraft ? false : formData.operationSettings.activeStatus,
      operationSettings: {
        ...formData.operationSettings,
        activeStatus: asDraft ? false : formData.operationSettings.activeStatus,
      },
    };

    onSubmit(payload);
    onClose();
  };

  return (
    <Modal
      description="Define operational logistics center for company network"
      onClose={onClose}
      open={open}
      title="Create New Hub"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          {STEP_TITLES.map((title, index) => {
            const step = index + 1;
            const isActive = step === currentStep;
            const isComplete = step < currentStep;

            return (
              <div className="flex items-center gap-2" key={title}>
                <span
                  className={
                    isComplete
                      ? "inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white"
                      : isActive
                        ? "inline-flex h-7 w-7 items-center justify-center rounded-full border border-accent bg-muted text-foreground"
                        : "inline-flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground"
                  }
                >
                  {isComplete ? <Check className="h-4 w-4" /> : step}
                </span>
                <span className={isActive ? "text-sm font-medium text-foreground" : "text-sm text-muted-foreground"}>
                  {title}
                </span>
              </div>
            );
          })}
        </div>

        {currentStep === 1 ? (
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-foreground" htmlFor="hub-name">
                Hub Name
              </label>
              <Input
                id="hub-name"
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Hub Name"
                value={formData.name}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground" htmlFor="hub-country">
                Country
              </label>
              <Input
                id="hub-country"
                list="hub-country-options"
                onChange={(event) => updateField("country", event.target.value)}
                value={formData.country}
              />
              <datalist id="hub-country-options">
                {COUNTRY_OPTIONS.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground" htmlFor="hub-city">
                City
              </label>
              <Input
                id="hub-city"
                onChange={(event) => updateField("city", event.target.value)}
                placeholder="City"
                value={formData.city}
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-foreground" htmlFor="hub-code">
                Hub Code
              </label>
              <Input id="hub-code" readOnly value={formData.hubCode || autoHubCode} />
            </div>

            <div className="space-y-1 md:col-span-2">
              <p className="text-sm font-medium text-foreground">Hub Type</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {HUB_TYPE_OPTIONS.map((type) => (
                  <label
                    className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
                    key={type}
                  >
                    <input
                      checked={formData.type === type}
                      onChange={() => updateField("type", type as HubType)}
                      type="radio"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {currentStep === 2 ? (
          <div className="grid gap-2 md:grid-cols-2">
            <label className="inline-flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
              Enable Import
              <input
                checked={formData.operationSettings.enableImport}
                onChange={(event) => updateOperationFlag("enableImport", event.target.checked)}
                type="checkbox"
              />
            </label>
            <label className="inline-flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
              Enable Export
              <input
                checked={formData.operationSettings.enableExport}
                onChange={(event) => updateOperationFlag("enableExport", event.target.checked)}
                type="checkbox"
              />
            </label>
            <label className="inline-flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
              Enable Transit
              <input
                checked={formData.operationSettings.enableTransit}
                onChange={(event) => updateOperationFlag("enableTransit", event.target.checked)}
                type="checkbox"
              />
            </label>
            <label className="inline-flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
              Financial Control Hub
              <input
                checked={formData.operationSettings.financialControlHub}
                onChange={(event) =>
                  updateOperationFlag("financialControlHub", event.target.checked)
                }
                type="checkbox"
              />
            </label>
            <label className="inline-flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
              Inventory Control Hub
              <input
                checked={formData.operationSettings.inventoryControlHub}
                onChange={(event) =>
                  updateOperationFlag("inventoryControlHub", event.target.checked)
                }
                type="checkbox"
              />
            </label>
            <label className="inline-flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
              Active Status
              <input
                checked={formData.operationSettings.activeStatus}
                onChange={(event) => updateOperationFlag("activeStatus", event.target.checked)}
                type="checkbox"
              />
            </label>
          </div>
        ) : null}

        {currentStep === 3 ? (
          <div className="space-y-4">
            <div className="grid gap-3 xl:grid-cols-[1fr_auto_1fr] xl:items-start">
              <section className="space-y-2 rounded-md border border-border p-3">
                <h3 className="text-sm font-semibold text-foreground">Import Settings</h3>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Allowed Import Countries
                </p>
                <div className="grid gap-1 sm:grid-cols-2">
                  {COUNTRY_OPTIONS.map((country) => (
                    <label className="inline-flex items-center gap-2 text-sm" key={country}>
                      <input
                        checked={formData.tradeConnections.importCountries.includes(country)}
                        onChange={() => toggleConnectionValue("importCountries", country)}
                        type="checkbox"
                      />
                      {country}
                    </label>
                  ))}
                </div>

                <p className="pt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Additional Import Config
                </p>
                <div className="flex gap-2">
                  <Input
                    onChange={(event) => setImportAdditionalInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addConnectionTag("importAdditional", importAdditionalInput, () =>
                          setImportAdditionalInput(""),
                        );
                      }
                    }}
                    placeholder="Multi-Select..."
                    value={importAdditionalInput}
                  />
                  <Button
                    onClick={() =>
                      addConnectionTag("importAdditional", importAdditionalInput, () =>
                        setImportAdditionalInput(""),
                      )
                    }
                    type="button"
                    variant="secondary"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tradeConnections.importAdditional.map((item) => (
                    <span
                      className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 text-xs"
                      key={item}
                    >
                      {item}
                      <button onClick={() => removeConnectionTag("importAdditional", item)} type="button">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <p className="pt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Allowed Import Hubs
                </p>
                <div className="grid gap-1 sm:grid-cols-2">
                  {HUB_CONNECTION_OPTIONS.map((hub) => (
                    <label className="inline-flex items-center gap-2 text-sm" key={hub}>
                      <input
                        checked={formData.tradeConnections.importHubs.includes(hub)}
                        onChange={() => toggleConnectionValue("importHubs", hub)}
                        type="checkbox"
                      />
                      {hub}
                    </label>
                  ))}
                </div>
              </section>

              <div className="hidden h-full items-center justify-center xl:flex">
                <div className="space-y-2 text-center">
                  <div className="mx-auto h-20 w-20 rounded-full bg-blue-600/10 ring-2 ring-blue-600/30">
                    <div className="flex h-full items-center justify-center text-sm font-semibold text-blue-700">
                      Hub
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Import → Hub → Export</p>
                </div>
              </div>

              <section className="space-y-2 rounded-md border border-border p-3">
                <h3 className="text-sm font-semibold text-foreground">Export Settings</h3>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Allowed Export Countries
                </p>
                <div className="grid gap-1 sm:grid-cols-2">
                  {COUNTRY_OPTIONS.map((country) => (
                    <label className="inline-flex items-center gap-2 text-sm" key={country}>
                      <input
                        checked={formData.tradeConnections.exportCountries.includes(country)}
                        onChange={() => toggleConnectionValue("exportCountries", country)}
                        type="checkbox"
                      />
                      {country}
                    </label>
                  ))}
                </div>

                <p className="pt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Additional Export Config
                </p>
                <div className="flex gap-2">
                  <Input
                    onChange={(event) => setExportAdditionalInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addConnectionTag("exportAdditional", exportAdditionalInput, () =>
                          setExportAdditionalInput(""),
                        );
                      }
                    }}
                    placeholder="Select Select..."
                    value={exportAdditionalInput}
                  />
                  <Button
                    onClick={() =>
                      addConnectionTag("exportAdditional", exportAdditionalInput, () =>
                        setExportAdditionalInput(""),
                      )
                    }
                    type="button"
                    variant="secondary"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tradeConnections.exportAdditional.map((item) => (
                    <span
                      className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 text-xs"
                      key={item}
                    >
                      {item}
                      <button onClick={() => removeConnectionTag("exportAdditional", item)} type="button">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <p className="pt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Allowed Export Hubs
                </p>
                <div className="grid gap-1 sm:grid-cols-2">
                  {HUB_CONNECTION_OPTIONS.map((hub) => (
                    <label className="inline-flex items-center gap-2 text-sm" key={hub}>
                      <input
                        checked={formData.tradeConnections.exportHubs.includes(hub)}
                        onChange={() => toggleConnectionValue("exportHubs", hub)}
                        type="checkbox"
                      />
                      {hub}
                    </label>
                  ))}
                </div>
              </section>
            </div>
          </div>
        ) : null}

        {currentStep === 4 ? (
          <section className="rounded-md border border-border p-3">
            <h3 className="mb-2 text-sm font-semibold text-foreground">Hub Review</h3>
            <dl className="grid gap-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Hub Name</dt>
                <dd className="font-medium text-foreground">{formData.name || "-"}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Country</dt>
                <dd className="font-medium text-foreground">{formData.country || "-"}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Type</dt>
                <dd className="font-medium text-foreground">{formData.type}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Import / Export Links</dt>
                <dd className="font-medium text-foreground">
                  {formData.tradeConnections.importHubs.length}/{formData.tradeConnections.exportHubs.length}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Enabled Operations</dt>
                <dd className="font-medium text-foreground">
                  {Object.entries(formData.operationSettings)
                    .filter((entry) => entry[1])
                    .map((entry) => entry[0])
                    .join(", ") || "-"}
                </dd>
              </div>
            </dl>
          </section>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">
            {feedback ?? "Complete each step and review before creating hub."}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              disabled={currentStep === 1}
              onClick={() => setCurrentStep((previous) => Math.max(1, previous - 1))}
              size="sm"
              type="button"
              variant="secondary"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>

            {currentStep < 4 ? (
              <Button onClick={goToNextStep} size="sm" type="button">
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button disabled={isSaving} onClick={() => submit(true)} size="sm" type="button" variant="secondary">
                  Save Draft
                </Button>
                <Button disabled={isSaving} onClick={() => submit(false)} size="sm" type="button">
                  {isSaving ? "Saving..." : isEditMode ? "Update Hub" : "Create Hub"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
