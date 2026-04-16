import { financeService } from "@/services/financeService";
import { jobService } from "@/services/jobService";
import { shipmentService } from "@/services/shipmentService";
import type {
  CreatePartyPayload,
  PartyFilters,
  PartyQueryResult,
  PartyRecord,
  PartyRelatedJob,
  PartyRelatedShipment,
  PartyRelatedTransaction,
  PartySearchResult,
} from "@/modules/parties/types";

const INITIAL_PARTIES: PartyRecord[] = [
  {
    id: "party-reliance",
    name: "Bangladesh Shipping Corporation (BSC)",
    type: "Client",
    email: "logistics@ril.com",
    phone: "+91-9876543210",
    country: "India",
    address: "Maker Chambers IV, Nariman Point, Mumbai",
    createdDate: "2026-01-12",
  },
  {
    id: "party-tata",
    name: "Bangladesh Shipping Agencies (Pvt) Ltd",
    type: "Client",
    email: "supply@tatasteel.com",
    phone: "+91-9123456789",
    country: "India",
    address: "Bombay House Annexe, Fort, Mumbai",
    createdDate: "2026-01-18",
  },
  {
    id: "party-adani",
    name: "Sea King Marine Services Limited",
    type: "Vendor",
    email: "operations@adaniports.com",
    phone: "+91-9988776655",
    country: "India",
    address: "Adani House, Shantigram, Ahmedabad",
    createdDate: "2026-02-03",
  },
  {
    id: "party-mahindra",
    name: "Eastern Overseas Shipping Lines Ltd",
    type: "Agent",
    email: "controltower@mahindralogistics.com",
    phone: "+91-9090909090",
    country: "India",
    address: "Mahindra Towers, Worli, Mumbai",
    createdDate: "2026-02-20",
  },
  {
    id: "party-lnt",
    name: "Akij Shipping Line Ltd",
    type: "Vendor",
    email: "infra.logistics@larsentoubro.com",
    phone: "+91-9012345678",
    country: "India",
    address: "L&T House, Ballard Estate, Mumbai",
    createdDate: "2026-03-02",
  },
];

let partiesDb: PartyRecord[] = INITIAL_PARTIES.map((party) => structuredClone(party));

async function simulateDelay() {
  await new Promise((resolve) => setTimeout(resolve, 260));
}

async function simulateFastDelay() {
  await new Promise((resolve) => setTimeout(resolve, 120));
}

function normalizeDate(value: string) {
  return new Date(value).getTime();
}

function cloneParty(party: PartyRecord) {
  return structuredClone(party);
}

function assertExists(partyId: string) {
  const party = partiesDb.find((item) => item.id === partyId);
  if (!party) {
    throw new Error("Party not found.");
  }

  return party;
}

function normalizeNameToId(name: string) {
  return (
    "party-" +
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
  );
}

function applyPartyFilters(rows: PartyRecord[], filters: PartyFilters) {
  const query = filters.search.trim().toLowerCase();

  return rows.filter((row) => {
    const matchesSearch =
      query.length === 0 ||
      row.name.toLowerCase().includes(query) ||
      (row.email?.toLowerCase().includes(query) ?? false) ||
      (row.phone?.toLowerCase().includes(query) ?? false);

    const matchesType = filters.type === "All" || row.type === filters.type;
    const matchesCountry = filters.country === "All" || row.country === filters.country;

    return matchesSearch && matchesType && matchesCountry;
  });
}

export const partyService = {
  async getParties(filters: PartyFilters): Promise<PartyQueryResult> {
    await simulateDelay();

    const filtered = applyPartyFilters(partiesDb, filters).sort(
      (a, b) => normalizeDate(b.createdDate) - normalizeDate(a.createdDate),
    );

    const start = (filters.page - 1) * filters.pageSize;
    const end = start + filters.pageSize;

    return {
      rows: filtered.slice(start, end).map(cloneParty),
      total: filtered.length,
      page: filters.page,
      pageSize: filters.pageSize,
    };
  },

  async getPartyById(partyId: string): Promise<PartyRecord> {
    await simulateDelay();

    return cloneParty(assertExists(partyId));
  },

  async createParty(payload: CreatePartyPayload): Promise<PartyRecord> {
    await simulateDelay();

    const candidateId = normalizeNameToId(payload.name);
    const duplicate = partiesDb.some((party) => party.id === candidateId);
    const id = duplicate ? `${candidateId}-${partiesDb.length + 1}` : candidateId;

    const record: PartyRecord = {
      id,
      name: payload.name.trim(),
      type: payload.type,
      email: payload.email?.trim() || undefined,
      phone: payload.phone?.trim() || undefined,
      country: payload.country,
      address: payload.address?.trim() || undefined,
      createdDate: new Date().toISOString().slice(0, 10),
    };

    partiesDb = [record, ...partiesDb];

    return cloneParty(record);
  },

  async updateParty(partyId: string, payload: CreatePartyPayload): Promise<PartyRecord> {
    await simulateDelay();

    const existing = assertExists(partyId);

    const updated: PartyRecord = {
      ...existing,
      name: payload.name.trim(),
      type: payload.type,
      email: payload.email?.trim() || undefined,
      phone: payload.phone?.trim() || undefined,
      country: payload.country,
      address: payload.address?.trim() || undefined,
    };

    partiesDb = partiesDb.map((party) => (party.id === partyId ? updated : party));

    return cloneParty(updated);
  },

  async searchParties(query: string): Promise<PartySearchResult[]> {
    await simulateFastDelay();

    const normalized = query.trim().toLowerCase();

    const matches = partiesDb
      .filter((party) => {
        if (!normalized) {
          return true;
        }

        return (
          party.name.toLowerCase().includes(normalized) ||
          (party.email?.toLowerCase().includes(normalized) ?? false) ||
          (party.phone?.toLowerCase().includes(normalized) ?? false)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 8)
      .map((party) => ({
        id: party.id,
        name: party.name,
        type: party.type,
        country: party.country,
      }));

    return structuredClone(matches);
  },

  async getPartyJobs(partyId: string): Promise<PartyRelatedJob[]> {
    const party = assertExists(partyId);
    const jobs = await jobService.getJobsByParty(party.id, party.name);

    return jobs.map((job) => ({
      id: job.id,
      jobId: job.jobId,
      serviceType: job.serviceType,
      status: job.status,
      route: `${job.originHub} -> ${job.destinationHub}`,
      createdDate: job.createdDate,
    }));
  },

  async getPartyTransactions(partyId: string): Promise<PartyRelatedTransaction[]> {
    const party = assertExists(partyId);
    const transactions = await financeService.getPartyTransactions(party.id, party.name);

    return transactions.map((row) => ({
      id: row.id,
      transactionId: row.transactionId,
      type: row.type,
      amount: row.amount,
      currency: row.currency,
      date: row.date,
      jobId: row.jobId,
      category: row.category,
    }));
  },

  async getPartyShipments(partyId: string): Promise<PartyRelatedShipment[]> {
    const party = assertExists(partyId);
    const shipments = await shipmentService.getShipmentsByParty(party.id, party.name);

    return shipments.map((row) => ({
      id: row.id,
      shipmentId: row.shipmentId,
      trackingNumber: row.trackingNumber,
      freightType: row.freightType,
      status: row.status,
      eta: row.eta,
      jobId: row.jobId,
      route: `${row.originHub} -> ${row.destinationHub}`,
    }));
  },
};
