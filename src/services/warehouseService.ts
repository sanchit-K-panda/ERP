import type {
  InventoryFilters,
  InventoryQueryResult,
  InventoryRecord,
  InventoryStatus,
  MovementFilters,
  MovementQueryResult,
  RecordMovementPayload,
  StockMovementRecord,
  WarehouseSummary,
} from "@/modules/warehouse/types";

type InventorySeed = Omit<InventoryRecord, "status">;

type MovementSeed = Omit<StockMovementRecord, "id" | "movementId">;

function daysAgo(days: number) {
  const value = new Date();
  value.setDate(value.getDate() - days);
  return value.toISOString();
}

const INITIAL_INVENTORY: InventorySeed[] = [
  {
    id: "inv-item-1",
    sku: "SKU-EL-2301",
    itemName: "USB-C Charging Adapter",
    category: "Electronics",
    warehouse: "Mumbai Central Warehouse",
    availableQty: 860,
    reservedQty: 120,
    reorderLevel: 240,
    unit: "pcs",
    unitCost: 890,
    currency: "BDT",
    lastUpdated: daysAgo(1),
  },
  {
    id: "inv-item-2",
    sku: "SKU-TX-4402",
    itemName: "Cotton Fabric Roll",
    category: "Textiles",
    warehouse: "Chittagong Sea Port Storage",
    availableQty: 94,
    reservedQty: 32,
    reorderLevel: 120,
    unit: "roll",
    unitCost: 3100,
    currency: "BDT",
    lastUpdated: daysAgo(1),
  },
  {
    id: "inv-item-3",
    sku: "SKU-MC-8801",
    itemName: "Motor Assembly Kit",
    category: "Machinery",
    warehouse: "Dhaka Air Cargo Storage",
    availableQty: 14,
    reservedQty: 8,
    reorderLevel: 20,
    unit: "kit",
    unitCost: 14500,
    currency: "BDT",
    lastUpdated: daysAgo(2),
  },
  {
    id: "inv-item-4",
    sku: "SKU-FD-1209",
    itemName: "Food Grade Plastic Barrel",
    category: "Packaging",
    warehouse: "Dubai Sea Port Transit Yard",
    availableQty: 420,
    reservedQty: 56,
    reorderLevel: 140,
    unit: "pcs",
    unitCost: 660,
    currency: "BDT",
    lastUpdated: daysAgo(3),
  },
  {
    id: "inv-item-5",
    sku: "SKU-EL-3122",
    itemName: "Lithium Battery Pack",
    category: "Electronics",
    warehouse: "Karachi Port Cargo Depot",
    availableQty: 0,
    reservedQty: 0,
    reorderLevel: 60,
    unit: "pcs",
    unitCost: 3650,
    currency: "BDT",
    lastUpdated: daysAgo(4),
  },
  {
    id: "inv-item-6",
    sku: "SKU-CM-7012",
    itemName: "Metal Fastener Bundle",
    category: "Components",
    warehouse: "Chittagong Sea Port Storage",
    availableQty: 188,
    reservedQty: 20,
    reorderLevel: 70,
    unit: "box",
    unitCost: 1820,
    currency: "BDT",
    lastUpdated: daysAgo(2),
  },
];

const INITIAL_MOVEMENTS: MovementSeed[] = [
  {
    sku: "SKU-EL-2301",
    itemName: "USB-C Charging Adapter",
    type: "Outbound",
    quantity: 80,
    unit: "pcs",
    warehouse: "Mumbai Central Warehouse",
    reference: "SO-2026-188",
    performedBy: "Rafi Ahmed",
    movedAt: daysAgo(0),
  },
  {
    sku: "SKU-TX-4402",
    itemName: "Cotton Fabric Roll",
    type: "Inbound",
    quantity: 60,
    unit: "roll",
    warehouse: "Chittagong Sea Port Storage",
    reference: "PO-2026-078",
    performedBy: "Mithila Rahman",
    movedAt: daysAgo(0),
  },
  {
    sku: "SKU-MC-8801",
    itemName: "Motor Assembly Kit",
    type: "Outbound",
    quantity: 6,
    unit: "kit",
    warehouse: "Dhaka Air Cargo Storage",
    reference: "SO-2026-175",
    performedBy: "Ayon Das",
    movedAt: daysAgo(1),
  },
  {
    sku: "SKU-FD-1209",
    itemName: "Food Grade Plastic Barrel",
    type: "Inbound",
    quantity: 140,
    unit: "pcs",
    warehouse: "Dubai Sea Port Transit Yard",
    reference: "PO-2026-063",
    performedBy: "Nabila Karim",
    movedAt: daysAgo(2),
  },
  {
    sku: "SKU-CM-7012",
    itemName: "Metal Fastener Bundle",
    type: "Adjustment",
    quantity: 12,
    unit: "box",
    warehouse: "Chittagong Sea Port Storage",
    reference: "Cycle Count",
    performedBy: "Sadia Noor",
    movedAt: daysAgo(3),
  },
];

function computeStatus(row: InventorySeed | InventoryRecord): InventoryStatus {
  if (row.availableQty <= 0) {
    return "Out of Stock";
  }

  if (row.availableQty <= row.reorderLevel) {
    return "Low Stock";
  }

  return "Healthy";
}

function withStatus(row: InventorySeed | InventoryRecord): InventoryRecord {
  return {
    ...row,
    status: computeStatus(row),
  };
}

const inventoryDb: InventoryRecord[] = INITIAL_INVENTORY.map(withStatus);
let movementsDb: StockMovementRecord[] = INITIAL_MOVEMENTS.map((row, index) => ({
  id: `movement-${index + 1}`,
  movementId: `MOV-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${String(index + 1).padStart(3, "0")}`,
  ...row,
}));

async function simulateDelay(ms = 300) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeDate(value: string) {
  return new Date(value).getTime();
}

function cloneInventory(row: InventoryRecord) {
  return structuredClone(row);
}

function cloneMovement(row: StockMovementRecord) {
  return structuredClone(row);
}

function applyInventoryFilters(rows: InventoryRecord[], filters: InventoryFilters) {
  const query = filters.search.trim().toLowerCase();

  return rows.filter((row) => {
    const matchesSearch =
      query.length === 0 ||
      row.sku.toLowerCase().includes(query) ||
      row.itemName.toLowerCase().includes(query);

    const matchesWarehouse = filters.warehouse === "All" || row.warehouse === filters.warehouse;
    const matchesStatus = filters.status === "All" || row.status === filters.status;
    const matchesCategory = filters.category === "All" || row.category === filters.category;

    return matchesSearch && matchesWarehouse && matchesStatus && matchesCategory;
  });
}

function applyMovementFilters(rows: StockMovementRecord[], filters: MovementFilters) {
  const query = filters.search.trim().toLowerCase();

  return rows.filter((row) => {
    const matchesSearch =
      query.length === 0 ||
      row.sku.toLowerCase().includes(query) ||
      row.itemName.toLowerCase().includes(query) ||
      row.reference.toLowerCase().includes(query);

    const matchesType = filters.type === "All" || row.type === filters.type;

    const movedAt = normalizeDate(row.movedAt);
    const matchesFromDate =
      filters.fromDate.length === 0 || movedAt >= normalizeDate(filters.fromDate);
    const matchesToDate = filters.toDate.length === 0 || movedAt <= normalizeDate(filters.toDate);

    return matchesSearch && matchesType && matchesFromDate && matchesToDate;
  });
}

function summarize(): WarehouseSummary {
  const today = new Date().toISOString().slice(0, 10);

  return {
    totalSkus: inventoryDb.length,
    totalUnits: inventoryDb.reduce((sum, row) => sum + row.availableQty, 0),
    lowStockItems: inventoryDb.filter(
      (row) => row.status === "Low Stock" || row.status === "Out of Stock",
    ).length,
    inboundToday: movementsDb
      .filter((row) => row.type === "Inbound" && row.movedAt.startsWith(today))
      .reduce((sum, row) => sum + row.quantity, 0),
    outboundToday: movementsDb
      .filter((row) => row.type === "Outbound" && row.movedAt.startsWith(today))
      .reduce((sum, row) => sum + row.quantity, 0),
  };
}

function assertInventoryRecord(sku: string, warehouse: string) {
  const index = inventoryDb.findIndex((row) => row.sku === sku && row.warehouse === warehouse);

  if (index === -1) {
    throw new Error("Inventory record not found.");
  }

  return index;
}

function nextMovementIdentifiers() {
  const sequence = movementsDb.length + 1;
  const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");

  return {
    id: `movement-${sequence}`,
    movementId: `MOV-${datePart}-${String(sequence).padStart(3, "0")}`,
  };
}

export const warehouseService = {
  async getWarehouseSummary(): Promise<WarehouseSummary> {
    await simulateDelay(260);
    return summarize();
  },

  async getInventory(filters: InventoryFilters): Promise<InventoryQueryResult> {
    await simulateDelay(340);

    const filtered = applyInventoryFilters(inventoryDb, filters).sort((a, b) => {
      if (a.status !== b.status) {
        return a.status.localeCompare(b.status);
      }

      return a.itemName.localeCompare(b.itemName);
    });

    const start = (filters.page - 1) * filters.pageSize;
    const end = start + filters.pageSize;

    return {
      rows: filtered.slice(start, end).map(cloneInventory),
      total: filtered.length,
      page: filters.page,
      pageSize: filters.pageSize,
    };
  },

  async getStockMovements(filters: MovementFilters): Promise<MovementQueryResult> {
    await simulateDelay(320);

    const filtered = applyMovementFilters(movementsDb, filters)
      .slice()
      .sort((a, b) => normalizeDate(b.movedAt) - normalizeDate(a.movedAt));

    const start = (filters.page - 1) * filters.pageSize;
    const end = start + filters.pageSize;

    return {
      rows: filtered.slice(start, end).map(cloneMovement),
      total: filtered.length,
      page: filters.page,
      pageSize: filters.pageSize,
    };
  },

  async recordMovement(payload: RecordMovementPayload): Promise<StockMovementRecord> {
    await simulateDelay(280);

    if (payload.quantity <= 0) {
      throw new Error("Quantity must be greater than zero.");
    }

    const inventoryIndex = assertInventoryRecord(payload.sku, payload.warehouse);
    const current = inventoryDb[inventoryIndex];

    let nextAvailableQty = current.availableQty;

    if (payload.type === "Inbound") {
      nextAvailableQty += payload.quantity;
    } else if (payload.type === "Outbound") {
      if (current.availableQty < payload.quantity) {
        throw new Error("Insufficient stock for outbound movement.");
      }
      nextAvailableQty -= payload.quantity;
    } else {
      nextAvailableQty = Math.max(0, current.availableQty + payload.quantity);
    }

    inventoryDb[inventoryIndex] = withStatus({
      ...current,
      availableQty: nextAvailableQty,
      lastUpdated: new Date().toISOString(),
    });

    const ids = nextMovementIdentifiers();

    const movement: StockMovementRecord = {
      ...ids,
      sku: current.sku,
      itemName: current.itemName,
      type: payload.type,
      quantity: payload.quantity,
      unit: current.unit,
      warehouse: payload.warehouse,
      reference: payload.reference ?? `${payload.type} update`,
      performedBy: payload.performedBy,
      movedAt: new Date().toISOString(),
    };

    movementsDb = [movement, ...movementsDb];

    return cloneMovement(movement);
  },

  async getWarehouses(): Promise<string[]> {
    await simulateDelay(120);

    const set = new Set(inventoryDb.map((row) => row.warehouse));
    return [...set.values()].sort((a, b) => a.localeCompare(b));
  },

  async getCategories(): Promise<string[]> {
    await simulateDelay(120);

    const set = new Set(inventoryDb.map((row) => row.category));
    return [...set.values()].sort((a, b) => a.localeCompare(b));
  },
};
