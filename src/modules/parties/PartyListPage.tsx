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
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { AddEditPartyModal } from "@/modules/parties/components/AddEditPartyModal";
import { PartyTypeBadge } from "@/modules/parties/components/PartyTypeBadge";
import { partyService } from "@/services/partyService";
import type {
  CreatePartyPayload,
  PartyFilters,
  PartyRecord,
  PartyType,
} from "@/modules/parties/types";

const DEFAULT_FILTERS: PartyFilters = {
  search: "",
  type: "All",
  country: "All",
  page: 1,
  pageSize: 10,
};

const COUNTRY_OPTIONS = ["India"];

export function PartyListPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<PartyFilters>(DEFAULT_FILTERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<PartyRecord | null>(null);

  const partiesQuery = useQuery({
    queryKey: ["parties", filters],
    queryFn: () => partyService.getParties(filters),
    staleTime: 20_000,
  });

  const createMutation = useMutation({
    mutationFn: partyService.createParty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      queryClient.invalidateQueries({ queryKey: ["parties", "selector-search"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ partyId, payload }: { partyId: string; payload: CreatePartyPayload }) =>
      partyService.updateParty(partyId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      queryClient.invalidateQueries({ queryKey: ["parties", "selector-search"] });
    },
  });

  const columns = useMemo<ColumnDef<PartyRecord>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => <span className="font-medium text-foreground">{row.original.name}</span>,
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => <PartyTypeBadge type={row.original.type} />,
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => row.original.email || "-",
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => row.original.phone || "-",
      },
      {
        accessorKey: "country",
        header: "Country",
      },
      {
        accessorKey: "createdDate",
        header: "Created Date",
        cell: ({ row }) => format(parseISO(row.original.createdDate), "dd-MMM-yyyy"),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Button
            onClick={(event) => {
              event.stopPropagation();
              setEditingParty(row.original);
              setModalOpen(true);
            }}
            size="sm"
            variant="ghost"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        ),
      },
    ],
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack table instance is scoped to this component.
  const table = useReactTable({
    data: partiesQuery.data?.rows ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalPages = partiesQuery.data
    ? Math.max(1, Math.ceil(partiesQuery.data.total / partiesQuery.data.pageSize))
    : 1;

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Parties</h1>
          <p className="text-sm text-muted-foreground">
            Clients, vendors, agents, and brokers used across operations.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingParty(null);
            setModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Party
        </Button>
      </header>

      <section className="rounded-lg border border-border bg-background p-3">
        <div className="grid gap-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,0.8fr)]">
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
              placeholder="Search by name, email, phone"
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
                  type: event.target.value as PartyType | "All",
                  page: 1,
                }))
              }
              value={filters.type}
            >
              <option value="All">All Types</option>
              <option value="Client">Client</option>
              <option value="Vendor">Vendor</option>
              <option value="Agent">Agent</option>
              <option value="Broker">Broker</option>
            </select>
          </div>

          <div>
            <select
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  country: event.target.value,
                  page: 1,
                }))
              }
              value={filters.country}
            >
              <option value="All">All Countries</option>
              {COUNTRY_OPTIONS.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {partiesQuery.isLoading ? <TableSkeleton rows={9} /> : null}

      {!partiesQuery.isLoading && partiesQuery.isError ? (
        <ErrorState message="Failed to load parties." onRetry={() => void partiesQuery.refetch()} />
      ) : null}

      {!partiesQuery.isLoading && !partiesQuery.isError && (partiesQuery.data?.rows.length ?? 0) === 0 ? (
        <EmptyState
          actionLabel="Add Party"
          description="Add your first party to enable linked jobs and finance operations."
          onAction={() => {
            setEditingParty(null);
            setModalOpen(true);
          }}
          title="No parties yet"
        />
      ) : null}

      {!partiesQuery.isLoading && !partiesQuery.isError && (partiesQuery.data?.rows.length ?? 0) > 0 ? (
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
                    onClick={() => router.push(`/parties/${row.original.id}`)}
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
              Page {filters.page} of {totalPages} • {partiesQuery.data?.total ?? 0} parties
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

      <AddEditPartyModal
        initialParty={editingParty}
        isSaving={createMutation.isPending || updateMutation.isPending}
        onClose={() => {
          setModalOpen(false);
          setEditingParty(null);
        }}
        onSubmit={(payload) => {
          if (editingParty) {
            updateMutation.mutate({ partyId: editingParty.id, payload });
            return;
          }

          createMutation.mutate(payload);
        }}
        open={modalOpen}
      />
    </section>
  );
}
