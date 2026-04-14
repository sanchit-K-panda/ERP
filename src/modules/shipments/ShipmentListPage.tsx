"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AddShipmentModal } from "@/modules/shipments/components/AddShipmentModal";
import { FilterBar } from "@/modules/shipments/components/FilterBar";
import { ShipmentsTable } from "@/modules/shipments/components/ShipmentsTable";
import { SummaryStrip } from "@/modules/shipments/components/SummaryStrip";
import type { ShipmentFilters, ShipmentJobOption, ShipmentStatus } from "@/modules/shipments/types";
import { jobService } from "@/services/jobService";
import { shipmentService } from "@/services/shipmentService";

const DEFAULT_FILTERS: ShipmentFilters = {
  search: "",
  status: "All",
  freightType: "All",
  fromDate: "",
  toDate: "",
  page: 1,
  pageSize: 8,
};

const EMPTY_SUMMARY = {
  totalShipments: 0,
  inTransit: 0,
  delivered: 0,
  delayed: 0,
};

export function ShipmentListPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ShipmentFilters>(DEFAULT_FILTERS);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const shipmentsQuery = useQuery({
    queryKey: ["shipments", filters],
    queryFn: () => shipmentService.getShipments(filters),
    staleTime: 20_000,
  });

  const summaryQuery = useQuery({
    queryKey: ["shipment-summary"],
    queryFn: shipmentService.getShipmentSummary,
    staleTime: 20_000,
  });

  const jobsQuery = useQuery({
    queryKey: ["shipment-job-options"],
    queryFn: () =>
      jobService.getJobs({
        search: "",
        status: "All",
        hub: "All",
        fromDate: "",
        toDate: "",
        page: 1,
        pageSize: 200,
      }),
    staleTime: 30_000,
  });

  const createShipmentMutation = useMutation({
    mutationFn: shipmentService.createShipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      queryClient.invalidateQueries({ queryKey: ["shipment-summary"] });
      queryClient.invalidateQueries({ queryKey: ["shipments", "job"] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ shipmentId, nextStatus }: { shipmentId: string; nextStatus: ShipmentStatus }) =>
      shipmentService.updateShipmentStatus(shipmentId, nextStatus),
    onMutate: ({ shipmentId }) => {
      setStatusUpdatingId(shipmentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      queryClient.invalidateQueries({ queryKey: ["shipment-summary"] });
      queryClient.invalidateQueries({ queryKey: ["shipments", "job"] });
    },
    onSettled: () => {
      setStatusUpdatingId(null);
    },
  });

  const jobOptions = useMemo<ShipmentJobOption[]>(
    () =>
      (jobsQuery.data?.rows ?? []).map((job) => ({
        jobId: job.jobId,
        partyId: job.partyId,
        clientName: job.clientName,
        originHub: job.originHub,
        destinationHub: job.destinationHub,
      })),
    [jobsQuery.data?.rows],
  );

  const totalPages = shipmentsQuery.data
    ? Math.max(1, Math.ceil(shipmentsQuery.data.total / shipmentsQuery.data.pageSize))
    : 1;

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="page-title">Shipments & Logistics</h1>
        <p className="text-sm text-muted-foreground">
          Global cargo movement tracking across routes, ETA, and freight channels.
        </p>
      </header>

      <SummaryStrip summary={summaryQuery.data ?? EMPTY_SUMMARY} />

      <FilterBar
        filters={filters}
        onAddShipment={() => setAddModalOpen(true)}
        onFilterChange={(next) =>
          setFilters((previous) => ({
            ...previous,
            ...next,
          }))
        }
      />

      <ShipmentsTable
        data={shipmentsQuery.data?.rows ?? []}
        getNextStatuses={(shipment) => shipmentService.getAllowedStatusTransitions(shipment)}
        isError={shipmentsQuery.isError}
        isLoading={shipmentsQuery.isLoading}
        onAddShipment={() => setAddModalOpen(true)}
        onOpenJob={(jobId) => router.push(`/jobs/${jobId}`)}
        onPageChange={(nextPage) => setFilters((previous) => ({ ...previous, page: nextPage }))}
        onRetry={() => void shipmentsQuery.refetch()}
        onStatusChange={(shipmentId, nextStatus) =>
          updateStatusMutation.mutate({ shipmentId, nextStatus })
        }
        page={filters.page}
        statusUpdatingId={statusUpdatingId}
        total={shipmentsQuery.data?.total ?? 0}
        totalPages={totalPages}
      />

      <AddShipmentModal
        isSubmitting={createShipmentMutation.isPending}
        jobs={jobOptions}
        onClose={() => setAddModalOpen(false)}
        onSubmit={(payload) => createShipmentMutation.mutate(payload)}
        open={addModalOpen}
      />
    </section>
  );
}
