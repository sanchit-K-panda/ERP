import { AlertCircle, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import type { FinanceSummary } from "@/modules/finance/types";

type SummaryRowProps = {
  summary: FinanceSummary;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

const SUMMARY_ITEMS = [
  { id: "cashBalance", label: "Cash Balance", icon: Wallet },
  { id: "totalIncomeMonthly", label: "Total Income (Monthly)", icon: TrendingUp },
  { id: "totalExpenseMonthly", label: "Total Expense (Monthly)", icon: TrendingDown },
  { id: "pendingPayments", label: "Pending Payments", icon: AlertCircle },
] as const;

export function SummaryRow({ summary }: SummaryRowProps) {
  return (
    <section className="rounded-lg border border-border bg-background">
      <ul className="grid gap-0 divide-y divide-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
        {SUMMARY_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <li className="flex items-center justify-between px-4 py-3" key={item.id}>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-xl font-semibold leading-none text-foreground">
                  {formatCurrency(summary[item.id])}
                </p>
              </div>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
