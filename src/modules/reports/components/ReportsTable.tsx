"use client";

import { useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import type { ReportRow, ReportSchema, ReportValueFormat } from "@/modules/reports/types";

type ReportsTableProps = {
  rows: ReportRow[];
  schema: ReportSchema;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
};

function formatMetricValue(value: number, format: ReportValueFormat) {
  if (format === "currency") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "BDT",
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 0,
    }).format(value);
  }

  if (format === "percent") {
    return `${value.toFixed(1)}%`;
  }

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(value);
}

export function ReportsTable({
  rows,
  schema,
  isLoading = false,
  isError = false,
  onRetry,
  total,
  page,
  totalPages,
  onPageChange,
}: ReportsTableProps) {
  const columns = useMemo<ColumnDef<ReportRow>[]>(
    () => [
      {
        accessorKey: "dimension",
        header: schema.dimensionLabel,
        cell: ({ row }) => <span className="font-medium text-foreground">{row.original.dimension}</span>,
      },
      {
        accessorKey: "hub",
        header: "Hub",
      },
      {
        id: "primaryValue",
        header: schema.primaryLabel,
        cell: ({ row }) => (
          <span className="table-cell-numeric block">
            {formatMetricValue(row.original.primaryValue, schema.primaryFormat)}
          </span>
        ),
      },
      {
        id: "secondaryValue",
        header: schema.secondaryLabel,
        cell: ({ row }) => (
          <span className="table-cell-numeric block">
            {formatMetricValue(row.original.secondaryValue, schema.secondaryFormat)}
          </span>
        ),
      },
      {
        id: "tertiaryValue",
        header: schema.tertiaryLabel,
        cell: ({ row }) => (
          <span className="table-cell-numeric block">
            {formatMetricValue(row.original.tertiaryValue, schema.tertiaryFormat)}
          </span>
        ),
      },
    ],
    [schema.dimensionLabel, schema.primaryFormat, schema.primaryLabel, schema.secondaryFormat, schema.secondaryLabel, schema.tertiaryFormat, schema.tertiaryLabel],
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
    return <ErrorState message="Failed to load report table." onRetry={onRetry} />;
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        description="Try broadening the date range or clearing one of the filters."
        title="No report rows found"
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
                      header.id === "primaryValue" ||
                      header.id === "secondaryValue" ||
                      header.id === "tertiaryValue"
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
          Page {page} of {totalPages} • {total} rows
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
