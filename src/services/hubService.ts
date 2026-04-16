import type { ActiveHub } from "@/types/context";

const MOCK_HUBS: ActiveHub[] = [
  { id: "h1", name: "Mumbai Port Hub" },
  { id: "h2", name: "Dhaka Air Cargo" },
  { id: "h3", name: "Chittagong Sea Port" },
  { id: "h4", name: "Dubai Sea Port" },
  { id: "h5", name: "Karachi Port" },
  { id: "h6", name: "Singapore Sea Port" },
];

let hubsDb: ActiveHub[] = MOCK_HUBS.map((hub) => ({ ...hub }));

function simulateLatency() {
  return new Promise((resolve) => {
    setTimeout(resolve, 400);
  });
}

function nextHubId() {
  const maxId = hubsDb.reduce((max, hub) => {
    const value = Number(hub.id.replace(/^h/, ""));
    return Number.isFinite(value) ? Math.max(max, value) : max;
  }, 0);

  return `h${maxId + 1}`;
}

function assertUniqueHubName(name: string) {
  const exists = hubsDb.some((hub) => hub.name.toLowerCase() === name.toLowerCase());
  if (exists) {
    throw new Error("Hub already exists.");
  }
}

export const hubService = {
  async getHubs(companyId: string): Promise<ActiveHub[]> {
    void companyId;
    await simulateLatency();
    return hubsDb.map((hub) => ({ ...hub }));
  },

  async createHub(name: string): Promise<ActiveHub> {
    await simulateLatency();

    const normalizedName = name.trim();
    if (normalizedName.length < 2) {
      throw new Error("Hub name must be at least 2 characters.");
    }

    assertUniqueHubName(normalizedName);

    const record: ActiveHub = {
      id: nextHubId(),
      name: normalizedName,
    };

    hubsDb = [...hubsDb, record];
    return { ...record };
  },
};
