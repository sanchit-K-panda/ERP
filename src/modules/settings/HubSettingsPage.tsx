"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { Filter, Pencil, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { HubFormModal } from "@/modules/settings/components/HubFormModal";
import { settingsService } from "@/services/settingsService";
import type { HubFilters, HubRecord, HubType, UpsertHubPayload } from "@/modules/settings/types";

const DEFAULT_FILTERS: HubFilters = {
  search: "",
  type: "All",
  page: 1,
  pageSize: 8,
};

export function HubSettingsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<HubFilters>(DEFAULT_FILTERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHub, setEditingHub] = useState<HubRecord | null>(null);
  const [statusUpdatingHubId, setStatusUpdatingHubId] = useState<string | null>(null);

  const hubsQuery = useQuery({
    queryKey: ["settings", "hubs", filters],
    queryFn: () => settingsService.getHubs(filters),
    staleTime: 20_000,
  });

  const createMutation = useMutation({
    mutationFn: settingsService.createHub,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "hubs"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ hubId, payload }: { hubId: string; payload: UpsertHubPayload }) =>
      settingsService.updateHub(hubId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "hubs"] });
    },
  });

  const toggleEnabledMutation = useMutation({
    mutationFn: (hub: HubRecord) =>
      settingsService.updateHub(hub.id, {
        name: hub.name,
        country: hub.country,
        city: hub.city,
        type: hub.type,
        enabled: !hub.enabled,
      }),
    onMutate: (hub) => {
      setStatusUpdatingHubId(hub.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "hubs"] });
    },
    onSettled: () => {
      setStatusUpdatingHubId(null);
    },
  });

  const columns = useMemo<ColumnDef<HubRecord>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => <span className="font-medium text-foreground">{row.original.name}</span>,
      },
      {
        accessorKey: "country",
        header: "Country",
      },
      {
        accessorKey: "city",
        header: "City",
      },
      {
        accessorKey: "type",
        header: "Type",
      },
      {
        accessorKey: "enabled",
        header: "Enabled",
        cell: ({ row }) => (
          <Badge variant={row.original.enabled ? "success" : "danger"}>
            {row.original.enabled ? "Enabled" : "Disabled"}
          </Badge>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: "Updated",
        cell: ({ row }) => format(parseISO(row.original.updatedAt), "dd-MMM-yyyy HH:mm"),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button
              onClick={(event) => {
                event.stopPropagation();
                setEditingHub(row.original);
                setModalOpen(true);
              }}
              size="sm"
              variant="ghost"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>

            <Button
              disabled={statusUpdatingHubId === row.original.id}
              onClick={(event) => {
                event.stopPropagation();
                toggleEnabledMutation.mutate(row.original);
              }}
              size="sm"
              variant="secondary"
            >
              {statusUpdatingHubId === row.original.id
                ? "Updating..."
                : row.original.enabled
                  ? "Disable"
                  : "Enable"}
            </Button>
          </div>
        ),
      },
    ],
    [statusUpdatingHubId, toggleEnabledMutation],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack table instance is scoped to this component.
  const table = useReactTable({
    data: hubsQuery.data?.rows ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalPages = hubsQuery.data
    ? Math.max(1, Math.ceil(hubsQuery.data.total / hubsQuery.data.pageSize))
    : 1;

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Hub Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage operational hubs, location metadata, and hub status.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingHub(null);
            setModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Hub
        </Button>
      </header>

      <section className="rounded-lg border border-border bg-background p-3">
        <div className="grid gap-2 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.9fr)]">
          <div className="relative">
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
              placeholder="Search by name, country, city"
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
                  type: event.target.value as HubType | "All",
                  page: 1,
                }))
              }
              value={filters.type}
            >
              <option value="All">All Types</option>
              <option value="HQ">HQ</option>
              <option value="Origin">Origin</option>
              <option value="Destination">Destination</option>
              <option value="Transit">Transit</option>
            </select>
          </div>
        </div>
      </section>

      {hubsQuery.isLoading ? <TableSkeleton rows={8} /> : null}

      {!hubsQuery.isLoading && hubsQuery.isError ? (
        <ErrorState message="Failed to load hubs." onRetry={() => void hubsQuery.refetch()} />
      ) : null}

      {!hubsQuery.isLoading && !hubsQuery.isError && (hubsQuery.data?.rows.length ?? 0) === 0 ? (
        <EmptyState
          actionLabel="Add Hub"
          description="Add your first hub to configure location-level operations."
          onAction={() => {
            setEditingHub(null);
            setModalOpen(true);
          }}
          title="No hubs found"
        />
      ) : null}

      {!hubsQuery.isLoading && !hubsQuery.isError && (hubsQuery.data?.rows.length ?? 0) > 0 ? (
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
                  <tr className="border-b border-border/70" key={row.id}>
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
              Page {filters.page} of {totalPages} • {hubsQuery.data?.total ?? 0} hubs
            </p>
            <div className="flex items-center gap-2">
              <Button
                disabled={filters.page <= 1}
                onClick={() => setFilters((previous) => ({ ...previous, page: previous.page - 1 }))}
                size="sm"
                variant="secondary"
              >
                Previous
              </Button>
              <Button
                disabled={filters.page >= totalPages}
                onClick={() => setFilters((previous) => ({ ...previous, page: previous.page + 1 }))}
                size="sm"
                variant="secondary"
              >
                Next
              </Button>
            </div>
          </div>
        </motion.div>
      ) : null}

      <HubFormModal
        initialHub={editingHub}
        isSaving={createMutation.isPending || updateMutation.isPending}
        onClose={() => {
          setModalOpen(false);
          setEditingHub(null);
        }}
        onSubmit={(payload) => {
          if (editingHub) {
            updateMutation.mutate({ hubId: editingHub.id, payload });
            return;
          }

          createMutation.mutate(payload);
        }}
        open={modalOpen}
      />
    </section>
  );
}
