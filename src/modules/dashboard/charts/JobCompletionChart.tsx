"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ErrorState } from "@/components/ui/ErrorState";

type JobCompletionChartProps = {
  rate: number;
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

export function JobCompletionChart({
  rate,
  isLoading = false,
  errorMessage,
}: JobCompletionChartProps) {
  const safeRate = Math.max(0, Math.min(rate, 100));
  const data = [
    { name: "Completed", value: safeRate },
    { name: "Remaining", value: 100 - safeRate },
  ];

  return (
    <section className="surface p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold">Job Completion Rate</h3>
        <p className="text-xs text-muted-foreground">Current period progress</p>
      </div>

      {isLoading ? <ChartSkeleton /> : null}

      {!isLoading && errorMessage ? (
        <ErrorState message={errorMessage} />
      ) : null}

      {!isLoading && !errorMessage ? (
        <div className="relative h-[240px]">
          <ResponsiveContainer height="100%" width="100%">
            <PieChart>
              <Pie
                cx="50%"
                cy="50%"
                data={data}
                dataKey="value"
                innerRadius={62}
                outerRadius={84}
                paddingAngle={2}
                stroke="none"
              >
                <Cell fill="rgb(var(--chart-primary))" />
                <Cell fill="rgb(var(--chart-grid))" />
              </Pie>
              <Tooltip formatter={(value) => `${normalizeToNumber(value)}%`} />
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-3xl font-semibold tracking-tight text-foreground">{safeRate}%</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
