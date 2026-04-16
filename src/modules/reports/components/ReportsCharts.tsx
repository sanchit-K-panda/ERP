"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import type { ReportChartPoint, ReportSchema, ReportValueFormat } from "@/modules/reports/types";

type ReportsChartsProps = {
  chartPoints: ReportChartPoint[];
  schema: ReportSchema;
  isLoading?: boolean;
  isError?: boolean;
};

function normalizeToNumber(
  value: number | string | readonly (number | string)[] | undefined,
) {
  if (Array.isArray(value)) {
    return Number(value[0] ?? 0);
  }

  return Number(value ?? 0);
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

function ChartSkeleton() {
  return <div className="h-[360px] animate-pulse rounded-md bg-muted" />;
}

export function ReportsCharts({
  chartPoints,
  schema,
  isLoading = false,
  isError = false,
}: ReportsChartsProps) {
  return (
    <section className="rounded-lg border border-border bg-background p-4">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-foreground">{schema.reportType}</h2>
        <p className="text-xs text-muted-foreground">
          Visual comparison of {schema.primaryLabel.toLowerCase()} and {schema.secondaryLabel.toLowerCase()}.
        </p>
      </div>

      {isLoading ? <ChartSkeleton /> : null}

      {!isLoading && isError ? (
        <ErrorState message="Unable to load report charts." />
      ) : null}

      {!isLoading && !isError && chartPoints.length === 0 ? (
        <EmptyState
          description="Try broadening the date range or clearing one of the filters."
          title="No chart points available"
        />
      ) : null}

      {!isLoading && !isError && chartPoints.length > 0 ? (
        <div className="h-[360px]">
          <ResponsiveContainer height="100%" width="100%">
            <ComposedChart data={chartPoints} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid
                stroke="rgb(var(--chart-grid))"
                strokeDasharray="2 3"
                vertical={false}
              />
              <XAxis
                axisLine={false}
                dataKey="dimension"
                tick={{ fill: "rgb(var(--chart-tick))", fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                tick={{ fill: "rgb(var(--chart-tick))", fontSize: 12 }}
                tickFormatter={(value: number) => {
                  if (schema.primaryFormat === "currency") {
                    return new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "BDT",
                      currencyDisplay: "narrowSymbol",
                      maximumFractionDigits: 0,
                    }).format(value);
                  }

                  return `${Math.round(value)}`;
                }}
                tickLine={false}
                yAxisId="left"
              />
              <YAxis
                axisLine={false}
                orientation="right"
                tick={{ fill: "rgb(var(--chart-tick))", fontSize: 12 }}
                tickFormatter={(value: number) => `${Math.round(value)}%`}
                tickLine={false}
                yAxisId="right"
              />
              <Tooltip
                formatter={(value, name) => {
                  const numericValue = normalizeToNumber(value);
                  const format: ReportValueFormat =
                    name === "primaryValue"
                      ? schema.primaryFormat
                      : name === "secondaryValue"
                        ? schema.secondaryFormat
                        : schema.tertiaryFormat;

                  return formatMetricValue(numericValue, format);
                }}
                labelStyle={{ color: "#0F172A", fontSize: 12 }}
              />
              <Legend
                formatter={(value) => {
                  if (value === "primaryValue") {
                    return schema.primaryLabel;
                  }

                  if (value === "secondaryValue") {
                    return schema.secondaryLabel;
                  }

                  return schema.tertiaryLabel;
                }}
              />
              <Bar
                dataKey="primaryValue"
                fill="rgb(var(--chart-primary))"
                maxBarSize={28}
                radius={[4, 4, 0, 0]}
                yAxisId="left"
              />
              <Bar
                dataKey="secondaryValue"
                fill="rgb(var(--chart-secondary))"
                maxBarSize={28}
                radius={[4, 4, 0, 0]}
                yAxisId="left"
              />
              <Line
                dataKey="tertiaryValue"
                dot={{ fill: "rgb(var(--chart-tertiary))", r: 2 }}
                stroke="rgb(var(--chart-tertiary))"
                strokeWidth={2}
                type="monotone"
                yAxisId="right"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </section>
  );
}
