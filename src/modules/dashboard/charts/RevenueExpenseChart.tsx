"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import type { RevenueExpensePoint } from "@/services/dashboardService";

type RevenueExpenseChartProps = {
  data: RevenueExpensePoint[];
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

export function RevenueExpenseChart({
  data,
  isLoading = false,
  errorMessage,
}: RevenueExpenseChartProps) {
  return (
    <section className="surface p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold">Revenue vs Expense</h3>
        <p className="text-xs text-muted-foreground">Monthly comparison</p>
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
            <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
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
                cursor={{ fill: "rgba(148, 163, 184, 0.12)" }}
                formatter={(value) =>
                  new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "BDT",
                    currencyDisplay: "narrowSymbol",
                    maximumFractionDigits: 0,
                  }).format(normalizeToNumber(value))
                }
              />
              <Bar dataKey="revenue" fill="rgb(var(--chart-primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="rgb(var(--chart-secondary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </section>
  );
}
