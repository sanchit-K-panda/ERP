"use client";

import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { ShipmentStatusBadge } from "@/modules/shipments/components/ShipmentStatusBadge";
import type { ShipmentRecord, ShipmentStatus } from "@/modules/shipments/types";

type ShipmentsTableProps = {
  data: ShipmentRecord[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  total: number;
  page: number;
  totalPages: number;
  statusUpdatingId?: string | null;
  onPageChange: (nextPage: number) => void;
  onAddShipment: () => void;
  onOpenJob: (jobId: string) => void;
  onStatusChange: (shipmentId: string, nextStatus: ShipmentStatus) => void;
  getNextStatuses: (shipment: ShipmentRecord) => ShipmentStatus[];
};

export function ShipmentsTable({
  data,
  isLoading = false,
  isError = false,
  onRetry,
  total,
  page,
  totalPages,
  statusUpdatingId,
  onPageChange,
  onAddShipment,
  onOpenJob,
  onStatusChange,
  getNextStatuses,
}: ShipmentsTableProps) {
  const columns = useMemo<ColumnDef<ShipmentRecord>[]>(
    () => [
      {
        accessorKey: "shipmentId",
        header: "Shipment ID",
        cell: ({ row }) => (
          <span className="font-medium text-foreground">{row.original.shipmentId}</span>
        ),
      },
      {
        accessorKey: "jobId",
        header: "Job ID",
        cell: ({ row }) => (
          <button
            className="font-medium text-foreground underline-offset-2 hover:underline"
            onClick={(event) => {
              event.stopPropagation();
              onOpenJob(row.original.jobId);
            }}
            type="button"
          >
            {row.original.jobId}
          </button>
        ),
      },
      {
        accessorKey: "clientName",
        header: "Client Name",
      },
      {
        id: "route",
        header: "Route",
        cell: ({ row }) => (
          <div className="inline-flex items-center gap-1 text-sm">
            <span>{row.original.originHub}</span>
            <MoveRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{row.original.destinationHub}</span>
          </div>
        ),
      },
      {
        accessorKey: "freightType",
        header: "Freight",
      },
      {
        accessorKey: "trackingNumber",
        header: "Tracking #",
      },
      {
        accessorKey: "departureDate",
        header: "Departure",
        cell: ({ row }) => format(parseISO(row.original.departureDate), "dd-MMM-yyyy"),
      },
      {
        accessorKey: "eta",
        header: "ETA",
        cell: ({ row }) => format(parseISO(row.original.eta), "dd-MMM-yyyy"),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <ShipmentStatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const transitions = getNextStatuses(row.original);
          const optionValues = [
            row.original.status,
            ...transitions.filter((status) => status !== row.original.status),
          ];

          return (
            <div className="flex items-center gap-2">
              <select
                className="h-8 rounded-md border border-border bg-background px-2 text-xs"
                disabled={statusUpdatingId === row.original.shipmentId}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => {
                  const nextStatus = event.target.value as ShipmentStatus;
                  if (nextStatus === row.original.status) {
                    return;
                  }

                  const confirmed = window.confirm(
                    `Move ${row.original.shipmentId} from ${row.original.status} to ${nextStatus}?`,
                  );

                  if (!confirmed) {
                    return;
                  }

                  onStatusChange(row.original.shipmentId, nextStatus);
                }}
                value={row.original.status}
              >
                {optionValues.map((status) => (
                  <option key={status} value={status}>
                    {status === row.original.status ? `${status} (Current)` : status}
                  </option>
                ))}
              </select>

              <Button
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenJob(row.original.jobId);
                }}
                size="sm"
                variant="ghost"
              >
                Open Job
              </Button>
            </div>
          );
        },
      },
    ],
    [getNextStatuses, onOpenJob, onStatusChange, statusUpdatingId],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack table instance is scoped to this component.
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return <TableSkeleton rows={8} />;
  }

  if (isError) {
    return <ErrorState message="Failed to load shipments." onRetry={onRetry} />;
  }

  if (data.length === 0) {
    return (
      <EmptyState
        actionLabel="Add Shipment"
        description="Create your first shipment to start live logistics tracking."
        onAction={onAddShipment}
        title="No shipments yet"
      />
    );
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-lg border border-border"
      initial={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.2 }}
    >
      <div className="max-h-[620px] overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-background">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr className="border-b border-border" key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    key={header.id}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                className="interactive-row cursor-pointer border-b border-border/70"
                key={row.id}
                onClick={() => onOpenJob(row.original.jobId)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td className="px-3 py-2" key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-border p-3">
        <p className="text-xs text-muted-foreground">
          Page {page} of {totalPages} • {total} shipments
        </p>
        <div className="flex items-center gap-2">
          <Button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            size="sm"
            variant="secondary"
          >
            Previous
          </Button>
          <Button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            size="sm"
            variant="secondary"
          >
            Next
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
