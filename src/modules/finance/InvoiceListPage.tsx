"use client";

import { format, parseISO } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { financeService } from "@/services/financeService";
import type { CurrencyCode, InvoiceStatus } from "@/modules/finance/types";

function formatCurrency(value: number, currency: CurrencyCode) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(value);
}

function statusBadge(status: InvoiceStatus) {
  if (status === "Paid") {
    return <Badge variant="success">Paid</Badge>;
  }

  if (status === "Pending") {
    return <Badge variant="warning">Pending</Badge>;
  }

  return <Badge variant="danger">Overdue</Badge>;
}

export function InvoiceListPage() {
  const invoicesQuery = useQuery({
    queryKey: ["finance", "invoices"],
    queryFn: financeService.getInvoices,
    staleTime: 30_000,
  });

  return (
    <section className="space-y-4">
      <header>
        <h1 className="page-title">Invoices</h1>
        <p className="text-sm text-muted-foreground">
          Monitor billing status for job-linked invoices.
        </p>
      </header>

      {invoicesQuery.isLoading ? <TableSkeleton rows={6} /> : null}

      {!invoicesQuery.isLoading && invoicesQuery.isError ? (
        <ErrorState message="Failed to load invoices." onRetry={() => void invoicesQuery.refetch()} />
      ) : null}

      {!invoicesQuery.isLoading && !invoicesQuery.isError && (invoicesQuery.data?.length ?? 0) === 0 ? (
        <EmptyState
          description="Invoice generation is planned in the next release phase."
          title="No invoices yet"
        />
      ) : null}

      {!invoicesQuery.isLoading && !invoicesQuery.isError && (invoicesQuery.data?.length ?? 0) > 0 ? (
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="max-h-[620px] overflow-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 z-10 bg-background">
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Invoice ID
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Job ID
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Amount
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Due Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {(invoicesQuery.data ?? []).map((invoice) => (
                  <tr className="interactive-row border-b border-border/70" key={invoice.id}>
                    <td className="px-3 py-2 font-medium text-foreground">{invoice.invoiceId}</td>
                    <td className="px-3 py-2">{invoice.jobId ?? "-"}</td>
                    <td className="table-cell-numeric px-3 py-2">{formatCurrency(invoice.amount, invoice.currency)}</td>
                    <td className="px-3 py-2">{statusBadge(invoice.status)}</td>
                    <td className="px-3 py-2">{format(parseISO(invoice.dueDate), "dd-MMM-yyyy")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  );
}
