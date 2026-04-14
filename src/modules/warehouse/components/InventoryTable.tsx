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
import type { CurrencyCode } from "@/modules/finance/types";
import type { InventoryRecord } from "@/modules/warehouse/types";
import { cn } from "@/utils/cn";

type InventoryTableProps = {
  rows: InventoryRecord[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
};

function formatCurrency(value: number, currency: CurrencyCode) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function InventoryTable({
  rows,
  isLoading = false,
  isError = false,
  onRetry,
  total,
  page,
  totalPages,
  onPageChange,
}: InventoryTableProps) {
  const columns = useMemo<ColumnDef<InventoryRecord>[]>(
    () => [
      {
        accessorKey: "sku",
        header: "SKU",
        cell: ({ row }) => <span className="font-medium text-foreground">{row.original.sku}</span>,
      },
      {
        accessorKey: "itemName",
        header: "Item",
      },
      {
        accessorKey: "category",
        header: "Category",
      },
      {
        accessorKey: "warehouse",
        header: "Warehouse",
      },
      {
        accessorKey: "availableQty",
        header: "Available",
        cell: ({ row }) => (
          <span className="table-cell-numeric block">
            {row.original.availableQty} {row.original.unit}
          </span>
        ),
      },
      {
        accessorKey: "reservedQty",
        header: "Reserved",
        cell: ({ row }) => (
          <span className="table-cell-numeric block">
            {row.original.reservedQty} {row.original.unit}
          </span>
        ),
      },
      {
        accessorKey: "reorderLevel",
        header: "Reorder",
        cell: ({ row }) => (
          <span className="table-cell-numeric block">
            {row.original.reorderLevel} {row.original.unit}
          </span>
        ),
      },
      {
        accessorKey: "unitCost",
        header: "Unit Cost",
        cell: ({ row }) => (
          <span className="table-cell-numeric block">
            {formatCurrency(row.original.unitCost, row.original.currency)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.status === "Healthy"
                ? "success"
                : row.original.status === "Low Stock"
                  ? "warning"
                  : "danger"
            }
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "lastUpdated",
        header: "Last Updated",
        cell: ({ row }) => format(parseISO(row.original.lastUpdated), "dd-MMM-yyyy HH:mm"),
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
    return <TableSkeleton rows={8} />;
  }

  if (isError) {
    return <ErrorState message="Failed to load inventory." onRetry={onRetry} />;
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        description="Adjust filters to include more warehouses, categories, or status values."
        title="No inventory rows found"
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
                      header.id === "availableQty" ||
                      header.id === "reservedQty" ||
                      header.id === "reorderLevel" ||
                      header.id === "unitCost"
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
              <tr
                className={cn(
                  "interactive-row border-b border-border/70",
                  row.original.status === "Out of Stock" && "bg-rose-50/60",
                  row.original.status === "Low Stock" && "bg-amber-50/40",
                )}
                key={row.id}
              >
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
          Page {page} of {totalPages} • {total} items
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
