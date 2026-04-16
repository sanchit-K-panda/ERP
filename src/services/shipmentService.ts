import type {
  CreateShipmentPayload,
  ShipmentFilters,
  ShipmentLinearStatus,
  ShipmentRecord,
  ShipmentStatus,
  ShipmentSummary,
  ShipmentsQueryResult,
} from "@/modules/shipments/types";

const INITIAL_SHIPMENTS: ShipmentRecord[] = [
  {
    id: "shipment-1",
    shipmentId: "SHP-20260414-01",
    jobId: "J-20260414-01",
    partyId: "party-reliance",
    clientName: "Bangladesh Shipping Corporation (BSC)",
    originHub: "Mumbai Port Hub",
    destinationHub: "Dubai Sea Port",
    freightType: "Air",
    trackingNumber: "INMAA-AIR-7762",
    departureDate: "2026-04-14",
    eta: "2026-04-18",
    status: "In Transit",
    lastMilestone: "In Transit",
    createdAt: "2026-04-14T08:10:00.000Z",
  },
  {
    id: "shipment-2",
    shipmentId: "SHP-20260413-04",
    jobId: "J-20260413-04",
    partyId: "party-tata",
    clientName: "Bangladesh Shipping Agencies (Pvt) Ltd",
    originHub: "Chittagong Sea Port",
    destinationHub: "Singapore Sea Port",
    freightType: "Sea",
    trackingNumber: "INMAA-SEA-2491",
    departureDate: "2026-04-13",
    eta: "2026-04-21",
    status: "Processing",
    lastMilestone: "Processing",
    createdAt: "2026-04-13T07:30:00.000Z",
  },
  {
    id: "shipment-3",
    shipmentId: "SHP-20260412-03",
    jobId: "J-20260411-03",
    partyId: "party-adani",
    clientName: "Sea King Marine Services Limited",
    originHub: "Karachi Port",
    destinationHub: "Singapore Sea Port",
    freightType: "Sea",
    trackingNumber: "INMUN-SEA-5520",
    departureDate: "2026-04-11",
    eta: "2026-04-12",
    status: "Delivered",
    lastMilestone: "Delivered",
    createdAt: "2026-04-11T06:15:00.000Z",
  },
  {
    id: "shipment-4",
    shipmentId: "SHP-20260410-07",
    jobId: "J-20260405-02",
    partyId: "party-lnt",
    clientName: "Akij Shipping Line Ltd",
    originHub: "Dhaka Air Cargo",
    destinationHub: "Chittagong Sea Port",
    freightType: "Air",
    trackingNumber: "INBLR-AIR-1934",
    departureDate: "2026-04-10",
    eta: "2026-04-15",
    status: "Delayed",
    lastMilestone: "In Transit",
    createdAt: "2026-04-10T04:40:00.000Z",
  },
  {
    id: "shipment-5",
    shipmentId: "SHP-20260409-02",
    jobId: "J-20260408-06",
    partyId: "party-mahindra",
    clientName: "Eastern Overseas Shipping Lines Ltd",
    originHub: "Dhaka Air Cargo",
    destinationHub: "Mumbai Port Hub",
    freightType: "Air",
    trackingNumber: "INDEL-AIR-8403",
    departureDate: "2026-04-09",
    eta: "2026-04-13",
    status: "Delivered",
    lastMilestone: "Delivered",
    createdAt: "2026-04-09T09:00:00.000Z",
  },
  {
    id: "shipment-6",
    shipmentId: "SHP-20260408-05",
    jobId: "J-20260413-04",
    partyId: "party-tata",
    clientName: "Bangladesh Shipping Agencies (Pvt) Ltd",
    originHub: "Chittagong Sea Port",
    destinationHub: "Singapore Sea Port",
    freightType: "Air",
    trackingNumber: "INCHE-AIR-6627",
    departureDate: "2026-04-08",
    eta: "2026-04-14",
    status: "Delayed",
    lastMilestone: "Processing",
    createdAt: "2026-04-08T05:50:00.000Z",
  },
];

let shipmentsDb: ShipmentRecord[] = INITIAL_SHIPMENTS.map((item) => structuredClone(item));

async function simulateDelay() {
  await new Promise((resolve) => setTimeout(resolve, 350));
}

function cloneShipment(shipment: ShipmentRecord) {
  return structuredClone(shipment);
}

function normalizeDate(value: string) {
  return new Date(value).getTime();
}

function applyFilters(shipments: ShipmentRecord[], filters: ShipmentFilters) {
  const search = filters.search.trim().toLowerCase();

  return shipments.filter((shipment) => {
    const matchesSearch =
      search.length === 0 ||
      shipment.shipmentId.toLowerCase().includes(search) ||
      shipment.trackingNumber.toLowerCase().includes(search) ||
      shipment.jobId.toLowerCase().includes(search);

    const matchesStatus = filters.status === "All" || shipment.status === filters.status;
    const matchesFreight =
      filters.freightType === "All" || shipment.freightType === filters.freightType;

    const departureDate = normalizeDate(shipment.departureDate);
    const matchesFromDate =
      filters.fromDate.length === 0 || departureDate >= normalizeDate(filters.fromDate);
    const matchesToDate =
      filters.toDate.length === 0 || departureDate <= normalizeDate(filters.toDate);

    return matchesSearch && matchesStatus && matchesFreight && matchesFromDate && matchesToDate;
  });
}

function nextShipmentIdentifiers() {
  const sequence = shipmentsDb.length + 1;
  const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");

  return {
    id: `shipment-${sequence}`,
    shipmentId: `SHP-${datePart}-${String(sequence).padStart(2, "0")}`,
  };
}

function getIndexByShipmentId(shipmentId: string) {
  return shipmentsDb.findIndex((item) => item.shipmentId === shipmentId);
}

function assertExists(shipmentId: string) {
  const index = getIndexByShipmentId(shipmentId);
  if (index === -1) {
    throw new Error("Shipment not found.");
  }

  return index;
}

function allowedTransitions(status: ShipmentStatus, milestone: ShipmentLinearStatus): ShipmentStatus[] {
  if (status === "Processing") {
    return ["In Transit", "Delayed"];
  }

  if (status === "In Transit") {
    return ["Delivered", "Delayed"];
  }

  if (status === "Delivered") {
    return ["Delayed"];
  }

  if (milestone === "Processing") {
    return ["In Transit"];
  }

  if (milestone === "In Transit") {
    return ["Delivered"];
  }

  return [];
}

function assertTransition(current: ShipmentRecord, nextStatus: ShipmentStatus) {
  if (current.status === nextStatus) {
    return;
  }

  const transitions = allowedTransitions(current.status, current.lastMilestone);
  if (!transitions.includes(nextStatus)) {
    throw new Error(`Invalid status transition from ${current.status} to ${nextStatus}.`);
  }
}

function summarize(shipments: ShipmentRecord[]): ShipmentSummary {
  return {
    totalShipments: shipments.length,
    inTransit: shipments.filter((item) => item.status === "In Transit").length,
    delivered: shipments.filter((item) => item.status === "Delivered").length,
    delayed: shipments.filter((item) => item.status === "Delayed").length,
  };
}

export const shipmentService = {
  async getShipments(filters: ShipmentFilters): Promise<ShipmentsQueryResult> {
    await simulateDelay();

    const filtered = applyFilters(shipmentsDb, filters);
    const start = (filters.page - 1) * filters.pageSize;
    const end = start + filters.pageSize;

    return {
      rows: filtered.slice(start, end).map(cloneShipment),
      total: filtered.length,
      page: filters.page,
      pageSize: filters.pageSize,
    };
  },

  async getShipmentSummary(): Promise<ShipmentSummary> {
    await simulateDelay();
    return summarize(shipmentsDb);
  },

  async createShipment(payload: CreateShipmentPayload): Promise<ShipmentRecord> {
    await simulateDelay();

    const ids = nextShipmentIdentifiers();

    const record: ShipmentRecord = {
      ...ids,
      jobId: payload.jobId,
      partyId: payload.partyId,
      clientName: payload.clientName,
      originHub: payload.originHub,
      destinationHub: payload.destinationHub,
      freightType: payload.freightType,
      trackingNumber: payload.trackingNumber,
      departureDate: payload.departureDate,
      eta: payload.eta,
      status: "Processing",
      lastMilestone: "Processing",
      createdAt: new Date().toISOString(),
    };

    shipmentsDb = [record, ...shipmentsDb];
    return cloneShipment(record);
  },

  async updateShipmentStatus(shipmentId: string, nextStatus: ShipmentStatus): Promise<ShipmentRecord> {
    await simulateDelay();

    const index = assertExists(shipmentId);
    const current = shipmentsDb[index];

    assertTransition(current, nextStatus);

    const updated: ShipmentRecord = {
      ...current,
      status: nextStatus,
      lastMilestone:
        nextStatus === "Delayed" ? current.lastMilestone : (nextStatus as ShipmentLinearStatus),
    };

    shipmentsDb[index] = updated;
    return cloneShipment(updated);
  },

  async getShipmentsByJob(jobId: string): Promise<ShipmentRecord[]> {
    await simulateDelay();

    return shipmentsDb.filter((item) => item.jobId === jobId).map(cloneShipment);
  },

  async getShipmentsByParty(partyId: string, fallbackName?: string): Promise<ShipmentRecord[]> {
    await simulateDelay();

    return shipmentsDb
      .filter((item) => {
        if (item.partyId && item.partyId === partyId) {
          return true;
        }

        if (fallbackName) {
          return item.clientName.toLowerCase() === fallbackName.toLowerCase();
        }

        return false;
      })
      .map(cloneShipment);
  },

  getAllowedStatusTransitions(shipment: Pick<ShipmentRecord, "status" | "lastMilestone">) {
    return allowedTransitions(shipment.status, shipment.lastMilestone);
  },
};
