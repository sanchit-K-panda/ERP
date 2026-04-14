import type { CurrencyCode, TransactionType } from "@/modules/finance/types";
import type { ShipmentStatus } from "@/modules/shipments/types";
import type { JobStatus, ServiceType } from "@/modules/jobs/types";

export type PartyType = "Client" | "Vendor" | "Agent" | "Broker";

export type PartyRecord = {
  id: string;
  name: string;
  type: PartyType;
  email?: string;
  phone?: string;
  country: string;
  address?: string;
  createdDate: string;
};

export type PartyFilters = {
  search: string;
  type: PartyType | "All";
  country: string | "All";
  page: number;
  pageSize: number;
};

export type PartyQueryResult = {
  rows: PartyRecord[];
  total: number;
  page: number;
  pageSize: number;
};

export type CreatePartyPayload = {
  name: string;
  type: PartyType;
  email?: string;
  phone?: string;
  country: string;
  address?: string;
};

export type PartySearchResult = Pick<PartyRecord, "id" | "name" | "type" | "country">;

export type PartyRelatedJob = {
  id: string;
  jobId: string;
  serviceType: ServiceType;
  status: JobStatus;
  route: string;
  createdDate: string;
};

export type PartyRelatedTransaction = {
  id: string;
  transactionId: string;
  type: TransactionType;
  amount: number;
  currency: CurrencyCode;
  date: string;
  jobId?: string;
  category: string;
};

export type PartyRelatedShipment = {
  id: string;
  shipmentId: string;
  trackingNumber: string;
  freightType: "Air" | "Sea";
  status: ShipmentStatus;
  eta: string;
  jobId: string;
  route: string;
};
