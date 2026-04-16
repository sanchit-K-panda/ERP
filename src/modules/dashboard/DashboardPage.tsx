"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRoleCompanyContext } from "@/constants/roleContext";
import { useAuth } from "@/hooks/useAuth";
import { useContextStore } from "@/store/contextStore";
import { dashboardService } from "@/services/dashboardService";
import { KpiRow } from "@/modules/dashboard/components/KpiRow";
import { RecentJobsTable } from "@/modules/dashboard/components/RecentJobsTable";
import { TransactionsList } from "@/modules/dashboard/components/TransactionsList";
import { ShipmentsList } from "@/modules/dashboard/components/ShipmentsList";
import { QuickInsightsPanel } from "@/modules/dashboard/components/QuickInsightsPanel";
import { RevenueExpenseChart } from "@/modules/dashboard/charts/RevenueExpenseChart";
import { JobCompletionChart } from "@/modules/dashboard/charts/JobCompletionChart";
import { CashFlowChart } from "@/modules/dashboard/charts/CashFlowChart";
import { cn } from "@/utils/cn";

export function DashboardPage() {
  const { user, role } = useAuth();
  const activeCompany = useContextStore((state) => state.activeCompany);
  const activeHub = useContextStore((state) => state.activeHub);
  const roleFallbackCompany = getRoleCompanyContext(role);
  const fallbackCompanyName = roleFallbackCompany.name;
  const activeRole = role ?? "BUSINESS_OWNER";
  const showTransactions = activeRole !== "SALES_PERSON";
  const showInsights = activeRole !== "SALES_PERSON";
  const showPerformance = activeRole === "BUSINESS_OWNER";

  const kpiQuery = useQuery({
    queryKey: ["dashboard", "kpis", activeCompany?.id, activeHub?.id],
    queryFn: dashboardService.getKpis,
    staleTime: 30_000,
  });

  const jobsQuery = useQuery({
    queryKey: ["dashboard", "jobs", activeCompany?.id, activeHub?.id],
    queryFn: dashboardService.getRecentJobs,
    staleTime: 30_000,
  });

  const transactionsQuery = useQuery({
    queryKey: ["dashboard", "transactions", activeCompany?.id, activeHub?.id],
    queryFn: dashboardService.getTransactions,
    enabled: showTransactions,
    staleTime: 30_000,
  });

  const shipmentsQuery = useQuery({
    queryKey: ["dashboard", "shipments", activeCompany?.id, activeHub?.id],
    queryFn: dashboardService.getShipments,
    staleTime: 30_000,
  });

  const insightsQuery = useQuery({
    queryKey: ["dashboard", "insights", activeCompany?.id, activeHub?.id],
    queryFn: dashboardService.getInsights,
    enabled: showInsights,
    staleTime: 30_000,
  });

  const performanceQuery = useQuery({
    queryKey: ["dashboard", "performance", activeCompany?.id, activeHub?.id],
    queryFn: dashboardService.getPerformanceData,
    enabled: showPerformance,
    staleTime: 30_000,
  });

  const roleFilteredKpis = useMemo(() => {
    const rows = kpiQuery.data ?? [];

    if (activeRole === "BUSINESS_MANAGER") {
      return rows.filter((metric) => metric.id !== "pendingPayments");
    }

    if (activeRole === "SALES_PERSON") {
      return rows.filter((metric) => ["totalJobs", "revenue", "cashBalance"].includes(metric.id));
    }

    return rows;
  }, [activeRole, kpiQuery.data]);

  const roleFilteredJobs = useMemo(() => {
    const rows = jobsQuery.data ?? [];

    if (activeRole === "SALES_PERSON") {
      return rows.filter((job) => job.client === "Eastern Overseas Shipping Lines Ltd");
    }

    return rows;
  }, [activeRole, jobsQuery.data]);

  const contextSummary = useMemo(
    () =>
      `${activeCompany?.name ?? fallbackCompanyName} • ${activeHub?.name ?? "Chittagong Sea Port"}`,
    [activeCompany?.name, activeHub?.name, fallbackCompanyName],
  );

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="page-title">Welcome {user?.name}</h1>
        <p className="text-sm text-muted-foreground">
          {role ?? "BUSINESS_OWNER"} • {contextSummary}
        </p>
      </header>

      <KpiRow
        data={roleFilteredKpis}
        errorMessage={kpiQuery.isError ? "Unable to load KPI metrics." : null}
        isLoading={kpiQuery.isLoading}
      />

      <div
        className={cn(
          "grid gap-4",
          showInsights ? "xl:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]" : "xl:grid-cols-1",
        )}
      >
        <div className="space-y-4">
          <RecentJobsTable
            data={roleFilteredJobs}
            errorMessage={jobsQuery.isError ? "Unable to load recent jobs." : null}
            isLoading={jobsQuery.isLoading}
          />

          {showTransactions ? (
            <TransactionsList
              data={transactionsQuery.data ?? []}
              errorMessage={
                transactionsQuery.isError ? "Unable to load recent transactions." : null
              }
              isLoading={transactionsQuery.isLoading}
            />
          ) : null}

          <ShipmentsList
            data={shipmentsQuery.data ?? []}
            errorMessage={shipmentsQuery.isError ? "Unable to load shipments." : null}
            isLoading={shipmentsQuery.isLoading}
          />
        </div>

        {showInsights ? (
          <QuickInsightsPanel
            data={insightsQuery.data ?? []}
            errorMessage={insightsQuery.isError ? "Unable to load insights." : null}
            isLoading={insightsQuery.isLoading}
          />
        ) : null}
      </div>

      {showPerformance ? (
        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">Performance Overview</h2>
            <p className="text-sm text-muted-foreground">Revenue, completion, and cash flow</p>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <RevenueExpenseChart
              data={performanceQuery.data?.revenueExpense ?? []}
              errorMessage={
                performanceQuery.isError ? "Unable to load revenue and expense chart." : null
              }
              isLoading={performanceQuery.isLoading}
            />

            <JobCompletionChart
              errorMessage={
                performanceQuery.isError ? "Unable to load completion chart." : null
              }
              isLoading={performanceQuery.isLoading}
              rate={performanceQuery.data?.jobCompletionRate ?? 0}
            />

            <CashFlowChart
              data={performanceQuery.data?.cashFlow ?? []}
              errorMessage={
                performanceQuery.isError ? "Unable to load cash flow chart." : null
              }
              isLoading={performanceQuery.isLoading}
            />
          </div>
        </section>
      ) : null}
    </section>
  );
}
