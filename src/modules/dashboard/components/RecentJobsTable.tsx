"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/modules/dashboard/components/DataTable";
import { StatusBadge } from "@/modules/dashboard/components/StatusBadge";
import type { RecentJob } from "@/services/dashboardService";

type RecentJobsTableProps = {
  data: RecentJob[];
  isLoading?: boolean;
  errorMessage?: string | null;
};

export function RecentJobsTable({
  data,
  isLoading = false,
  errorMessage,
}: RecentJobsTableProps) {
  const router = useRouter();

  const columns = useMemo<ColumnDef<RecentJob>[]>(
    () => [
      {
        accessorKey: "jobId",
        header: "Job ID",
        cell: ({ row }) => (
          <span className="font-medium text-foreground">{row.original.jobId}</span>
        ),
      },
      {
        accessorKey: "client",
        header: "Client",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => format(parseISO(row.original.date), "dd-MMM-yyyy"),
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      description="Latest job activity in selected company and hub."
      emptyCtaLabel="Create Job"
      emptyDescription="No jobs available for this view."
      emptyTitle="No jobs yet"
      errorMessage={errorMessage}
      isLoading={isLoading}
      onEmptyCta={() => router.push("/jobs")}
      searchPlaceholder="Search jobs by ID, client, status"
      title="Recent Jobs"
    />
  );
}
