export type InventoryStatus = "Healthy" | "Low Stock" | "Out of Stock";

export type StockMovementType = "Inbound" | "Outbound" | "Adjustment";

export type InventoryRecord = {
  id: string;
  sku: string;
  itemName: string;
  category: string;
  warehouse: string;
  availableQty: number;
  reservedQty: number;
  reorderLevel: number;
  unit: string;
  unitCost: number;
  currency: "INR";
  lastUpdated: string;
  status: InventoryStatus;
};

export type StockMovementRecord = {
  id: string;
  movementId: string;
  sku: string;
  itemName: string;
  type: StockMovementType;
  quantity: number;
  unit: string;
  warehouse: string;
  reference: string;
  performedBy: string;
  movedAt: string;
};

export type WarehouseSummary = {
  totalSkus: number;
  totalUnits: number;
  lowStockItems: number;
  inboundToday: number;
  outboundToday: number;
};

export type InventoryFilters = {
  search: string;
  warehouse: string | "All";
  status: InventoryStatus | "All";
  category: string | "All";
  page: number;
  pageSize: number;
};

export type MovementFilters = {
  search: string;
  type: StockMovementType | "All";
  fromDate: string;
  toDate: string;
  page: number;
  pageSize: number;
};

export type InventoryQueryResult = {
  rows: InventoryRecord[];
  total: number;
  page: number;
  pageSize: number;
};

export type MovementQueryResult = {
  rows: StockMovementRecord[];
  total: number;
  page: number;
  pageSize: number;
};

export type RecordMovementPayload = {
  sku: string;
  warehouse: string;
  type: StockMovementType;
  quantity: number;
  performedBy: string;
  reference?: string;
};
