"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/modules/dashboard/components/DataTable";
import type { TransactionItem } from "@/services/dashboardService";

type TransactionsListProps = {
  data: TransactionItem[];
  isLoading?: boolean;
  errorMessage?: string | null;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "BDT",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(value);
}

export function TransactionsList({
  data,
  isLoading = false,
  errorMessage,
}: TransactionsListProps) {
  const columns = useMemo<ColumnDef<TransactionItem>[]>(
    () => [
      {
        accessorKey: "party",
        header: "Party",
        cell: ({ row }) => (
          <span className="block max-w-[280px] truncate font-medium text-foreground" title={row.original.party}>
            {row.original.party}
          </span>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) =>
          row.original.type === "Income" ? (
            <Badge variant="success">Income</Badge>
          ) : (
            <Badge variant="danger">Expense</Badge>
          ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        meta: { align: "right" },
        cell: ({ row }) => <span className="block w-full">{formatCurrency(row.original.amount)}</span>,
      },
      {
        accessorKey: "time",
        header: "Time",
        cell: ({ row }) => row.original.time,
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      description="Latest income and expense entries from operations."
      emptyDescription="No transactions have been recorded yet."
      emptyTitle="No transactions"
      errorMessage={errorMessage}
      isLoading={isLoading}
      searchPlaceholder="Search by party, type, amount"
      title="Recent Transactions"
    />
  );
}
