"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { JobStatusBadge } from "@/modules/jobs/components/JobStatusBadge";
import { ShipmentStatusBadge } from "@/modules/shipments/components/ShipmentStatusBadge";
import { AddEditPartyModal } from "@/modules/parties/components/AddEditPartyModal";
import { PartyTypeBadge } from "@/modules/parties/components/PartyTypeBadge";
import type { CurrencyCode } from "@/modules/finance/types";
import { partyService } from "@/services/partyService";

type DetailTab = "jobs" | "transactions" | "shipments";

const TABS: Array<{ id: DetailTab; label: string }> = [
  { id: "jobs", label: "Jobs" },
  { id: "transactions", label: "Transactions" },
  { id: "shipments", label: "Shipments" },
];

function formatCurrency(value: number, currency: CurrencyCode) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function DetailSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-8 w-64 animate-pulse rounded bg-muted" />
      <div className="h-24 animate-pulse rounded bg-muted" />
      <div className="h-52 animate-pulse rounded bg-muted" />
    </div>
  );
}

export function PartyDetailPage({ partyId }: { partyId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<DetailTab>("jobs");
  const [editModalOpen, setEditModalOpen] = useState(false);

  const partyQuery = useQuery({
    queryKey: ["party", partyId],
    queryFn: () => partyService.getPartyById(partyId),
    staleTime: 30_000,
  });

  const jobsQuery = useQuery({
    queryKey: ["party", partyId, "jobs"],
    queryFn: () => partyService.getPartyJobs(partyId),
    staleTime: 20_000,
    enabled: partyQuery.isSuccess,
  });

  const transactionsQuery = useQuery({
    queryKey: ["party", partyId, "transactions"],
    queryFn: () => partyService.getPartyTransactions(partyId),
    staleTime: 20_000,
    enabled: partyQuery.isSuccess,
  });

  const shipmentsQuery = useQuery({
    queryKey: ["party", partyId, "shipments"],
    queryFn: () => partyService.getPartyShipments(partyId),
    staleTime: 20_000,
    enabled: partyQuery.isSuccess,
  });

  const updatePartyMutation = useMutation({
    mutationFn: (payload: Parameters<typeof partyService.updateParty>[1]) =>
      partyService.updateParty(partyId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["party", partyId] });
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      queryClient.invalidateQueries({ queryKey: ["parties", "selector-search"] });
    },
  });

  const hasAnyRelatedData = useMemo(
    () =>
      (jobsQuery.data?.length ?? 0) +
        (transactionsQuery.data?.length ?? 0) +
        (shipmentsQuery.data?.length ?? 0) >
      0,
    [jobsQuery.data?.length, shipmentsQuery.data?.length, transactionsQuery.data?.length],
  );

  if (partyQuery.isLoading) {
    return <DetailSkeleton />;
  }

  if (partyQuery.isError || !partyQuery.data) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        Unable to load party details.
      </div>
    );
  }

  const party = partyQuery.data;

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <Button onClick={() => router.push("/parties")} size="sm" variant="ghost">
            <ArrowLeft className="h-4 w-4" />
            Back to Parties
          </Button>
          <h1 className="page-title">{party.name}</h1>
          <div className="flex items-center gap-2">
            <PartyTypeBadge type={party.type} />
            <span className="text-xs text-muted-foreground">{party.country}</span>
          </div>
        </div>

        <Button onClick={() => setEditModalOpen(true)} size="sm" variant="secondary">
          <Pencil className="h-4 w-4" />
          Edit Party
        </Button>
      </header>

      <section className="rounded-lg border border-border bg-background p-4">
        <h2 className="text-sm font-semibold text-foreground">Party Info</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
            <p className="text-sm text-foreground">{party.email || "-"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Phone</p>
            <p className="text-sm text-foreground">{party.phone || "-"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Country</p>
            <p className="text-sm text-foreground">{party.country}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Address</p>
            <p className="text-sm text-foreground">{party.address || "-"}</p>
          </div>
        </div>
      </section>

      <div className="rounded-lg border border-border">
        <nav className="flex flex-wrap gap-1 border-b border-border p-2">
          {TABS.map((tab) => (
            <button
              className={
                activeTab === tab.id
                  ? "rounded-md border border-accent bg-muted px-3 py-1.5 text-sm"
                  : "rounded-md border border-transparent px-3 py-1.5 text-sm text-muted-foreground hover:border-border"
              }
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4">
          {activeTab === "jobs" ? (
            jobsQuery.isLoading ? (
              <DetailSkeleton />
            ) : jobsQuery.data && jobsQuery.data.length > 0 ? (
              <div className="overflow-x-auto rounded-md border border-border">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Job ID
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Service
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Route
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Status
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobsQuery.data.map((row) => (
                      <tr className="border-t border-border" key={row.id}>
                        <td className="px-3 py-2 font-medium text-foreground">{row.jobId}</td>
                        <td className="px-3 py-2">{row.serviceType}</td>
                        <td className="px-3 py-2">{row.route}</td>
                        <td className="px-3 py-2">
                          <JobStatusBadge status={row.status} />
                        </td>
                        <td className="px-3 py-2">{format(parseISO(row.createdDate), "dd-MMM-yyyy")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No linked jobs.</p>
            )
          ) : null}

          {activeTab === "transactions" ? (
            transactionsQuery.isLoading ? (
              <DetailSkeleton />
            ) : transactionsQuery.data && transactionsQuery.data.length > 0 ? (
              <div className="overflow-x-auto rounded-md border border-border">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Transaction
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Type
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Category
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Amount
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Date
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Job
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactionsQuery.data.map((row) => (
                      <tr className="border-t border-border" key={row.id}>
                        <td className="px-3 py-2 font-medium text-foreground">{row.transactionId}</td>
                        <td className="px-3 py-2">
                          {row.type === "Income" ? (
                            <Badge variant="success">Income</Badge>
                          ) : (
                            <Badge variant="danger">Expense</Badge>
                          )}
                        </td>
                        <td className="px-3 py-2">{row.category}</td>
                        <td className="px-3 py-2">{formatCurrency(row.amount, row.currency)}</td>
                        <td className="px-3 py-2">{format(parseISO(row.date), "dd-MMM-yyyy")}</td>
                        <td className="px-3 py-2">{row.jobId || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No linked transactions.</p>
            )
          ) : null}

          {activeTab === "shipments" ? (
            shipmentsQuery.isLoading ? (
              <DetailSkeleton />
            ) : shipmentsQuery.data && shipmentsQuery.data.length > 0 ? (
              <div className="overflow-x-auto rounded-md border border-border">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Shipment
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Tracking #
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Freight
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Route
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Status
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        ETA
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {shipmentsQuery.data.map((row) => (
                      <tr className="border-t border-border" key={row.id}>
                        <td className="px-3 py-2 font-medium text-foreground">{row.shipmentId}</td>
                        <td className="px-3 py-2">{row.trackingNumber}</td>
                        <td className="px-3 py-2">{row.freightType}</td>
                        <td className="px-3 py-2">{row.route}</td>
                        <td className="px-3 py-2">
                          <ShipmentStatusBadge status={row.status} />
                        </td>
                        <td className="px-3 py-2">{format(parseISO(row.eta), "dd-MMM-yyyy")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No linked shipments.</p>
            )
          ) : null}

          {!hasAnyRelatedData && !jobsQuery.isLoading && !transactionsQuery.isLoading && !shipmentsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">No related operational records for this party yet.</p>
          ) : null}
        </div>
      </div>

      <AddEditPartyModal
        initialParty={party}
        isSaving={updatePartyMutation.isPending}
        onClose={() => setEditModalOpen(false)}
        onSubmit={(payload) => updatePartyMutation.mutate(payload)}
        open={editModalOpen}
      />
    </section>
  );
}
