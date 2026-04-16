"use client";

import { ArrowDownRight, ArrowUpRight, BriefcaseBusiness, CircleDollarSign, Landmark, Receipt, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import type { KpiMetric } from "@/services/dashboardService";

const KPI_ICON_MAP = {
  totalJobs: BriefcaseBusiness,
  revenue: CircleDollarSign,
  expenses: Receipt,
  cashBalance: Wallet,
  pendingPayments: Landmark,
} as const;

type KpiRowProps = {
  data: KpiMetric[];
  isLoading?: boolean;
  errorMessage?: string | null;
};

function formatValue(metric: KpiMetric) {
  if (metric.id === "totalJobs") {
    return metric.value.toLocaleString("en-IN");
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "BDT",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(metric.value);
}

function KpiSkeleton() {
  return (
    <div className="surface grid gap-0 md:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div className="border-r border-border p-4 last:border-r-0" key={index}>
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-6 w-28 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-3 w-16 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function KpiRow({ data, isLoading = false, errorMessage }: KpiRowProps) {
  if (isLoading) {
    return <KpiSkeleton />;
  }

  if (errorMessage) {
    return (
      <div className="surface p-4">
        <p className="text-sm font-medium text-rose-700">{errorMessage}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="surface p-4">
        <p className="text-sm text-muted-foreground">No KPI data available right now.</p>
      </div>
    );
  }

  return (
    <motion.section
      animate="visible"
      className="surface grid gap-0 md:grid-cols-3 xl:grid-cols-5"
      initial="hidden"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.05 },
        },
      }}
    >
      {data.map((metric) => {
        const Icon = KPI_ICON_MAP[metric.id];
        const isPositive = metric.trend >= 0;

        return (
          <motion.div
            className="border-r border-border p-4 last:border-r-0"
            key={metric.id}
            variants={{
              hidden: { opacity: 0, y: 6 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.18 } },
            }}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {metric.label}
              </p>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground">
                <Icon className="h-4 w-4" />
              </span>
            </div>

            <p className="text-2xl font-semibold tracking-tight text-foreground">{formatValue(metric)}</p>

            <p
              className={
                isPositive
                  ? "mt-1 inline-flex items-center gap-1 text-xs font-medium text-emerald-700"
                  : "mt-1 inline-flex items-center gap-1 text-xs font-medium text-rose-700"
              }
            >
              {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {metric.trend > 0 ? "+" : ""}
              {metric.trend.toFixed(1)}%
            </p>
          </motion.div>
        );
      })}
    </motion.section>
  );
}
