"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoveRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AddShipmentModal } from "@/modules/shipments/components/AddShipmentModal";
import { ShipmentStatusBadge } from "@/modules/shipments/components/ShipmentStatusBadge";
import type { ShipmentJobOption, ShipmentStatus } from "@/modules/shipments/types";
import { shipmentService } from "@/services/shipmentService";

type LogisticsTabProps = {
  jobId: string;
  partyId?: string;
  clientName: string;
  originHub: string;
  destinationHub: string;
};

function LogisticsSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div className="h-10 animate-pulse rounded bg-muted" key={index} />
      ))}
    </div>
  );
}

export function LogisticsTab({
  jobId,
  partyId,
  clientName,
  originHub,
  destinationHub,
}: LogisticsTabProps) {
  const queryClient = useQueryClient();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const shipmentsQuery = useQuery({
    queryKey: ["shipments", "job", jobId],
    queryFn: () => shipmentService.getShipmentsByJob(jobId),
    staleTime: 20_000,
  });

  const createShipmentMutation = useMutation({
    mutationFn: shipmentService.createShipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      queryClient.invalidateQueries({ queryKey: ["shipment-summary"] });
      queryClient.invalidateQueries({ queryKey: ["shipments", "job", jobId] });
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
      queryClient.invalidateQueries({ queryKey: ["shipments", "job", jobId] });
    },
    onSettled: () => {
      setStatusUpdatingId(null);
    },
  });

  const jobOptions = useMemo<ShipmentJobOption[]>(
    () => [
      {
        jobId,
        partyId,
        clientName,
        originHub,
        destinationHub,
      },
    ],
    [clientName, destinationHub, jobId, originHub, partyId],
  );

  const shipments = shipmentsQuery.data ?? [];

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Linked Shipments</p>
        <Button onClick={() => setAddModalOpen(true)} size="sm" variant="secondary">
          Add Shipment
        </Button>
      </div>

      {shipmentsQuery.isLoading ? <LogisticsSkeleton /> : null}

      {!shipmentsQuery.isLoading && shipmentsQuery.isError ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          Unable to load linked shipments.
        </div>
      ) : null}

      {!shipmentsQuery.isLoading && !shipmentsQuery.isError && shipments.length === 0 ? (
        <div className="rounded-md border border-border p-4 text-sm text-muted-foreground">
          No shipments linked yet.
        </div>
      ) : null}

      {!shipmentsQuery.isLoading && !shipmentsQuery.isError && shipments.length > 0 ? (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Shipment ID
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Tracking #
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Route
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Freight
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  ETA
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((shipment) => (
                <tr className="border-t border-border" key={shipment.id}>
                  <td className="px-3 py-2 font-medium text-foreground">{shipment.shipmentId}</td>
                  <td className="px-3 py-2">{shipment.trackingNumber}</td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1 text-sm">
                      <span>{shipment.originHub}</span>
                      <MoveRight className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{shipment.destinationHub}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2">{shipment.freightType}</td>
                  <td className="px-3 py-2">
                    <ShipmentStatusBadge status={shipment.status} />
                  </td>
                  <td className="px-3 py-2">{format(parseISO(shipment.eta), "dd-MMM-yyyy")}</td>
                  <td className="px-3 py-2">
                    <select
                      className="h-8 rounded-md border border-border bg-background px-2 text-xs"
                      disabled={statusUpdatingId === shipment.shipmentId}
                      onChange={(event) => {
                        const nextStatus = event.target.value as ShipmentStatus;
                        if (nextStatus === shipment.status) {
                          return;
                        }

                        const confirmed = window.confirm(
                          `Move ${shipment.shipmentId} from ${shipment.status} to ${nextStatus}?`,
                        );

                        if (!confirmed) {
                          return;
                        }

                        updateStatusMutation.mutate({
                          shipmentId: shipment.shipmentId,
                          nextStatus,
                        });
                      }}
                      value={shipment.status}
                    >
                      {[shipment.status, ...shipmentService.getAllowedStatusTransitions(shipment)]
                        .filter((status, index, all) => all.indexOf(status) === index)
                        .map((status) => (
                          <option key={status} value={status}>
                            {status === shipment.status ? `${status} (Current)` : status}
                          </option>
                        ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <AddShipmentModal
        isSubmitting={createShipmentMutation.isPending}
        jobs={jobOptions}
        onClose={() => setAddModalOpen(false)}
        onSubmit={(payload) => createShipmentMutation.mutate(payload)}
        open={addModalOpen}
        prefilledJobId={jobId}
      />
    </section>
  );
}
