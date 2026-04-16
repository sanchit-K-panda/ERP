import type { ActiveCompany } from "@/types/context";

const MOCK_COMPANIES: ActiveCompany[] = [
  { id: "c1", name: "Simon Cargo Service" },
  { id: "c2", name: "Alpha Exim" },
  { id: "c3", name: "Simon Logistics" },
  { id: "c4", name: "XYX Limited" },
];

function simulateLatency() {
  return new Promise((resolve) => {
    setTimeout(resolve, 400);
  });
}

export const companyService = {
  async getCompanies(): Promise<ActiveCompany[]> {
    await simulateLatency();
    return MOCK_COMPANIES;
  },
};
