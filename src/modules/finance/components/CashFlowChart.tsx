"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import type { CashFlowPoint } from "@/modules/finance/types";

type CashFlowChartProps = {
  data: CashFlowPoint[];
  isLoading?: boolean;
  isError?: boolean;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "BDT",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(value);
}

function normalizeToNumber(
  value: number | string | readonly (number | string)[] | undefined,
) {
  if (Array.isArray(value)) {
    return Number(value[0] ?? 0);
  }

  return Number(value ?? 0);
}

function ChartSkeleton() {
  return <div className="h-[260px] animate-pulse rounded-md bg-muted" />;
}

export function CashFlowChart({ data, isLoading = false, isError = false }: CashFlowChartProps) {
  return (
    <section className="rounded-lg border border-border bg-background p-4">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-foreground">Cash Flow Trend</h2>
        <p className="text-xs text-muted-foreground">Income vs expense over recent months</p>
      </div>

      {isLoading ? <ChartSkeleton /> : null}

      {!isLoading && isError ? (
        <ErrorState message="Unable to load cash flow data." />
      ) : null}

      {!isLoading && !isError && data.length === 0 ? (
        <EmptyState description="No cash flow data available for the selected period." title="No chart data" />
      ) : null}

      {!isLoading && !isError && data.length > 0 ? (
        <div className="h-[260px]">
          <ResponsiveContainer height="100%" width="100%">
            <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid
                stroke="rgb(var(--chart-grid))"
                strokeDasharray="2 3"
                vertical={false}
              />
              <XAxis
                axisLine={false}
                dataKey="month"
                tick={{ fill: "rgb(var(--chart-tick))", fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                tick={{ fill: "rgb(var(--chart-tick))", fontSize: 12 }}
                tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => formatCurrency(normalizeToNumber(value))}
                labelStyle={{ color: "#0F172A", fontSize: 12 }}
              />
              <Area
                dataKey="income"
                fill="rgba(var(--chart-success), 0.16)"
                fillOpacity={1}
                stroke="rgb(var(--chart-success))"
                strokeWidth={2}
                type="monotone"
              />
              <Area
                dataKey="expense"
                fill="rgba(var(--chart-error), 0.12)"
                fillOpacity={1}
                stroke="rgb(var(--chart-error))"
                strokeWidth={2}
                type="monotone"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </section>
  );
}
