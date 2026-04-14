"use client";

import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import type { FinanceTransaction } from "@/modules/finance/types";

type TransactionsTableProps = {
  rows: FinanceTransaction[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  page: number;
  total: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
  onAddTransaction: () => void;
  onOpenJob: (jobId: string) => void;
};

function formatCurrency(value: number, currency: FinanceTransaction["currency"]) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function typeBadge(type: FinanceTransaction["type"]) {
  return type === "Income" ? (
    <Badge variant="success">Income</Badge>
  ) : (
    <Badge variant="danger">Expense</Badge>
  );
}

export function TransactionsTable({
  rows,
  isLoading = false,
  isError = false,
  onRetry,
  page,
  total,
  totalPages,
  onPageChange,
  onAddTransaction,
  onOpenJob,
}: TransactionsTableProps) {
  const columns = useMemo<ColumnDef<FinanceTransaction>[]>(
    () => [
      {
        accessorKey: "transactionId",
        header: "Transaction ID",
        cell: ({ row }) => (
          <span className="font-medium text-foreground">{row.original.transactionId}</span>
        ),
      },
      {
        accessorKey: "jobId",
        header: "Job ID",
        cell: ({ row }) =>
          row.original.jobId ? (
            <button
              className="underline-offset-2 hover:underline"
              onClick={(event) => {
                event.stopPropagation();
                onOpenJob(row.original.jobId as string);
              }}
              type="button"
            >
              {row.original.jobId}
            </button>
          ) : (
            <span className="text-muted-foreground">-</span>
          ),
      },
      {
        accessorKey: "partyName",
        header: "Party Name",
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => typeBadge(row.original.type),
      },
      {
        accessorKey: "category",
        header: "Category",
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <span className="table-cell-numeric block">
            {formatCurrency(row.original.amount, row.original.currency)}
          </span>
        ),
      },
      {
        accessorKey: "currency",
        header: "Currency",
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => format(parseISO(row.original.date), "dd-MMM-yyyy"),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Button
            disabled={!row.original.jobId}
            onClick={(event) => {
              event.stopPropagation();
              if (row.original.jobId) {
                onOpenJob(row.original.jobId);
              }
            }}
            size="sm"
            variant="ghost"
          >
            Open Job
          </Button>
        ),
      },
    ],
    [onOpenJob],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack table instance remains local to this table.
  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return <TableSkeleton rows={9} />;
  }

  if (isError) {
    return <ErrorState message="Failed to load transactions." onRetry={onRetry} />;
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        actionLabel="Add Transaction"
        description="Add your first transaction to start tracking money flow."
        onAction={onAddTransaction}
        title="No transactions yet"
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
              <tr
                className="interactive-row cursor-pointer border-b border-border/70"
                key={row.id}
                onClick={() => {
                  if (row.original.jobId) {
                    onOpenJob(row.original.jobId);
                  }
                }}
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
          Page {page} of {totalPages} • {total} transactions
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
