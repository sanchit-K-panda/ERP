"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { JobStatusBadge } from "@/modules/jobs/components/JobStatusBadge";
import { StatusWorkflow } from "@/modules/jobs/components/StatusWorkflow";
import { OverviewTab } from "@/modules/jobs/tabs/OverviewTab";
import { LogisticsTab } from "@/modules/jobs/tabs/LogisticsTab";
import { FinanceTab } from "@/modules/jobs/tabs/FinanceTab";
import { DocumentsTab } from "@/modules/jobs/tabs/DocumentsTab";
import { jobService } from "@/services/jobService";
import type { JobStatus, LocalUploadDocument } from "@/modules/jobs/types";

type DetailTab = "overview" | "logistics" | "finance" | "documents";

const TABS: Array<{ id: DetailTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "logistics", label: "Logistics" },
  { id: "finance", label: "Finance" },
  { id: "documents", label: "Documents" },
];

function DetailSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-8 w-52 animate-pulse rounded bg-muted" />
      <div className="h-24 animate-pulse rounded bg-muted" />
      <div className="h-48 animate-pulse rounded bg-muted" />
    </div>
  );
}

export function JobDetailPage({ jobId }: { jobId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [pendingUploads, setPendingUploads] = useState<LocalUploadDocument[]>([]);

  const jobQuery = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => jobService.getJobById(jobId),
    staleTime: 30_000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: JobStatus) => jobService.updateJobStatus(jobId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job", jobId] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: ({ fileName, fileType, fileSize }: {
      uploadId: string;
      fileName: string;
      fileType: string;
      fileSize: number;
    }) => jobService.uploadDocument(jobId, { fileName, fileType, fileSize }),
    onSuccess: (_document, variables) => {
      setPendingUploads((previous) => previous.filter((item) => item.id !== variables.uploadId));
      queryClient.invalidateQueries({ queryKey: ["job", jobId] });
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: (documentId: string) => jobService.deleteDocument(jobId, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job", jobId] });
    },
  });

  const allowedTransitions = useMemo(
    () =>
      jobQuery.data ? jobService.getAllowedStatusTransitions(jobQuery.data.status) : ([] as JobStatus[]),
    [jobQuery.data],
  );

  const onAddFiles = (files: File[]) => {
    const localItems = files.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      progress: 0,
      status: "uploading" as const,
    }));

    setPendingUploads((previous) => [...previous, ...localItems]);

    localItems.forEach((item) => {
      const interval = setInterval(() => {
        setPendingUploads((previous) =>
          previous.map((upload) => {
            if (upload.id !== item.id) {
              return upload;
            }

            const nextProgress = Math.min(upload.progress + 20, 100);
            return {
              ...upload,
              progress: nextProgress,
              status: nextProgress >= 100 ? "done" : "uploading",
            };
          }),
        );
      }, 120);

      setTimeout(() => {
        clearInterval(interval);
      }, 700);

      setTimeout(() => {
        uploadDocumentMutation.mutate({
          uploadId: item.id,
          fileName: item.fileName,
          fileType: item.fileType,
          fileSize: item.fileSize,
        });
      }, 750);
    });
  };

  if (jobQuery.isLoading) {
    return <DetailSkeleton />;
  }

  if (jobQuery.isError || !jobQuery.data) {
    return (
      <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        Unable to load job details.
      </div>
    );
  }

  const job = jobQuery.data;

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <Button onClick={() => router.push("/jobs")} size="sm" variant="ghost">
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Button>
          <h1 className="page-title">{job.jobId}</h1>
          <div className="flex items-center gap-2">
            <JobStatusBadge status={job.status} />
            <span className="text-xs text-muted-foreground">{job.clientName}</span>
          </div>
        </div>
      </header>

      <StatusWorkflow
        allowedTransitions={allowedTransitions}
        currentStatus={job.status}
        isUpdating={updateStatusMutation.isPending}
        onConfirm={(nextStatus) => updateStatusMutation.mutate(nextStatus)}
      />

      <div className="rounded-lg border border-border">
        <nav className="flex flex-wrap gap-1 border-b border-border p-2">
          {TABS.map((tab) => (
            <button
              className={
                activeTab === tab.id
                  ? "rounded-md border border-accent bg-muted px-3 py-1.5 text-sm"
                  : "rounded-md border border-transparent px-3 py-1.5 text-sm text-muted-foreground hover:border-border"
              }
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4">
          {activeTab === "overview" ? <OverviewTab job={job} /> : null}

          {activeTab === "logistics" ? (
            <LogisticsTab
              clientName={job.clientName}
              destinationHub={job.destinationHub}
              jobId={job.jobId}
              originHub={job.originHub}
              partyId={job.partyId}
            />
          ) : null}

          {activeTab === "finance" ? (
            <FinanceTab clientName={job.clientName} jobId={job.jobId} partyId={job.partyId} />
          ) : null}

          {activeTab === "documents" ? (
            <DocumentsTab
              documents={job.documents}
              onAddFiles={onAddFiles}
              onDeleteDocument={(id) => deleteDocumentMutation.mutate(id)}
              onRemoveUpload={(id) =>
                setPendingUploads((previous) => previous.filter((item) => item.id !== id))
              }
              uploads={pendingUploads}
            />
          ) : null}
        </div>
      </div>

    </section>
  );
}
