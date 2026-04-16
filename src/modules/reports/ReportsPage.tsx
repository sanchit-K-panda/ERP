"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CalendarRange, Download, Filter, Search, Table2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ReportsTable } from "@/modules/reports/components/ReportsTable";
import {
  REPORT_PRESET_RANGES,
  REPORT_TYPES,
  type ReportExportFormat,
  type ReportFilters,
  type ReportSchema,
  type ReportType,
  type ReportValueFormat,
  type ReportViewMode,
} from "@/modules/reports/types";
import { reportService } from "@/services/reportService";

const LazyReportsCharts = dynamic(
  () => import("@/modules/reports/components/ReportsCharts").then((mod) => mod.ReportsCharts),
  {
    ssr: false,
    loading: () => <div className="h-[360px] animate-pulse rounded-lg border border-border bg-muted" />,
  },
);

const DEFAULT_FILTERS: ReportFilters = {
  reportType: "Revenue vs Expense",
  search: "",
  hub: "All",
  range: "12m",
  fromDate: "",
  toDate: "",
  page: 1,
  pageSize: 8,
};

function fallbackSchema(reportType: ReportType): ReportSchema {
  if (reportType === "Job Throughput") {
    return {
      reportType,
      dimensionLabel: "Period",
      primaryLabel: "Jobs Opened",
      secondaryLabel: "Jobs Completed",
      tertiaryLabel: "Completion %",
      primaryFormat: "number",
      secondaryFormat: "number",
      tertiaryFormat: "percent",
      exportFileName: "job-throughput",
    };
  }

  if (reportType === "Shipment Timeliness") {
    return {
      reportType,
      dimensionLabel: "Period",
      primaryLabel: "On-time Shipments",
      secondaryLabel: "Delayed Shipments",
      tertiaryLabel: "On-time %",
      primaryFormat: "number",
      secondaryFormat: "number",
      tertiaryFormat: "percent",
      exportFileName: "shipment-timeliness",
    };
  }

  return {
    reportType,
    dimensionLabel: "Period",
    primaryLabel: "Revenue",
    secondaryLabel: "Expense",
    tertiaryLabel: "Margin %",
    primaryFormat: "currency",
    secondaryFormat: "currency",
    tertiaryFormat: "percent",
    exportFileName: "revenue-expense",
  };
}

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

export function ReportsPage() {
  const [filters, setFilters] = useState<ReportFilters>(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState<ReportViewMode>("table");
  const [exportFormat, setExportFormat] = useState<ReportExportFormat>("CSV");
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  const reportQuery = useQuery({
    queryKey: ["reports", filters],
    queryFn: () => reportService.getReportData(filters),
    staleTime: 20_000,
  });

  const hubsQuery = useQuery({
    queryKey: ["reports", "hubs", filters.reportType],
    queryFn: () => reportService.getAvailableHubs(filters.reportType),
    staleTime: 60_000,
  });

  const exportMutation = useMutation({
    mutationFn: reportService.requestReportExport,
    onSuccess: (record) => {
      setExportFeedback(`Export ${record.id} queued in ${record.format} format (placeholder).`);
    },
  });

  const activeSchema = useMemo(
    () => reportQuery.data?.schema ?? fallbackSchema(filters.reportType),
    [filters.reportType, reportQuery.data?.schema],
  );

  const totalPages = reportQuery.data
    ? Math.max(1, Math.ceil(reportQuery.data.total / reportQuery.data.pageSize))
    : 1;

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="page-title">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Analyze operational and financial performance with table and chart-driven insights.
        </p>
      </header>

      <section className="rounded-lg border border-border bg-background">
        <ul className="grid gap-0 divide-y divide-border sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
          {(reportQuery.data?.summary ?? []).map((item) => (
            <li className="px-4 py-3" key={item.id}>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-xl font-semibold leading-none text-foreground">
                {formatMetricValue(item.value, item.format)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-border bg-background p-3">
        <div className="grid gap-2 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1.2fr)_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  search: event.target.value,
                  page: 1,
                }))
              }
              placeholder="Search period or hub"
              value={filters.search}
            />
          </div>

          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground"
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  reportType: event.target.value as ReportType,
                  hub: "All",
                  page: 1,
                }))
              }
              value={filters.reportType}
            >
              {REPORT_TYPES.map((type) => (
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
                setFilters((previous) => ({
                  ...previous,
                  hub: event.target.value,
                  page: 1,
                }))
              }
              value={filters.hub}
            >
              <option value="All">All Hubs</option>
              {(hubsQuery.data ?? []).map((hub) => (
                <option key={hub} value={hub}>
                  {hub}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  range: event.target.value as ReportFilters["range"],
                  page: 1,
                }))
              }
              value={filters.range}
            >
              {REPORT_PRESET_RANGES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
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
                  setFilters((previous) => ({
                    ...previous,
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
                setFilters((previous) => ({
                  ...previous,
                  toDate: event.target.value,
                  page: 1,
                }))
              }
              type="date"
              value={filters.toDate}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setViewMode("table")}
              size="sm"
              variant={viewMode === "table" ? "primary" : "secondary"}
            >
              <Table2 className="h-4 w-4" />
              Table
            </Button>
            <Button
              onClick={() => setViewMode("chart")}
              size="sm"
              variant={viewMode === "chart" ? "primary" : "secondary"}
            >
              <Filter className="h-4 w-4" />
              Chart
            </Button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">
            Generated {reportQuery.data?.generatedAt ? new Date(reportQuery.data.generatedAt).toLocaleString("en-IN") : "-"}
          </p>

          <div className="flex items-center gap-2">
            <select
              className="h-8 rounded-md border border-border bg-background px-2 text-xs"
              onChange={(event) => setExportFormat(event.target.value as ReportExportFormat)}
              value={exportFormat}
            >
              <option value="CSV">CSV</option>
              <option value="PDF">PDF</option>
            </select>
            <Button
              disabled={exportMutation.isPending}
              onClick={() => exportMutation.mutate({ filters, format: exportFormat })}
              size="sm"
              variant="secondary"
            >
              <Download className="h-4 w-4" />
              Export (Placeholder)
            </Button>
          </div>
        </div>

        {exportFeedback ? (
          <p className="mt-2 text-xs text-emerald-700">{exportFeedback}</p>
        ) : null}
      </section>

      {viewMode === "table" ? (
        <ReportsTable
          isError={reportQuery.isError}
          isLoading={reportQuery.isLoading}
          onPageChange={(nextPage) =>
            setFilters((previous) => ({
              ...previous,
              page: nextPage,
            }))
          }
          onRetry={() => void reportQuery.refetch()}
          page={filters.page}
          rows={reportQuery.data?.rows ?? []}
          schema={activeSchema}
          total={reportQuery.data?.total ?? 0}
          totalPages={totalPages}
        />
      ) : (
        <LazyReportsCharts
          chartPoints={reportQuery.data?.chartPoints ?? []}
          isError={reportQuery.isError}
          isLoading={reportQuery.isLoading}
          schema={activeSchema}
        />
      )}
    </section>
  );
}
