"use client";

import { format, parseISO } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { CashFlowChart } from "@/modules/finance/components/CashFlowChart";
import { SummaryRow } from "@/modules/finance/components/SummaryRow";
import { financeService } from "@/services/financeService";
import type { TransactionFilters } from "@/modules/finance/types";

const DEFAULT_RECENT_FILTERS: TransactionFilters = {
  search: "",
  type: "All",
  category: "All",
  fromDate: "",
  toDate: "",
  page: 1,
  pageSize: 6,
};

const EMPTY_SUMMARY = {
  cashBalance: 0,
  totalIncomeMonthly: 0,
  totalExpenseMonthly: 0,
  pendingPayments: 0,
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "BDT",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(value);
}

export function FinanceDashboardPage() {
  const router = useRouter();

  const summaryQuery = useQuery({
    queryKey: ["finance", "summary"],
    queryFn: financeService.getFinanceSummary,
    staleTime: 20_000,
  });

  const cashFlowQuery = useQuery({
    queryKey: ["finance", "cashflow"],
    queryFn: financeService.getCashFlowData,
    staleTime: 20_000,
  });

  const transactionsQuery = useQuery({
    queryKey: ["finance", "transactions", "recent"],
    queryFn: () => financeService.getTransactions(DEFAULT_RECENT_FILTERS),
    staleTime: 20_000,
  });

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="page-title">Finance Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Money flow visibility across cash balance, transactions, and pending collections.
        </p>
      </header>

      <SummaryRow summary={summaryQuery.data ?? EMPTY_SUMMARY} />

      <CashFlowChart
        data={cashFlowQuery.data ?? []}
        isError={cashFlowQuery.isError}
        isLoading={cashFlowQuery.isLoading}
      />

      <section className="rounded-lg border border-border bg-background p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Recent Transactions</h2>
            <p className="text-xs text-muted-foreground">Latest income and expense movement</p>
          </div>
          <Button onClick={() => router.push("/finance/transactions")} size="sm" variant="secondary">
            View All
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {transactionsQuery.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton className="h-9" key={index} />
            ))}
          </div>
        ) : null}

        {!transactionsQuery.isLoading && transactionsQuery.isError ? (
          <ErrorState message="Unable to load recent transactions." onRetry={() => void transactionsQuery.refetch()} />
        ) : null}

        {!transactionsQuery.isLoading && !transactionsQuery.isError && (transactionsQuery.data?.rows.length ?? 0) === 0 ? (
          <EmptyState
            description="Recent transactions will appear here once activity is recorded."
            title="No recent transactions"
          />
        ) : null}

        {!transactionsQuery.isLoading && !transactionsQuery.isError && (transactionsQuery.data?.rows.length ?? 0) > 0 ? (
          <ul className="divide-y divide-border">
            {(transactionsQuery.data?.rows ?? []).map((row) => (
              <li className="flex items-center justify-between gap-2 py-2" key={row.id}>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{row.partyName}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.category} • {format(parseISO(row.date), "dd-MMM-yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={row.type === "Income" ? "success" : "danger"}
                  >
                    {row.type}
                  </Badge>
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(row.amount)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </section>
  );
}
