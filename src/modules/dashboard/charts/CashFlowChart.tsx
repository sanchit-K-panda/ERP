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
import type { CashFlowPoint } from "@/services/dashboardService";

type CashFlowChartProps = {
  data: CashFlowPoint[];
  isLoading?: boolean;
  errorMessage?: string | null;
};

function normalizeToNumber(
  value: number | string | readonly (number | string)[] | undefined,
) {
  if (Array.isArray(value)) {
    return Number(value[0] ?? 0);
  }

  return Number(value ?? 0);
}

function ChartSkeleton() {
  return <div className="h-[240px] animate-pulse rounded-md bg-muted" />;
}

export function CashFlowChart({
  data,
  isLoading = false,
  errorMessage,
}: CashFlowChartProps) {
  return (
    <section className="surface p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold">Cash Flow Trend</h3>
        <p className="text-xs text-muted-foreground">Net movement by month</p>
      </div>

      {isLoading ? <ChartSkeleton /> : null}

      {!isLoading && errorMessage ? (
        <ErrorState message={errorMessage} />
      ) : null}

      {!isLoading && !errorMessage && data.length === 0 ? (
        <EmptyState
          description="No chart data is available for the current context."
          title="No chart data"
        />
      ) : null}

      {!isLoading && !errorMessage && data.length > 0 ? (
        <div className="h-[240px]">
          <ResponsiveContainer height="100%" width="100%">
            <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="cashFlowFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="rgb(var(--chart-primary))" stopOpacity={0.24} />
                  <stop offset="95%" stopColor="rgb(var(--chart-primary))" stopOpacity={0.03} />
                </linearGradient>
              </defs>
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
                formatter={(value) =>
                  new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "BDT",
                    currencyDisplay: "narrowSymbol",
                    maximumFractionDigits: 0,
                  }).format(normalizeToNumber(value))
                }
              />
              <Area
                dataKey="value"
                fill="url(#cashFlowFill)"
                stroke="rgb(var(--chart-primary))"
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
