import type { ActiveCompany } from "@/types/context";

const MOCK_COMPANIES: ActiveCompany[] = [
  { id: "c1", name: "Simon Cargo Service" },
  { id: "c2", name: "Alpha Exim" },
  { id: "c3", name: "Simon Logistics" },
  { id: "c4", name: "XYX Limited" },
];

let companiesDb: ActiveCompany[] = MOCK_COMPANIES.map((company) => ({ ...company }));

function simulateLatency() {
  return new Promise((resolve) => {
    setTimeout(resolve, 400);
  });
}

function nextCompanyId() {
  const maxId = companiesDb.reduce((max, company) => {
    const value = Number(company.id.replace(/^c/, ""));
    return Number.isFinite(value) ? Math.max(max, value) : max;
  }, 0);

  return `c${maxId + 1}`;
}

function assertUniqueCompanyName(name: string) {
  const exists = companiesDb.some((company) => company.name.toLowerCase() === name.toLowerCase());
  if (exists) {
    throw new Error("Company already exists.");
  }
}

export const companyService = {
  async getCompanies(): Promise<ActiveCompany[]> {
    await simulateLatency();
    return companiesDb.map((company) => ({ ...company }));
  },

  async createCompany(name: string): Promise<ActiveCompany> {
    await simulateLatency();

    const normalizedName = name.trim();
    if (normalizedName.length < 2) {
      throw new Error("Company name must be at least 2 characters.");
    }

    assertUniqueCompanyName(normalizedName);

    const record: ActiveCompany = {
      id: nextCompanyId(),
      name: normalizedName,
    };

    companiesDb = [...companiesDb, record];
    return { ...record };
  },
};
