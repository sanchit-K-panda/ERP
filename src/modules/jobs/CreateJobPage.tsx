"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { useContextStore } from "@/store/contextStore";
import { jobService } from "@/services/jobService";
import { ClientInfoSection } from "@/modules/jobs/sections/ClientInfoSection";
import { ServiceTypeSection } from "@/modules/jobs/sections/ServiceTypeSection";
import { RouteDetailsSection } from "@/modules/jobs/sections/RouteDetailsSection";
import { CargoDetailsSection } from "@/modules/jobs/sections/CargoDetailsSection";
import { PurchaseInfoSection } from "@/modules/jobs/sections/PurchaseInfoSection";
import { BasicFinancialSection } from "@/modules/jobs/sections/BasicFinancialSection";
import { DocumentUploadSection } from "@/modules/jobs/sections/DocumentUploadSection";
import type { CreateJobFormValues, CreateJobPayload, LocalUploadDocument, SectionId } from "@/modules/jobs/types";
import type { PartySearchResult } from "@/modules/parties/types";

const HUB_OPTIONS = [
  "Mumbai Port Hub",
  "Dhaka Air Cargo",
  "Chittagong Sea Port",
  "Dubai Sea Port",
  "Karachi Port",
  "Singapore Sea Port",
];

const createJobSchema = z
  .object({
    partyId: z.string().min(1, "Party is required."),
    clientName: z.string().min(2, "Client is required."),
    contactPerson: z.string().optional(),
    serviceType: z.enum(["Shipping Only", "Purchase + Shipping", "Full Service"]),
    originHub: z.string().min(1, "Origin hub is required."),
    destinationHub: z.string().min(1, "Destination hub is required."),
    cargoDescription: z.string().min(3, "Cargo description is required."),
    quantity: z.string().refine((value) => Number(value) > 0, {
      message: "Quantity must be greater than zero.",
    }),
    unit: z.enum(["kg", "ton", "pcs"]),
    weight: z.string().optional(),
    supplierName: z.string().optional(),
    purchaseAmount: z.string().optional(),
    estimatedCost: z.string().optional(),
    currency: z.enum(["BDT"]),
    notes: z.string().optional(),
    documents: z.array(
      z.object({
        id: z.string(),
        fileName: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
        progress: z.number(),
        status: z.enum(["uploading", "done"]),
      }),
    ),
  })
  .superRefine((data, context) => {
    if (data.serviceType === "Purchase + Shipping") {
      if (!data.supplierName || data.supplierName.trim().length < 2) {
        context.addIssue({
          code: "custom",
          path: ["supplierName"],
          message: "Supplier name is required for purchase + shipping.",
        });
      }

      if (!data.purchaseAmount || Number(data.purchaseAmount) <= 0) {
        context.addIssue({
          code: "custom",
          path: ["purchaseAmount"],
          message: "Purchase amount is required for purchase + shipping.",
        });
      }
    }

    if (data.weight && Number(data.weight) < 0) {
      context.addIssue({
        code: "custom",
        path: ["weight"],
        message: "Weight cannot be negative.",
      });
    }

    if (data.estimatedCost && Number(data.estimatedCost) < 0) {
      context.addIssue({
        code: "custom",
        path: ["estimatedCost"],
        message: "Estimated cost cannot be negative.",
      });
    }
  });

const SECTION_ORDER: Array<{ id: SectionId; title: string }> = [
  { id: "client-info", title: "Client Info" },
  { id: "service-type", title: "Service Type" },
  { id: "route-details", title: "Route Details" },
  { id: "cargo-details", title: "Cargo Details" },
  { id: "purchase-info", title: "Purchase Info" },
  { id: "financial", title: "Basic Financial" },
  { id: "documents", title: "Document Upload" },
];

function toPayload(values: CreateJobFormValues): CreateJobPayload {
  return {
    partyId: values.partyId || undefined,
    clientName: values.clientName.trim(),
    contactPerson: values.contactPerson.trim(),
    serviceType: values.serviceType,
    originHub: values.originHub,
    destinationHub: values.destinationHub,
    cargoDescription: values.cargoDescription.trim(),
    quantity: Number(values.quantity),
    unit: values.unit,
    weight: values.weight ? Number(values.weight) : undefined,
    supplierName: values.supplierName.trim() || undefined,
    purchaseAmount: values.purchaseAmount ? Number(values.purchaseAmount) : undefined,
    estimatedCost: values.estimatedCost ? Number(values.estimatedCost) : undefined,
    currency: values.currency,
    notes: values.notes.trim(),
    documentDrafts: values.documents
      .filter((item) => item.status === "done")
      .map((item) => ({
        fileName: item.fileName,
        fileType: item.fileType,
        fileSize: item.fileSize,
      })),
  };
}

export function CreateJobPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const activeHub = useContextStore((state) => state.activeHub);
  const [activeSection, setActiveSection] = useState<SectionId>("client-info");
  const [localUploads, setLocalUploads] = useState<LocalUploadDocument[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<CreateJobFormValues>({
    defaultValues: {
      partyId: "",
      clientName: "",
      contactPerson: "",
      serviceType: "Purchase + Shipping",
      originHub: "",
      destinationHub: activeHub?.name ?? "Mumbai Port Hub",
      cargoDescription: "",
      quantity: "",
      unit: "kg",
      weight: "",
      supplierName: "",
      purchaseAmount: "",
      estimatedCost: "",
      currency: "BDT",
      notes: "",
      documents: [],
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library -- React Hook Form watch drives local section state only.
  const currentValues = watch();
  const shouldShowPurchaseSection = currentValues.serviceType === "Purchase + Shipping";

  const createJobMutation = useMutation({
    mutationFn: async ({ payload, asDraft }: { payload: CreateJobPayload; asDraft: boolean }) =>
      jobService.createJob(payload, asDraft),
    onSuccess: (job, vars) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      if (vars.asDraft) {
        setFeedback(`Draft saved as ${job.jobId}`);
        return;
      }

      router.push(`/jobs/${job.jobId}`);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Unable to create job.";
      setFeedback(message);
    },
  });

  useEffect(() => {
    if (activeHub?.name) {
      setValue("destinationHub", activeHub.name, { shouldDirty: true });
    }
  }, [activeHub?.name, setValue]);

  useEffect(() => {
    setValue("documents", localUploads, { shouldDirty: true });
  }, [localUploads, setValue]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visibleEntry) {
          return;
        }

        const nextSection = visibleEntry.target.id as SectionId;
        setActiveSection(nextSection);
      },
      {
        rootMargin: "-35% 0px -50% 0px",
        threshold: [0.2, 0.5, 0.8],
      },
    );

    SECTION_ORDER.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);

  const sectionCompletion = useMemo(() => {
    const completePurchase =
      !shouldShowPurchaseSection ||
      (currentValues.supplierName.trim().length > 1 && Number(currentValues.purchaseAmount) > 0);

    return {
      "client-info": currentValues.partyId.trim().length > 0,
      "service-type": currentValues.serviceType.length > 0,
      "route-details":
        currentValues.originHub.trim().length > 0 && currentValues.destinationHub.trim().length > 0,
      "cargo-details":
        currentValues.cargoDescription.trim().length > 2 && Number(currentValues.quantity) > 0,
      "purchase-info": completePurchase,
      financial: currentValues.currency.length > 0 && currentValues.estimatedCost.trim().length > 0,
      documents: currentValues.documents.some((item) => item.status === "done"),
    } satisfies Record<SectionId, boolean>;
  }, [currentValues, shouldShowPurchaseSection]);

  const handleAddFiles = (files: File[]) => {
    const createdUploads = files.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      progress: 0,
      status: "uploading" as const,
    }));

    setLocalUploads((previous) => [...previous, ...createdUploads]);

    createdUploads.forEach((upload) => {
      const interval = setInterval(() => {
        setLocalUploads((previous) =>
          previous.map((item) => {
            if (item.id !== upload.id) {
              return item;
            }

            const nextProgress = Math.min(item.progress + 20, 100);
            return {
              ...item,
              progress: nextProgress,
              status: nextProgress >= 100 ? "done" : "uploading",
            };
          }),
        );
      }, 120);

      setTimeout(() => {
        clearInterval(interval);
      }, 700);
    });
  };

  const handleRemoveUpload = (id: string) => {
    setLocalUploads((previous) => previous.filter((item) => item.id !== id));
  };

  const validateBeforeSubmit = (values: CreateJobFormValues) => {
    clearErrors();
    const parsed = createJobSchema.safeParse(values);

    if (parsed.success) {
      return parsed.data;
    }

    const fieldErrors = parsed.error.flatten().fieldErrors;
    (Object.keys(fieldErrors) as Array<keyof typeof fieldErrors>).forEach((fieldKey) => {
      const message = fieldErrors[fieldKey]?.[0];
      if (message) {
        setError(fieldKey as keyof CreateJobFormValues, { message });
      }
    });

    return null;
  };

  const saveAsDraft = () => {
    const values = getValues();
    const validated = validateBeforeSubmit(values);
    if (!validated) {
      return;
    }

    createJobMutation.mutate({ payload: toPayload(values), asDraft: true });
  };

  const submitFinal = (values: CreateJobFormValues) => {
    const validated = validateBeforeSubmit(values);
    if (!validated) {
      return;
    }

    createJobMutation.mutate({ payload: toPayload(values), asDraft: false });
  };

  const visibleSections = shouldShowPurchaseSection
    ? SECTION_ORDER
    : SECTION_ORDER.filter((item) => item.id !== "purchase-info");

  const onSelectParty = (party: PartySearchResult) => {
    setValue("partyId", party.id, { shouldDirty: true, shouldValidate: true });
    setValue("clientName", party.name, { shouldDirty: true, shouldValidate: true });
  };

  const onClearParty = () => {
    setValue("partyId", "", { shouldDirty: true, shouldValidate: true });
    setValue("clientName", "", { shouldDirty: true, shouldValidate: true });
  };

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Create Job</h1>
          <p className="text-sm text-muted-foreground">
            Single-page workflow with structured operational sections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={saveAsDraft} size="sm" type="button" variant="secondary">
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
          <Button
            disabled={createJobMutation.isPending}
            onClick={handleSubmit(submitFinal)}
            size="sm"
            type="button"
          >
            {createJobMutation.isPending ? "Submitting..." : "Create Job"}
          </Button>
        </div>
      </header>

      {feedback ? (
        <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground">
          {feedback}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="h-fit rounded-lg border border-border p-3 lg:sticky lg:top-20">
          <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Sections</p>
          <ol className="space-y-1">
            {visibleSections.map((section) => {
              const isActive = activeSection === section.id;
              const done = sectionCompletion[section.id];

              return (
                <li key={section.id}>
                  <button
                    className={
                      isActive
                        ? "flex w-full items-center gap-2 rounded-md border border-accent bg-muted px-2 py-2 text-left text-sm"
                        : "flex w-full items-center gap-2 rounded-md border border-transparent px-2 py-2 text-left text-sm hover:border-border"
                    }
                    onClick={() => {
                      const element = document.getElementById(section.id);
                      if (element) {
                        element.scrollIntoView({ behavior: "smooth", block: "start" });
                      }
                    }}
                    type="button"
                  >
                    {done ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{section.title}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>

        <motion.form
          className="space-y-6 rounded-lg border border-border p-4"
          onSubmit={handleSubmit(submitFinal)}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <ClientInfoSection
            errors={errors}
            onClearParty={onClearParty}
            onSelectParty={onSelectParty}
            register={register}
            selectedPartyId={currentValues.partyId}
            selectedPartyName={currentValues.clientName}
          />

          <ServiceTypeSection errors={errors} setValue={setValue} watch={watch} />

          <RouteDetailsSection errors={errors} hubs={HUB_OPTIONS} register={register} />

          <CargoDetailsSection errors={errors} register={register} />

          {shouldShowPurchaseSection ? (
            <PurchaseInfoSection errors={errors} register={register} />
          ) : null}

          <BasicFinancialSection errors={errors} register={register} />

          <DocumentUploadSection
            documents={localUploads}
            onAddFiles={handleAddFiles}
            onRemoveUpload={handleRemoveUpload}
          />
        </motion.form>
      </div>
    </section>
  );
}
