"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Filter, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { InventoryTable } from "@/modules/warehouse/components/InventoryTable";
import { MovementTable } from "@/modules/warehouse/components/MovementTable";
import type {
  InventoryFilters,
  MovementFilters,
  RecordMovementPayload,
  StockMovementType,
} from "@/modules/warehouse/types";
import { warehouseService } from "@/services/warehouseService";

const DEFAULT_INVENTORY_FILTERS: InventoryFilters = {
  search: "",
  warehouse: "All",
  status: "All",
  category: "All",
  page: 1,
  pageSize: 8,
};

const DEFAULT_MOVEMENT_FILTERS: MovementFilters = {
  search: "",
  type: "All",
  fromDate: "",
  toDate: "",
  page: 1,
  pageSize: 8,
};

export function WarehousePage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [inventoryFilters, setInventoryFilters] = useState<InventoryFilters>(DEFAULT_INVENTORY_FILTERS);
  const [movementFilters, setMovementFilters] = useState<MovementFilters>(DEFAULT_MOVEMENT_FILTERS);
  const [movementForm, setMovementForm] = useState<{
    sku: string;
    warehouse: string;
    type: StockMovementType;
    quantity: string;
    reference: string;
  }>({
    sku: "",
    warehouse: "",
    type: "Inbound",
    quantity: "",
    reference: "",
  });
  const [movementFeedback, setMovementFeedback] = useState<string | null>(null);

  const summaryQuery = useQuery({
    queryKey: ["warehouse", "summary"],
    queryFn: warehouseService.getWarehouseSummary,
    staleTime: 20_000,
  });

  const inventoryQuery = useQuery({
    queryKey: ["warehouse", "inventory", inventoryFilters],
    queryFn: () => warehouseService.getInventory(inventoryFilters),
    staleTime: 20_000,
  });

  const movementQuery = useQuery({
    queryKey: ["warehouse", "movements", movementFilters],
    queryFn: () => warehouseService.getStockMovements(movementFilters),
    staleTime: 20_000,
  });

  const warehousesQuery = useQuery({
    queryKey: ["warehouse", "warehouses"],
    queryFn: warehouseService.getWarehouses,
    staleTime: 60_000,
  });

  const categoriesQuery = useQuery({
    queryKey: ["warehouse", "categories"],
    queryFn: warehouseService.getCategories,
    staleTime: 60_000,
  });

  const inventorySelectorQuery = useQuery({
    queryKey: ["warehouse", "inventory", "selector"],
    queryFn: () =>
      warehouseService.getInventory({
        search: "",
        warehouse: "All",
        status: "All",
        category: "All",
        page: 1,
        pageSize: 200,
      }),
    staleTime: 30_000,
  });

  const recordMovementMutation = useMutation({
    mutationFn: (payload: RecordMovementPayload) => warehouseService.recordMovement(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouse", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["warehouse", "inventory"] });
      queryClient.invalidateQueries({ queryKey: ["warehouse", "movements"] });
    },
  });

  const inventoryOptions = useMemo(
    () => inventorySelectorQuery.data?.rows ?? [],
    [inventorySelectorQuery.data?.rows],
  );

  const effectiveSku = movementForm.sku || inventoryOptions[0]?.sku || "";
  const fallbackWarehouse =
    inventoryOptions.find((row) => row.sku === effectiveSku)?.warehouse ?? "";
  const effectiveWarehouse = movementForm.warehouse || fallbackWarehouse;

  const selectedSkuRecord = useMemo(
    () =>
      inventoryOptions.find(
        (row) => row.sku === effectiveSku && row.warehouse === effectiveWarehouse,
      ) ?? inventoryOptions.find((row) => row.sku === effectiveSku),
    [effectiveSku, effectiveWarehouse, inventoryOptions],
  );

  const inventoryTotalPages = inventoryQuery.data
    ? Math.max(1, Math.ceil(inventoryQuery.data.total / inventoryQuery.data.pageSize))
    : 1;

  const movementTotalPages = movementQuery.data
    ? Math.max(1, Math.ceil(movementQuery.data.total / movementQuery.data.pageSize))
    : 1;

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="page-title">Warehouse</h1>
        <p className="text-sm text-muted-foreground">
          Monitor stock health, warehouse distribution, and movement activity in one place.
        </p>
      </header>

      <section className="rounded-lg border border-border bg-background">
        <ul className="grid gap-0 divide-y divide-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-5 lg:divide-x">
          <li className="px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total SKUs</p>
            <p className="mt-1 text-xl font-semibold leading-none text-foreground">
              {summaryQuery.data?.totalSkus ?? 0}
            </p>
          </li>
          <li className="px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Units</p>
            <p className="mt-1 text-xl font-semibold leading-none text-foreground">
              {summaryQuery.data?.totalUnits ?? 0}
            </p>
          </li>
          <li className="px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Low Stock Items</p>
            <p className="mt-1 text-xl font-semibold leading-none text-foreground">
              {summaryQuery.data?.lowStockItems ?? 0}
            </p>
          </li>
          <li className="px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Inbound Today</p>
            <p className="mt-1 text-xl font-semibold leading-none text-foreground">
              {summaryQuery.data?.inboundToday ?? 0}
            </p>
          </li>
          <li className="px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Outbound Today</p>
            <p className="mt-1 text-xl font-semibold leading-none text-foreground">
              {summaryQuery.data?.outboundToday ?? 0}
            </p>
          </li>
        </ul>
      </section>

      <section className="rounded-lg border border-border bg-background p-3">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Record Stock Movement</h2>
          <p className="text-xs text-muted-foreground">Actor: {user?.name ?? "Ops User"}</p>
        </div>

        <form
          className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,1.2fr)_auto]"
          onSubmit={async (event) => {
            event.preventDefault();
            setMovementFeedback(null);

            const quantity = Number(movementForm.quantity);
            if (!effectiveSku || !effectiveWarehouse || !Number.isFinite(quantity) || quantity <= 0) {
              setMovementFeedback("Enter valid SKU, warehouse, and quantity before submitting.");
              return;
            }

            try {
              const record = await recordMovementMutation.mutateAsync({
                sku: effectiveSku,
                warehouse: effectiveWarehouse,
                type: movementForm.type,
                quantity,
                performedBy: user?.name ?? "Ops User",
                reference: movementForm.reference,
              });

              setMovementFeedback(`Movement ${record.movementId} has been recorded.`);
              setMovementForm((previous) => ({
                ...previous,
                quantity: "",
                reference: "",
              }));
            } catch (error) {
              setMovementFeedback(error instanceof Error ? error.message : "Unable to record movement.");
            }
          }}
        >
          <select
            className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
            onChange={(event) => {
              const sku = event.target.value;
              const row = inventoryOptions.find((item) => item.sku === sku);

              setMovementForm((previous) => ({
                ...previous,
                sku,
                warehouse: row?.warehouse ?? previous.warehouse,
              }));
            }}
            value={effectiveSku}
          >
            {inventoryOptions.map((row) => (
              <option key={`${row.sku}-${row.warehouse}`} value={row.sku}>
                {row.sku} • {row.itemName}
              </option>
            ))}
          </select>

          <select
            className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
            onChange={(event) =>
              setMovementForm((previous) => ({
                ...previous,
                warehouse: event.target.value,
              }))
            }
            value={effectiveWarehouse}
          >
            {(warehousesQuery.data ?? []).map((warehouse) => (
              <option key={warehouse} value={warehouse}>
                {warehouse}
              </option>
            ))}
          </select>

          <select
            className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
            onChange={(event) =>
              setMovementForm((previous) => ({
                ...previous,
                type: event.target.value as StockMovementType,
              }))
            }
            value={movementForm.type}
          >
            <option value="Inbound">Inbound</option>
            <option value="Outbound">Outbound</option>
            <option value="Adjustment">Adjustment</option>
          </select>

          <Input
            min={1}
            onChange={(event) =>
              setMovementForm((previous) => ({
                ...previous,
                quantity: event.target.value,
              }))
            }
            placeholder="Quantity"
            type="number"
            value={movementForm.quantity}
          />

          <Input
            onChange={(event) =>
              setMovementForm((previous) => ({
                ...previous,
                reference: event.target.value,
              }))
            }
            placeholder="Reference (optional)"
            value={movementForm.reference}
          />

          <Button disabled={recordMovementMutation.isPending} type="submit">
            <Plus className="h-4 w-4" />
            Record
          </Button>
        </form>

        <p className="mt-2 text-xs text-muted-foreground">
          Current stock: {selectedSkuRecord ? `${selectedSkuRecord.availableQty} ${selectedSkuRecord.unit}` : "-"}
        </p>

        {movementFeedback ? (
          <p className="mt-1 text-xs text-foreground">{movementFeedback}</p>
        ) : null}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground">Inventory</h2>

        <section className="rounded-lg border border-border bg-background p-3">
          <div className="grid gap-2 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                onChange={(event) =>
                  setInventoryFilters((previous) => ({
                    ...previous,
                    search: event.target.value,
                    page: 1,
                  }))
                }
                placeholder="Search SKU or item"
                value={inventoryFilters.search}
              />
            </div>

            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select
                className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground"
                onChange={(event) =>
                  setInventoryFilters((previous) => ({
                    ...previous,
                    warehouse: event.target.value,
                    page: 1,
                  }))
                }
                value={inventoryFilters.warehouse}
              >
                <option value="All">All Warehouses</option>
                {(warehousesQuery.data ?? []).map((warehouse) => (
                  <option key={warehouse} value={warehouse}>
                    {warehouse}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                onChange={(event) =>
                  setInventoryFilters((previous) => ({
                    ...previous,
                    category: event.target.value,
                    page: 1,
                  }))
                }
                value={inventoryFilters.category}
              >
                <option value="All">All Categories</option>
                {(categoriesQuery.data ?? []).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                onChange={(event) =>
                  setInventoryFilters((previous) => ({
                    ...previous,
                    status: event.target.value as InventoryFilters["status"],
                    page: 1,
                  }))
                }
                value={inventoryFilters.status}
              >
                <option value="All">All Statuses</option>
                <option value="Healthy">Healthy</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </section>

        <InventoryTable
          isError={inventoryQuery.isError}
          isLoading={inventoryQuery.isLoading}
          onPageChange={(nextPage) =>
            setInventoryFilters((previous) => ({
              ...previous,
              page: nextPage,
            }))
          }
          onRetry={() => void inventoryQuery.refetch()}
          page={inventoryFilters.page}
          rows={inventoryQuery.data?.rows ?? []}
          total={inventoryQuery.data?.total ?? 0}
          totalPages={inventoryTotalPages}
        />
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground">Movement Log</h2>

        <section className="rounded-lg border border-border bg-background p-3">
          <div className="grid gap-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                onChange={(event) =>
                  setMovementFilters((previous) => ({
                    ...previous,
                    search: event.target.value,
                    page: 1,
                  }))
                }
                placeholder="Search by SKU, item, reference"
                value={movementFilters.search}
              />
            </div>

            <div>
              <select
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                onChange={(event) =>
                  setMovementFilters((previous) => ({
                    ...previous,
                    type: event.target.value as MovementFilters["type"],
                    page: 1,
                  }))
                }
                value={movementFilters.type}
              >
                <option value="All">All Types</option>
                <option value="Inbound">Inbound</option>
                <option value="Outbound">Outbound</option>
                <option value="Adjustment">Adjustment</option>
              </select>
            </div>

            <Input
              onChange={(event) =>
                setMovementFilters((previous) => ({
                  ...previous,
                  fromDate: event.target.value,
                  page: 1,
                }))
              }
              type="date"
              value={movementFilters.fromDate}
            />

            <Input
              onChange={(event) =>
                setMovementFilters((previous) => ({
                  ...previous,
                  toDate: event.target.value,
                  page: 1,
                }))
              }
              type="date"
              value={movementFilters.toDate}
            />
          </div>
        </section>

        <MovementTable
          isError={movementQuery.isError}
          isLoading={movementQuery.isLoading}
          onPageChange={(nextPage) =>
            setMovementFilters((previous) => ({
              ...previous,
              page: nextPage,
            }))
          }
          onRetry={() => void movementQuery.refetch()}
          page={movementFilters.page}
          rows={movementQuery.data?.rows ?? []}
          total={movementQuery.data?.total ?? 0}
          totalPages={movementTotalPages}
        />
      </section>
    </section>
  );
}
