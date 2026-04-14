"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AddTransactionModal } from "@/modules/finance/components/AddTransactionModal";
import type { TransactionJobOption } from "@/modules/finance/types";
import { financeService } from "@/services/financeService";

type FinanceTabProps = {
  jobId: string;
  clientName: string;
  partyId?: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function FinanceSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div className="h-10 animate-pulse rounded bg-muted" key={index} />
      ))}
    </div>
  );
}

export function FinanceTab({ jobId, clientName, partyId }: FinanceTabProps) {
  const queryClient = useQueryClient();
  const [addModalOpen, setAddModalOpen] = useState(false);

  const transactionsQuery = useQuery({
    queryKey: ["finance", "transactions", "job", jobId],
    queryFn: () => financeService.getJobTransactions(jobId),
    staleTime: 20_000,
  });

  const createMutation = useMutation({
    mutationFn: financeService.createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });

  const transactions = useMemo(() => transactionsQuery.data ?? [], [transactionsQuery.data]);

  const totals = useMemo(() => {
    const totalRevenue = transactions
      .filter((row) => row.type === "Income")
      .reduce((sum, row) => sum + row.amount, 0);

    const totalCost = transactions
      .filter((row) => row.type === "Expense")
      .reduce((sum, row) => sum + row.amount, 0);

    return {
      totalRevenue,
      totalCost,
      profit: totalRevenue - totalCost,
    };
  }, [transactions]);

  const jobOptions: TransactionJobOption[] = [
    {
      jobId,
      partyId,
      clientName,
    },
  ];

  return (
    <section className="space-y-3">
      <div className="rounded-md border border-border bg-background">
        <div className="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Cost</p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {formatCurrency(totals.totalCost)}
            </p>
          </div>
          <div className="px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Revenue</p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {formatCurrency(totals.totalRevenue)}
            </p>
          </div>
          <div className="px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Profit</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{formatCurrency(totals.profit)}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Job Transactions</p>
        <Button onClick={() => setAddModalOpen(true)} size="sm" variant="secondary">
          Add Expense
        </Button>
      </div>

      {transactionsQuery.isLoading ? <FinanceSkeleton /> : null}

      {!transactionsQuery.isLoading && transactionsQuery.isError ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          Unable to load job transactions.
        </div>
      ) : null}

      {!transactionsQuery.isLoading && !transactionsQuery.isError && transactions.length === 0 ? (
        <div className="rounded-md border border-border p-4 text-sm text-muted-foreground">
          No transactions linked to this job.
        </div>
      ) : null}

      {!transactionsQuery.isLoading && !transactionsQuery.isError && transactions.length > 0 ? (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Transaction
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Type
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Category
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Description
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Date
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Amount
                </th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((row) => (
                <tr className="border-t border-border" key={row.id}>
                  <td className="px-3 py-2 font-medium text-foreground">{row.transactionId}</td>
                  <td className="px-3 py-2">
                    {row.type === "Income" ? (
                      <Badge variant="success">Income</Badge>
                    ) : (
                      <Badge variant="danger">Expense</Badge>
                    )}
                  </td>
                  <td className="px-3 py-2">{row.category}</td>
                  <td className="px-3 py-2">{row.description}</td>
                  <td className="px-3 py-2">{format(parseISO(row.date), "dd-MMM-yyyy")}</td>
                  <td className="px-3 py-2">{formatCurrency(row.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <AddTransactionModal
        forceType="Expense"
        isSubmitting={createMutation.isPending}
        jobs={jobOptions}
        onClose={() => setAddModalOpen(false)}
        onSubmit={(payload) => createMutation.mutate(payload)}
        open={addModalOpen}
        prefilledJobId={jobId}
      />
    </section>
  );
}
