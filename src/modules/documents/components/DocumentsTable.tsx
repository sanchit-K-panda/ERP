"use client";

import { useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { Archive, Download, Eye, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import type { DocumentRecord } from "@/modules/documents/types";

type DocumentsTableProps = {
  rows: DocumentRecord[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  total: number;
  page: number;
  totalPages: number;
  deletingDocumentId?: string | null;
  archivingDocumentId?: string | null;
  onPageChange: (nextPage: number) => void;
  onPreview: (record: DocumentRecord) => void;
  onDownload: (record: DocumentRecord) => void;
  onArchive: (documentId: string) => void;
  onDelete: (documentId: string) => void;
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

export function DocumentsTable({
  rows,
  isLoading = false,
  isError = false,
  onRetry,
  total,
  page,
  totalPages,
  deletingDocumentId,
  archivingDocumentId,
  onPageChange,
  onPreview,
  onDownload,
  onArchive,
  onDelete,
}: DocumentsTableProps) {
  const columns = useMemo<ColumnDef<DocumentRecord>[]>(
    () => [
      {
        accessorKey: "documentId",
        header: "Document ID",
        cell: ({ row }) => (
          <span className="font-medium text-foreground">{row.original.documentId}</span>
        ),
      },
      {
        accessorKey: "fileName",
        header: "File",
        cell: ({ row }) => (
          <div>
            <p className="truncate text-sm font-medium text-foreground">{row.original.fileName}</p>
            <p className="text-xs text-muted-foreground">{formatBytes(row.original.fileSize)}</p>
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
      },
      {
        id: "entity",
        header: "Linked To",
        cell: ({ row }) => (
          <div>
            <p>{row.original.entityType}</p>
            <p className="text-xs text-muted-foreground">{row.original.entityId}</p>
          </div>
        ),
      },
      {
        accessorKey: "uploadedBy",
        header: "Uploaded By",
      },
      {
        accessorKey: "uploadedAt",
        header: "Uploaded",
        cell: ({ row }) => format(parseISO(row.original.uploadedAt), "dd-MMM-yyyy HH:mm"),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.status === "Uploaded"
                ? "success"
                : row.original.status === "Processing"
                  ? "warning"
                  : "muted"
            }
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button onClick={() => onPreview(row.original)} size="sm" variant="ghost">
              <Eye className="h-4 w-4" />
            </Button>
            <Button onClick={() => onDownload(row.original)} size="sm" variant="ghost">
              <Download className="h-4 w-4" />
            </Button>
            <Button
              disabled={row.original.status === "Archived" || archivingDocumentId === row.original.documentId}
              onClick={() => onArchive(row.original.documentId)}
              size="sm"
              variant="ghost"
            >
              <Archive className="h-4 w-4" />
            </Button>
            <Button
              disabled={deletingDocumentId === row.original.documentId}
              onClick={() => onDelete(row.original.documentId)}
              size="sm"
              variant="ghost"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [archivingDocumentId, deletingDocumentId, onArchive, onDelete, onDownload, onPreview],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack table instance is scoped to this component.
  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return <TableSkeleton rows={8} />;
  }

  if (isError) {
    return <ErrorState message="Failed to load documents." onRetry={onRetry} />;
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        description="Upload a file or clear the filters to view stored documents."
        title="No documents found"
      />
    );
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-lg border border-border"
      initial={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.2 }}
    >
      <div className="max-h-[620px] overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-background">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr className="border-b border-border" key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    key={header.id}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr className="border-b border-border/70" key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td className="px-3 py-2" key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-border p-3">
        <p className="text-xs text-muted-foreground">
          Page {page} of {totalPages} • {total} documents
        </p>
        <div className="flex items-center gap-2">
          <Button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            size="sm"
            variant="secondary"
          >
            Previous
          </Button>
          <Button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            size="sm"
            variant="secondary"
          >
            Next
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
