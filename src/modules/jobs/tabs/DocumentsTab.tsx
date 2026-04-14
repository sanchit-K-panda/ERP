import { useMemo } from "react";
import { DocumentUploader } from "@/modules/jobs/components/DocumentUploader";
import type { JobDocument, LocalUploadDocument } from "@/modules/jobs/types";

type DocumentsTabProps = {
  documents: JobDocument[];
  uploads: LocalUploadDocument[];
  onAddFiles: (files: File[]) => void;
  onRemoveUpload: (id: string) => void;
  onDeleteDocument: (id: string) => void;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsTab({
  documents,
  uploads,
  onAddFiles,
  onRemoveUpload,
  onDeleteDocument,
}: DocumentsTabProps) {
  const mergedUploads = useMemo<LocalUploadDocument[]>(() => {
    const existing = documents.map((document) => ({
      id: document.id,
      fileName: document.fileName,
      fileType: document.fileType,
      fileSize: document.fileSize,
      progress: 100,
      status: "done" as const,
    }));

    const uploading = uploads.filter(
      (upload) => !documents.some((document) => document.id === upload.id),
    );

    return [...existing, ...uploading];
  }, [documents, uploads]);

  const handleDownload = (id: string) => {
    const selected = mergedUploads.find((item) => item.id === id);
    if (!selected) {
      return;
    }

    const blob = new Blob([`Demo file: ${selected.fileName}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = selected.fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-4">
      <DocumentUploader
        emptyDescription="Upload and manage files for this job"
        onAddFiles={onAddFiles}
        onDownloadUpload={handleDownload}
        onRemoveUpload={(id) => {
          const existingDocument = documents.some((document) => document.id === id);
          if (existingDocument) {
            onDeleteDocument(id);
            return;
          }

          onRemoveUpload(id);
        }}
        uploads={mergedUploads}
      />

      {documents.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          {documents.length} persisted document(s) • total size{" "}
          {formatBytes(documents.reduce((sum, item) => sum + item.fileSize, 0))}
        </p>
      ) : null}
    </section>
  );
}
