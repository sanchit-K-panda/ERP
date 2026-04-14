"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Filter, Search } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { DocumentsTable } from "@/modules/documents/components/DocumentsTable";
import { FileUploader } from "@/modules/documents/components/FileUploader";
import type {
  DocumentCategory,
  DocumentEntityType,
  DocumentFilters,
  DocumentRecord,
  UploadQueueItem,
} from "@/modules/documents/types";
import { documentService } from "@/services/documentService";

const DEFAULT_FILTERS: DocumentFilters = {
  search: "",
  category: "All",
  entityType: "All",
  status: "All",
  uploadedBy: "All",
  page: 1,
  pageSize: 8,
};

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export function DocumentsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [filters, setFilters] = useState<DocumentFilters>(DEFAULT_FILTERS);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>("Other");
  const [selectedEntityType, setSelectedEntityType] = useState<DocumentEntityType>("Job");
  const [entityReference, setEntityReference] = useState("J-20260414-01");
  const [uploads, setUploads] = useState<UploadQueueItem[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentRecord | null>(null);
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null);
  const [archivingDocumentId, setArchivingDocumentId] = useState<string | null>(null);

  const documentsQuery = useQuery({
    queryKey: ["documents", filters],
    queryFn: () => documentService.getDocuments(filters),
    staleTime: 20_000,
  });

  const filterOptionsQuery = useQuery({
    queryKey: ["documents", "filter-options"],
    queryFn: documentService.getFilterOptions,
    staleTime: 60_000,
  });

  const uploadMutation = useMutation({
    mutationFn: documentService.uploadDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: documentService.deleteDocument,
    onMutate: (documentId) => {
      setDeletingDocumentId(documentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onSettled: () => {
      setDeletingDocumentId(null);
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (documentId: string) =>
      documentService.updateDocumentStatus(documentId, "Archived"),
    onMutate: (documentId) => {
      setArchivingDocumentId(documentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onSettled: () => {
      setArchivingDocumentId(null);
    },
  });

  const totalPages = documentsQuery.data
    ? Math.max(1, Math.ceil(documentsQuery.data.total / documentsQuery.data.pageSize))
    : 1;

  const uploaderName = user?.name ?? "Ops User";

  async function processUpload(file: File) {
    const queueId = `upload-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

    setUploads((previous) => [
      {
        id: queueId,
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        fileSize: file.size,
        progress: 5,
        status: "uploading",
      },
      ...previous,
    ]);

    for (const step of [28, 56, 84]) {
      await sleep(120);
      setUploads((previous) =>
        previous.map((item) =>
          item.id === queueId
            ? {
                ...item,
                progress: step,
              }
            : item,
        ),
      );
    }

    try {
      await uploadMutation.mutateAsync({
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        fileSize: file.size,
        category: selectedCategory,
        entityType: selectedEntityType,
        entityId: entityReference.trim() || "UNASSIGNED",
        uploadedBy: uploaderName,
        tags: [selectedCategory.toLowerCase(), selectedEntityType.toLowerCase()],
      });

      setUploads((previous) =>
        previous.map((item) =>
          item.id === queueId
            ? {
                ...item,
                progress: 100,
                status: "done",
                message: "Uploaded",
              }
            : item,
        ),
      );

      setTimeout(() => {
        setUploads((previous) => previous.filter((item) => item.id !== queueId));
      }, 900);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed.";

      setUploads((previous) =>
        previous.map((item) =>
          item.id === queueId
            ? {
                ...item,
                progress: 100,
                status: "error",
                message,
              }
            : item,
        ),
      );
    }
  }

  function handleDownload(record: DocumentRecord) {
    const content = [
      `Document ID: ${record.documentId}`,
      `File: ${record.fileName}`,
      `Category: ${record.category}`,
      `Linked: ${record.entityType} ${record.entityId}`,
      "",
      record.previewText,
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${record.fileName}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="page-title">Documents</h1>
        <p className="text-sm text-muted-foreground">
          Global document repository for jobs, shipments, parties, and finance artifacts.
        </p>
      </header>

      <FileUploader
        entityReference={entityReference}
        onAddFiles={(files) => {
          files.forEach((file) => {
            void processUpload(file);
          });
        }}
        onCategoryChange={setSelectedCategory}
        onEntityReferenceChange={setEntityReference}
        onEntityTypeChange={setSelectedEntityType}
        selectedCategory={selectedCategory}
        selectedEntityType={selectedEntityType}
        uploads={uploads}
      />

      <section className="rounded-lg border border-border bg-background p-3">
        <div className="grid gap-2 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,0.9fr)]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  search: event.target.value,
                  page: 1,
                }))
              }
              placeholder="Search by file, document ID, entity"
              value={filters.search}
            />
          </div>

          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground"
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  category: event.target.value as DocumentFilters["category"],
                  page: 1,
                }))
              }
              value={filters.category}
            >
              <option value="All">All Categories</option>
              <option value="Invoice">Invoice</option>
              <option value="Bill of Lading">Bill of Lading</option>
              <option value="Packing List">Packing List</option>
              <option value="Customs">Customs</option>
              <option value="Contract">Contract</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <select
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  entityType: event.target.value as DocumentFilters["entityType"],
                  page: 1,
                }))
              }
              value={filters.entityType}
            >
              <option value="All">All Entity Types</option>
              <option value="Job">Job</option>
              <option value="Shipment">Shipment</option>
              <option value="Party">Party</option>
              <option value="Finance">Finance</option>
            </select>
          </div>

          <div>
            <select
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  status: event.target.value as DocumentFilters["status"],
                  page: 1,
                }))
              }
              value={filters.status}
            >
              <option value="All">All Statuses</option>
              <option value="Uploaded">Uploaded</option>
              <option value="Processing">Processing</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          <div>
            <select
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  uploadedBy: event.target.value,
                  page: 1,
                }))
              }
              value={filters.uploadedBy}
            >
              <option value="All">All Uploaders</option>
              {(filterOptionsQuery.data?.uploadedBy ?? []).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <DocumentsTable
        archivingDocumentId={archivingDocumentId}
        deletingDocumentId={deletingDocumentId}
        isError={documentsQuery.isError}
        isLoading={documentsQuery.isLoading}
        onArchive={(documentId) => archiveMutation.mutate(documentId)}
        onDelete={(documentId) => {
          const confirmed = window.confirm(`Delete document ${documentId}?`);
          if (!confirmed) {
            return;
          }

          deleteMutation.mutate(documentId);
        }}
        onDownload={handleDownload}
        onPageChange={(nextPage) =>
          setFilters((previous) => ({
            ...previous,
            page: nextPage,
          }))
        }
        onPreview={setSelectedDocument}
        onRetry={() => void documentsQuery.refetch()}
        page={filters.page}
        rows={documentsQuery.data?.rows ?? []}
        total={documentsQuery.data?.total ?? 0}
        totalPages={totalPages}
      />

      <Modal
        description={
          selectedDocument
            ? `${selectedDocument.entityType} • ${selectedDocument.entityId}`
            : ""
        }
        onClose={() => setSelectedDocument(null)}
        open={Boolean(selectedDocument)}
        title={selectedDocument?.fileName ?? "Document Preview"}
      >
        {selectedDocument ? (
          <div className="space-y-3">
            <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
              <p>
                <span className="font-medium">Document ID:</span> {selectedDocument.documentId}
              </p>
              <p>
                <span className="font-medium">Category:</span> {selectedDocument.category}
              </p>
              <p>
                <span className="font-medium">Uploaded by:</span> {selectedDocument.uploadedBy}
              </p>
            </div>

            <div className="rounded-md border border-border bg-background p-3 text-sm text-muted-foreground">
              {selectedDocument.previewText}
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  );
}
