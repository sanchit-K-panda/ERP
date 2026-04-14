"use client";

import { AlertTriangle, Bell, ChartSpline, Truck } from "lucide-react";
import { motion } from "framer-motion";
import type { InsightItem } from "@/services/dashboardService";

type QuickInsightsPanelProps = {
  data: InsightItem[];
  isLoading?: boolean;
  errorMessage?: string | null;
};

const categoryIcon = {
  payments: AlertTriangle,
  shipments: Truck,
  revenue: ChartSpline,
  system: Bell,
} as const;

const priorityClass = {
  high: "text-rose-700",
  medium: "text-amber-700",
  low: "text-slate-600",
} as const;

function InsightsSkeleton() {
  return (
    <aside className="surface p-4">
      <div className="mb-4 h-4 w-28 animate-pulse rounded bg-muted" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="h-14 animate-pulse rounded bg-muted" key={index} />
        ))}
      </div>
    </aside>
  );
}

export function QuickInsightsPanel({
  data,
  isLoading = false,
  errorMessage,
}: QuickInsightsPanelProps) {
  if (isLoading) {
    return <InsightsSkeleton />;
  }

  if (errorMessage) {
    return (
      <aside className="surface p-4">
        <p className="text-sm font-medium text-rose-700">{errorMessage}</p>
      </aside>
    );
  }

  if (data.length === 0) {
    return (
      <aside className="surface p-4">
        <h3 className="text-sm font-semibold">Quick Insights</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          No alerts in the current context.
        </p>
      </aside>
    );
  }

  return (
    <motion.aside
      animate={{ opacity: 1, x: 0 }}
      className="surface h-fit p-4"
      initial={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <h3 className="mb-3 text-sm font-semibold">Quick Insights</h3>

      <motion.ul
        animate="visible"
        className="space-y-2"
        initial="hidden"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.06 },
          },
        }}
      >
        {data.map((item) => {
          const Icon = categoryIcon[item.category];

          return (
            <motion.li
              className="rounded-md border border-border px-3 py-2"
              key={item.id}
              variants={{
                hidden: { opacity: 0, y: 6 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.16 } },
              }}
            >
              <div className="flex items-start gap-2">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-md border border-border text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
                <p className={`text-xs font-medium uppercase tracking-wide ${priorityClass[item.priority]}`}>
                  {item.priority}
                </p>
              </div>
            </motion.li>
          );
        })}
      </motion.ul>
    </motion.aside>
  );
}
