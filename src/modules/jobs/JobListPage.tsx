"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { motion } from "framer-motion";
import { Eye, Filter, Pencil, Plus, RefreshCw, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { JobStatusBadge } from "@/modules/jobs/components/JobStatusBadge";
import type { JobRecord, JobStatus, JobsQueryFilters } from "@/modules/jobs/types";
import { jobService } from "@/services/jobService";

const HUB_FILTER_OPTIONS = [
  "Mumbai Port Hub",
  "Dhaka Air Cargo",
  "Chittagong Sea Port",
  "Dubai Sea Port",
  "Karachi Port",
  "Singapore Sea Port",
];
const STATUS_OPTIONS: Array<JobStatus | "All"> = [
  "All",
  "Created",
  "Processing",
  "In Transit",
  "Delivered",
  "Completed",
  "Cancelled",
];

const DEFAULT_FILTERS: JobsQueryFilters = {
  search: "",
  status: "All",
  hub: "All",
  fromDate: "",
  toDate: "",
  page: 1,
  pageSize: 8,
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function JobListPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<JobsQueryFilters>(DEFAULT_FILTERS);
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdDate", desc: true }]);

  const jobsQuery = useQuery({
    queryKey: ["jobs", filters],
    queryFn: () => jobService.getJobs(filters),
    staleTime: 30_000,
  });

  const rows = jobsQuery.data?.rows ?? [];

  const columns = useMemo<ColumnDef<JobRecord>[]>(
    () => [
      {
        accessorKey: "jobId",
        header: "Job ID",
        cell: ({ row }) => (
          <span className="font-medium text-foreground">{row.original.jobId}</span>
        ),
      },
      {
        accessorKey: "clientName",
        header: "Client",
      },
      {
        id: "route",
        accessorFn: (row) => `${row.originHub} -> ${row.destinationHub}`,
        header: "Route",
        cell: ({ row }) => `${row.original.originHub} -> ${row.original.destinationHub}`,
      },
      {
        accessorKey: "serviceType",
        header: "Service",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <JobStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "createdDate",
        header: "Created",
        cell: ({ row }) => formatDate(row.original.createdDate),
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-wrap items-center gap-1">
            <Button
              onClick={(event) => {
                event.stopPropagation();
                router.push(`/jobs/${row.original.jobId}`);
              }}
              size="sm"
              variant="ghost"
            >
              <Eye className="h-4 w-4" />
              View
            </Button>

            <Button
              onClick={(event) => {
                event.stopPropagation();
                router.push(`/jobs/${row.original.jobId}?mode=edit`);
              }}
              size="sm"
              variant="ghost"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>

            <Button
              onClick={(event) => {
                event.stopPropagation();
                router.push(`/jobs/${row.original.jobId}`);
              }}
              size="sm"
              variant="ghost"
            >
              <RefreshCw className="h-4 w-4" />
              Update Status
            </Button>
          </div>
        ),
      },
    ],
    [router],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack table instance is scoped locally to this component.
  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  const totalPages = jobsQuery.data
    ? Math.max(1, Math.ceil(jobsQuery.data.total / jobsQuery.data.pageSize))
    : 1;

  return (
    <section className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex-shrink-0 space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="page-title">Job Management</h1>
            <p className="text-sm text-muted-foreground">Track and manage all operational jobs.</p>
          </div>
          <Button onClick={() => router.push("/jobs/create")}>
            <Plus className="h-4 w-4" />
            Create Job
          </Button>
        </header>

        <div className="rounded-lg border border-border p-3">
          <div className="grid gap-2 lg:grid-cols-5">
            <div className="relative lg:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                onChange={(event) =>
                  setFilters((previous) => ({
                    ...previous,
                    search: event.target.value,
                    page: 1,
                  }))
                }
                placeholder="Search by job ID or client"
                value={filters.search}
              />
            </div>

            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select
                className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground"
                onChange={(event) =>
                  setFilters((previous) => ({
                    ...previous,
                    status: event.target.value as JobStatus | "All",
                    page: 1,
                  }))
                }
                value={filters.status}
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                onChange={(event) =>
                  setFilters((previous) => ({
                    ...previous,
                    hub: event.target.value,
                    page: 1,
                  }))
                }
                value={filters.hub}
              >
                <option value="All">All Hubs</option>
                {HUB_FILTER_OPTIONS.map((hub) => (
                  <option key={hub} value={hub}>
                    {hub}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                onChange={(event) =>
                  setFilters((previous) => ({
                    ...previous,
                    fromDate: event.target.value,
                    page: 1,
                  }))
                }
                type="date"
                value={filters.fromDate}
              />
              <Input
                onChange={(event) =>
                  setFilters((previous) => ({
                    ...previous,
                    toDate: event.target.value,
                    page: 1,
                  }))
                }
                type="date"
                value={filters.toDate}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {jobsQuery.isLoading ? <TableSkeleton rows={8} /> : null}

        {!jobsQuery.isLoading && jobsQuery.isError ? (
          <ErrorState message="Failed to load jobs list." onRetry={() => void jobsQuery.refetch()} />
        ) : null}

        {!jobsQuery.isLoading && !jobsQuery.isError && rows.length === 0 ? (
          <EmptyState
            actionLabel="Create Job"
            description="Create your first job to start operations tracking."
            onAction={() => router.push("/jobs/create")}
            title="No jobs yet"
          />
        ) : null}

        {!jobsQuery.isLoading && !jobsQuery.isError && rows.length > 0 ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-border"
            initial={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border p-3">
              <p className="text-xs text-muted-foreground">Batch actions placeholder for selected jobs.</p>
              <div className="flex items-center gap-2">
                <Button disabled size="sm" variant="secondary">
                  Update Status
                </Button>
                <Button disabled size="sm" variant="secondary">
                  Export
                </Button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="sticky top-0 z-10 bg-background">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr className="border-b border-border" key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                          key={header.id}
                        >
                          {header.isPlaceholder ? null : (
                            <button
                              className={
                                header.column.getCanSort()
                                  ? "inline-flex items-center gap-1 hover:text-foreground"
                                  : "inline-flex items-center gap-1"
                              }
                              onClick={header.column.getToggleSortingHandler()}
                              type="button"
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {header.column.getIsSorted() === "asc" ? "^" : null}
                              {header.column.getIsSorted() === "desc" ? "v" : null}
                            </button>
                          )}
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
                      onClick={() => router.push(`/jobs/${row.original.jobId}`)}
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

            <div className="flex flex-shrink-0 items-center justify-between border-t border-border p-3">
              <p className="text-xs text-muted-foreground">
                Page {filters.page} of {totalPages} • {jobsQuery.data?.total ?? 0} jobs
              </p>
              <div className="flex items-center gap-2">
                <Button
                  disabled={filters.page <= 1}
                  onClick={() =>
                    setFilters((previous) => ({
                      ...previous,
                      page: previous.page - 1,
                    }))
                  }
                  size="sm"
                  variant="secondary"
                >
                  Previous
                </Button>
                <Button
                  disabled={filters.page >= totalPages}
                  onClick={() =>
                    setFilters((previous) => ({
                      ...previous,
                      page: previous.page + 1,
                    }))
                  }
                  size="sm"
                  variant="secondary"
                >
                  Next
                </Button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}
