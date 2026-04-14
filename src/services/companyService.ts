import type { ActiveCompany } from "@/types/context";

const MOCK_COMPANIES: ActiveCompany[] = [
  { id: "c1", name: "Mahadev Logistics Pvt Ltd" },
  { id: "c2", name: "Shree Ganesh Freight Lines" },
  { id: "c3", name: "Bharat Coastal Movers" },
  { id: "c4", name: "IndiTrans Supply Chain" },
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
