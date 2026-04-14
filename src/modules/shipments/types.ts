export type ShipmentStatus = "Processing" | "In Transit" | "Delivered" | "Delayed";

export type FreightType = "Air" | "Sea";

export type ShipmentLinearStatus = Exclude<ShipmentStatus, "Delayed">;

export type ShipmentRecord = {
  id: string;
  shipmentId: string;
  jobId: string;
  partyId?: string;
  clientName: string;
  originHub: string;
  destinationHub: string;
  freightType: FreightType;
  trackingNumber: string;
  departureDate: string;
  eta: string;
  status: ShipmentStatus;
  lastMilestone: ShipmentLinearStatus;
  createdAt: string;
};

export type ShipmentFilters = {
  search: string;
  status: ShipmentStatus | "All";
  freightType: FreightType | "All";
  fromDate: string;
  toDate: string;
  page: number;
  pageSize: number;
};

export type ShipmentSummary = {
  totalShipments: number;
  inTransit: number;
  delivered: number;
  delayed: number;
};

export type ShipmentsQueryResult = {
  rows: ShipmentRecord[];
  total: number;
  page: number;
  pageSize: number;
};

export type CreateShipmentPayload = {
  jobId: string;
  partyId?: string;
  clientName: string;
  originHub: string;
  destinationHub: string;
  freightType: FreightType;
  trackingNumber: string;
  departureDate: string;
  eta: string;
};

export type ShipmentJobOption = {
  jobId: string;
  partyId?: string;
  clientName: string;
  originHub: string;
  destinationHub: string;
};

export const SHIPMENT_STATUS_FLOW: ShipmentLinearStatus[] = [
  "Processing",
  "In Transit",
  "Delivered",
];
