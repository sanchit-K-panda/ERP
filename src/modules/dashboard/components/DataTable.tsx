"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Search } from "lucide-react";
import { cn } from "@/utils/cn";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";

type DataTableProps<TData extends object> = {
  title: string;
  description: string;
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  searchPlaceholder: string;
  isLoading?: boolean;
  errorMessage?: string | null;
  emptyTitle: string;
  emptyDescription: string;
  emptyCtaLabel?: string;
  onEmptyCta?: () => void;
};

type ColumnMeta = {
  align?: "left" | "center" | "right";
};

function TableSkeleton() {
  return (
    <div className="surface p-4">
      <div className="mb-4 space-y-2">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-3 w-56 animate-pulse rounded bg-muted" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="h-9 animate-pulse rounded bg-muted" key={index} />
        ))}
      </div>
    </div>
  );
}

export function DataTable<TData extends object>({
  title,
  description,
  data,
  columns,
  searchPlaceholder,
  isLoading = false,
  errorMessage,
  emptyTitle,
  emptyDescription,
  emptyCtaLabel,
  onEmptyCta,
}: DataTableProps<TData>) {
  const [globalFilter, setGlobalFilter] = useState("");

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack table instance is local and not memoized across components.
  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const query = String(filterValue).toLowerCase().trim();
      if (!query) {
        return true;
      }

      const values = Object.values(row.original as Record<string, unknown>);
      return values.some((value) => String(value).toLowerCase().includes(query));
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  const hasData = useMemo(() => data.length > 0, [data.length]);

  if (isLoading) {
    return <TableSkeleton />;
  }

  if (errorMessage) {
    return <ErrorState message={errorMessage} />;
  }

  if (!hasData) {
    return (
      <EmptyState
        actionLabel={emptyCtaLabel}
        description={emptyDescription}
        onAction={onEmptyCta}
        title={emptyTitle}
      />
    );
  }

  return (
    <section className="surface p-4">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>

        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            onChange={(event) => setGlobalFilter(event.target.value)}
            placeholder={searchPlaceholder}
            value={globalFilter}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr className="border-b border-border" key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const align =
                    ((header.column.columnDef.meta as ColumnMeta | undefined)?.align ?? "left");

                  return (
                    <th
                      className={cn(
                        "h-11 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                        align === "center" && "text-center",
                        align === "right" && "table-head-numeric",
                      )}
                      key={header.id}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-sm text-muted-foreground" colSpan={columns.length}>
                  No rows match your search.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  className="interactive-row border-b border-border/70"
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => {
                    const align =
                      ((cell.column.columnDef.meta as ColumnMeta | undefined)?.align ?? "left");

                    return (
                      <td
                        className={cn(
                          "h-11 px-3 py-2",
                          align === "right" && "table-cell-numeric",
                          align === "center" && "text-center",
                        )}
                        key={cell.id}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </p>
        <div className="flex items-center gap-2">
          <Button
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            size="sm"
            variant="secondary"
          >
            Previous
          </Button>
          <Button
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            size="sm"
            variant="secondary"
          >
            Next
          </Button>
        </div>
      </div>
    </section>
  );
}
