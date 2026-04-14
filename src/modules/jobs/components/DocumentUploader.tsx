"use client";

import { useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { Download, FileText, Trash2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { LocalUploadDocument } from "@/modules/jobs/types";

type DocumentUploaderProps = {
  uploads: LocalUploadDocument[];
  onAddFiles: (files: File[]) => void;
  onRemoveUpload: (id: string) => void;
  onDownloadUpload?: (id: string) => void;
  emptyDescription?: string;
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

export function DocumentUploader({
  uploads,
  onAddFiles,
  onRemoveUpload,
  onDownloadUpload,
  emptyDescription = "Drop files here or click to upload.",
}: DocumentUploaderProps) {
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      return;
    }

    onAddFiles(acceptedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 10 * 1024 * 1024,
    multiple: true,
  });

  const hasUploads = useMemo(() => uploads.length > 0, [uploads.length]);

  return (
    <div className="space-y-3">
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
        <p className="mt-2 text-sm font-medium">Upload documents</p>
        <p className="text-xs text-muted-foreground">{emptyDescription}</p>
      </div>

      {!hasUploads ? (
        <p className="text-sm text-muted-foreground">No files uploaded yet.</p>
      ) : (
        <ul className="space-y-2">
          {uploads.map((item) => (
            <li
              className="rounded-md border border-border bg-background px-3 py-2"
              key={item.id}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <p className="truncate text-sm font-medium text-foreground">{item.fileName}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.fileType || "Unknown type"} • {formatBytes(item.fileSize)}
                  </p>

                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-accent transition-[width] duration-200"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {onDownloadUpload ? (
                    <Button
                      onClick={() => onDownloadUpload(item.id)}
                      size="sm"
                      type="button"
                      variant="ghost"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  ) : null}
                  <Button
                    onClick={() => onRemoveUpload(item.id)}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
