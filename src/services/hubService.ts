import type { ActiveHub } from "@/types/context";

const MOCK_HUBS: ActiveHub[] = [
  { id: "h1", name: "Mumbai Port Hub" },
  { id: "h2", name: "Dhaka Air Cargo" },
  { id: "h3", name: "Chittagong Sea Port" },
  { id: "h4", name: "Dubai Sea Port" },
  { id: "h5", name: "Karachi Port" },
  { id: "h6", name: "Singapore Sea Port" },
];

function simulateLatency() {
  return new Promise((resolve) => {
    setTimeout(resolve, 400);
  });
}

export const hubService = {
  async getHubs(companyId: string): Promise<ActiveHub[]> {
    void companyId;
    await simulateLatency();
    return MOCK_HUBS;
  },
};
