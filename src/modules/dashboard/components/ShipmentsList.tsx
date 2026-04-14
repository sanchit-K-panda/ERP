"use client";

import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/modules/dashboard/components/DataTable";
import { StatusBadge } from "@/modules/dashboard/components/StatusBadge";
import type { ShipmentItem } from "@/services/dashboardService";

type ShipmentsListProps = {
  data: ShipmentItem[];
  isLoading?: boolean;
  errorMessage?: string | null;
};

export function ShipmentsList({
  data,
  isLoading = false,
  errorMessage,
}: ShipmentsListProps) {
  const columns = useMemo<ColumnDef<ShipmentItem>[]>(
    () => [
      {
        accessorKey: "shipmentId",
        header: "Shipment ID",
        cell: ({ row }) => (
          <span className="font-medium text-foreground">{row.original.shipmentId}</span>
        ),
      },
      {
        accessorKey: "route",
        header: "Route",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "eta",
        header: "ETA",
        cell: ({ row }) => format(parseISO(row.original.eta), "dd-MMM-yyyy"),
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      description="Latest shipment movement and ETA visibility."
      emptyDescription="No shipment records found for this context."
      emptyTitle="No shipments"
      errorMessage={errorMessage}
      isLoading={isLoading}
      searchPlaceholder="Search by ID, route, status"
      title="Latest Shipments"
    />
  );
}
