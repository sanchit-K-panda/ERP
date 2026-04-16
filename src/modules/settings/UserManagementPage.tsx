"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { motion } from "framer-motion";
import { Filter, Pencil, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { AddUserModal, type UserFormPayload } from "@/modules/settings/AddUserModal";
import { RoleBadge } from "@/modules/settings/components/RoleBadge";
import { settingsService } from "@/services/settingsService";
import type {
  SettingsUserRecord,
  SettingsUserStatus,
  SettingsUserRole,
  UpdateUserPayload,
  UserFilters,
} from "@/modules/settings/types";

const DEFAULT_FILTERS: UserFilters = {
  search: "",
  role: "All",
  status: "All",
  page: 1,
  pageSize: 8,
};

export function UserManagementPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<UserFilters>(DEFAULT_FILTERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SettingsUserRecord | null>(null);
  const [statusUpdatingUserId, setStatusUpdatingUserId] = useState<string | null>(null);

  const usersQuery = useQuery({
    queryKey: ["settings", "users", filters],
    queryFn: () => settingsService.getUsers(filters),
    staleTime: 20_000,
  });

  const createMutation = useMutation({
    mutationFn: settingsService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "users"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateUserPayload }) =>
      settingsService.updateUser(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "users"] });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: settingsService.toggleUserStatus,
    onMutate: (userId) => {
      setStatusUpdatingUserId(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "users"] });
    },
    onSettled: () => {
      setStatusUpdatingUserId(null);
    },
  });

  const columns = useMemo<ColumnDef<SettingsUserRecord>[]>(
    () => [
      {
        accessorKey: "fullName",
        header: "Name",
        cell: ({ row }) => <span className="font-medium text-foreground">{row.original.fullName}</span>,
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => <RoleBadge role={row.original.role} />,
      },
      {
        accessorKey: "company",
        header: "Company",
        cell: ({ row }) => (
          <span className="block max-w-[260px] truncate" title={row.original.company}>
            {row.original.company}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.status === "Active" ? "success" : "danger"}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const isUpdatingStatus = statusUpdatingUserId === row.original.id;
          const actionLabel = row.original.status === "Active" ? "Disable" : "Enable";

          return (
            <div className="flex items-center gap-2">
              <Button
                onClick={(event) => {
                  event.stopPropagation();
                  setEditingUser(row.original);
                  setModalOpen(true);
                }}
                size="sm"
                variant="ghost"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>

              <Button
                disabled={isUpdatingStatus}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleStatusMutation.mutate(row.original.id);
                }}
                size="sm"
                variant="secondary"
              >
                {isUpdatingStatus ? "Updating..." : actionLabel}
              </Button>
            </div>
          );
        },
      },
    ],
    [statusUpdatingUserId, toggleStatusMutation],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack table instance is scoped to this component.
  const table = useReactTable({
    data: usersQuery.data?.rows ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalPages = usersQuery.data
    ? Math.max(1, Math.ceil(usersQuery.data.total / usersQuery.data.pageSize))
    : 1;

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="text-sm text-muted-foreground">
            Administer users, assign roles, and control access status across companies.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingUser(null);
            setModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </header>

      <section className="rounded-lg border border-border bg-background p-3">
        <div className="grid gap-2 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.9fr)_minmax(0,0.9fr)]">
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
              placeholder="Search by name, email, company"
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
                  role: event.target.value as SettingsUserRole | "All",
                  page: 1,
                }))
              }
              value={filters.role}
            >
              <option value="All">All Roles</option>
              <option value="BUSINESS_OWNER">BUSINESS_OWNER</option>
              <option value="BUSINESS_MANAGER">BUSINESS_MANAGER</option>
              <option value="SALES_MANAGER">SALES_MANAGER</option>
              <option value="SALES_PERSON">SALES_PERSON</option>
              <option value="PROJECT_MANAGER">PROJECT_MANAGER</option>
              <option value="STOCK_MANAGER">STOCK_MANAGER</option>
            </select>
          </div>

          <div>
            <select
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  status: event.target.value as SettingsUserStatus | "All",
                  page: 1,
                }))
              }
              value={filters.status}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Disabled">Disabled</option>
            </select>
          </div>
        </div>
      </section>

      {usersQuery.isLoading ? <TableSkeleton rows={8} /> : null}

      {!usersQuery.isLoading && usersQuery.isError ? (
        <ErrorState message="Failed to load users." onRetry={() => void usersQuery.refetch()} />
      ) : null}

      {!usersQuery.isLoading && !usersQuery.isError && (usersQuery.data?.rows.length ?? 0) === 0 ? (
        <EmptyState
          actionLabel="Add User"
          description="Add a user to begin assigning role-based access."
          onAction={() => {
            setEditingUser(null);
            setModalOpen(true);
          }}
          title="No users found"
        />
      ) : null}

      {!usersQuery.isLoading && !usersQuery.isError && (usersQuery.data?.rows.length ?? 0) > 0 ? (
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
              Page {filters.page} of {totalPages} • {usersQuery.data?.total ?? 0} users
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

      <AddUserModal
        initialUser={editingUser}
        isSaving={createMutation.isPending || updateMutation.isPending}
        onClose={() => {
          setModalOpen(false);
          setEditingUser(null);
        }}
        onSubmit={(payload: UserFormPayload) => {
          if (editingUser) {
            updateMutation.mutate({
              userId: editingUser.id,
              payload: {
                fullName: payload.fullName,
                email: payload.email,
                role: payload.role,
                company: payload.company,
                password: payload.password,
              },
            });
            return;
          }

          createMutation.mutate({
            fullName: payload.fullName,
            email: payload.email,
            role: payload.role,
            company: payload.company,
            password: payload.password ?? "123456",
          });
        }}
        open={modalOpen}
      />
    </section>
  );
}
