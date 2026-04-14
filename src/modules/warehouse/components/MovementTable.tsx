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
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import type { StockMovementRecord } from "@/modules/warehouse/types";

type MovementTableProps = {
  rows: StockMovementRecord[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
};

export function MovementTable({
  rows,
  isLoading = false,
  isError = false,
  onRetry,
  total,
  page,
  totalPages,
  onPageChange,
}: MovementTableProps) {
  const columns = useMemo<ColumnDef<StockMovementRecord>[]>(
    () => [
      {
        accessorKey: "movementId",
        header: "Movement ID",
        cell: ({ row }) => (
          <span className="font-medium text-foreground">{row.original.movementId}</span>
        ),
      },
      {
        accessorKey: "sku",
        header: "SKU",
      },
      {
        accessorKey: "itemName",
        header: "Item",
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.type === "Inbound"
                ? "success"
                : row.original.type === "Outbound"
                  ? "warning"
                  : "muted"
            }
          >
            {row.original.type}
          </Badge>
        ),
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
        cell: ({ row }) => (
          <span className="table-cell-numeric block">
            {row.original.quantity} {row.original.unit}
          </span>
        ),
      },
      {
        accessorKey: "warehouse",
        header: "Warehouse",
      },
      {
        accessorKey: "reference",
        header: "Reference",
      },
      {
        accessorKey: "performedBy",
        header: "By",
      },
      {
        accessorKey: "movedAt",
        header: "Moved At",
        cell: ({ row }) => format(parseISO(row.original.movedAt), "dd-MMM-yyyy HH:mm"),
      },
    ],
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack table instance is scoped to this component.
  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return <TableSkeleton rows={7} />;
  }

  if (isError) {
    return <ErrorState message="Failed to load stock movement logs." onRetry={onRetry} />;
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        description="Record an inbound/outbound movement to populate this stream."
        title="No movement rows found"
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
                    className={
                      header.id === "quantity"
                        ? "table-head-numeric px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                        : "px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    }
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
              <tr className="interactive-row border-b border-border/70" key={row.id}>
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
          Page {page} of {totalPages} • {total} movements
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
