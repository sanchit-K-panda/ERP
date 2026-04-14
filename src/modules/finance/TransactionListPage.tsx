"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { CalendarRange, Filter, Plus, Search } from "lucide-react";
import { AddTransactionModal } from "@/modules/finance/components/AddTransactionModal";
import { TransactionsTable } from "@/modules/finance/components/TransactionsTable";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TRANSACTION_CATEGORIES } from "@/modules/finance/types";
import type { TransactionFilters, TransactionJobOption, TransactionType } from "@/modules/finance/types";
import { financeService } from "@/services/financeService";
import { jobService } from "@/services/jobService";

const DEFAULT_FILTERS: TransactionFilters = {
  search: "",
  type: "All",
  category: "All",
  fromDate: "",
  toDate: "",
  page: 1,
  pageSize: 10,
};

const TYPE_OPTIONS: Array<TransactionType | "All"> = ["All", "Income", "Expense"];

export function TransactionListPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<TransactionFilters>(DEFAULT_FILTERS);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const transactionsQuery = useQuery({
    queryKey: ["finance", "transactions", filters],
    queryFn: () => financeService.getTransactions(filters),
    staleTime: 20_000,
  });

  const jobsQuery = useQuery({
    queryKey: ["finance", "job-options"],
    queryFn: () =>
      jobService.getJobs({
        search: "",
        status: "All",
        hub: "All",
        fromDate: "",
        toDate: "",
        page: 1,
        pageSize: 200,
      }),
    staleTime: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: financeService.createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });

  const jobOptions = useMemo<TransactionJobOption[]>(
    () =>
      (jobsQuery.data?.rows ?? []).map((job) => ({
        jobId: job.jobId,
        partyId: job.partyId,
        clientName: job.clientName,
      })),
    [jobsQuery.data?.rows],
  );

  const totalPages = transactionsQuery.data
    ? Math.max(1, Math.ceil(transactionsQuery.data.total / transactionsQuery.data.pageSize))
    : 1;

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="text-sm text-muted-foreground">
            Manage income and expense movement with job-linked context.
          </p>
        </div>
        <Button onClick={() => setAddModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </header>

      <section className="rounded-lg border border-border bg-background p-3">
        <div className="grid gap-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.7fr)_minmax(0,0.9fr)_minmax(0,1fr)]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value, page: 1 }))}
              placeholder="Search by transaction, party, or job"
              value={filters.search}
            />
          </div>

          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground"
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  type: event.target.value as TransactionType | "All",
                  page: 1,
                }))
              }
              value={filters.type}
            >
              {TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  category: event.target.value,
                  page: 1,
                }))
              }
              value={filters.category}
            >
              <option value="All">All Categories</option>
              {TRANSACTION_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <CalendarRange className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-8"
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    fromDate: event.target.value,
                    page: 1,
                  }))
                }
                type="date"
                value={filters.fromDate}
              />
            </div>
            <Input
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  toDate: event.target.value,
                  page: 1,
                }))
              }
              type="date"
              value={filters.toDate}
            />
          </div>
        </div>
      </section>

      <TransactionsTable
        isError={transactionsQuery.isError}
        isLoading={transactionsQuery.isLoading}
        onAddTransaction={() => setAddModalOpen(true)}
        onOpenJob={(jobId) => router.push(`/jobs/${jobId}`)}
        onPageChange={(nextPage) => setFilters((prev) => ({ ...prev, page: nextPage }))}
        onRetry={() => void transactionsQuery.refetch()}
        page={filters.page}
        rows={transactionsQuery.data?.rows ?? []}
        total={transactionsQuery.data?.total ?? 0}
        totalPages={totalPages}
      />

      <AddTransactionModal
        isSubmitting={createMutation.isPending}
        jobs={jobOptions}
        onClose={() => setAddModalOpen(false)}
        onSubmit={(payload) => createMutation.mutate(payload)}
        open={addModalOpen}
      />
    </section>
  );
}
