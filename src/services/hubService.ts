import type { ActiveHub } from "@/types/context";

const MOCK_HUBS: ActiveHub[] = [
  { id: "h1", name: "Mumbai Port Hub" },
  { id: "h2", name: "Delhi ICD Hub" },
  { id: "h3", name: "Chennai Port Hub" },
  { id: "h4", name: "Mundra Port Hub" },
  { id: "h5", name: "Bangalore Air Cargo Hub" },
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
