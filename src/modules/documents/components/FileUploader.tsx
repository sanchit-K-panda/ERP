"use client";

import { useDropzone } from "react-dropzone";
import { FileText, UploadCloud } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type {
  DocumentCategory,
  DocumentEntityType,
  UploadQueueItem,
} from "@/modules/documents/types";

type FileUploaderProps = {
  uploads: UploadQueueItem[];
  selectedCategory: DocumentCategory;
  selectedEntityType: DocumentEntityType;
  entityReference: string;
  onCategoryChange: (value: DocumentCategory) => void;
  onEntityTypeChange: (value: DocumentEntityType) => void;
  onEntityReferenceChange: (value: string) => void;
  onAddFiles: (files: File[]) => void;
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

export function FileUploader({
  uploads,
  selectedCategory,
  selectedEntityType,
  entityReference,
  onCategoryChange,
  onEntityTypeChange,
  onEntityReferenceChange,
  onAddFiles,
}: FileUploaderProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxSize: 10 * 1024 * 1024,
    multiple: true,
    onDrop: (files) => {
      if (files.length === 0) {
        return;
      }

      onAddFiles(files);
    },
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
  });

  return (
    <section className="space-y-3 rounded-lg border border-border bg-background p-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground">Global Upload Console</h2>
        <p className="text-xs text-muted-foreground">
          Upload documents once and link them to jobs, shipments, parties, or finance records.
        </p>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <select
          className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
          onChange={(event) => onCategoryChange(event.target.value as DocumentCategory)}
          value={selectedCategory}
        >
          <option value="Invoice">Invoice</option>
          <option value="Bill of Lading">Bill of Lading</option>
          <option value="Packing List">Packing List</option>
          <option value="Customs">Customs</option>
          <option value="Contract">Contract</option>
          <option value="Other">Other</option>
        </select>

        <select
          className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
          onChange={(event) => onEntityTypeChange(event.target.value as DocumentEntityType)}
          value={selectedEntityType}
        >
          <option value="Job">Job</option>
          <option value="Shipment">Shipment</option>
          <option value="Party">Party</option>
          <option value="Finance">Finance</option>
        </select>

        <input
          className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
          onChange={(event) => onEntityReferenceChange(event.target.value)}
          placeholder="Linked entity ID"
          value={entityReference}
        />
      </div>

      <div
        {...getRootProps()}
        className={
          isDragActive
            ? "rounded-md border border-sky-300 bg-sky-50 px-4 py-8 text-center"
            : "rounded-md border border-border bg-background px-4 py-8 text-center"
        }
      >
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto h-5 w-5 text-muted-foreground" />
        <p className="mt-2 text-sm font-medium">Drop files here or click to upload</p>
        <p className="text-xs text-muted-foreground">
          Supports PDF, JPG, PNG, XLSX up to 10MB per file.
        </p>
      </div>

      {uploads.length > 0 ? (
        <ul className="space-y-2">
          {uploads.map((item) => (
            <li className="rounded-md border border-border bg-background px-3 py-2" key={item.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <p className="truncate text-sm font-medium text-foreground">{item.fileName}</p>
                    <Badge
                      variant={
                        item.status === "done"
                          ? "success"
                          : item.status === "error"
                            ? "danger"
                            : "default"
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.fileType || "Unknown type"} • {formatBytes(item.fileSize)}
                  </p>

                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={
                        item.status === "error"
                          ? "h-full rounded-full bg-rose-500 transition-[width] duration-150"
                          : "h-full rounded-full bg-accent transition-[width] duration-150"
                      }
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
