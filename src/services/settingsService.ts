import type {
  CompanySettings,
  CreateUserPayload,
  HubFilters,
  HubOperationSettings,
  HubQueryResult,
  HubRecord,
  HubTradeConnections,
  NotificationSettings,
  SettingsUserRecord,
  UpsertHubPayload,
  UpdateUserPayload,
  UserFilters,
  UserQueryResult,
} from "@/modules/settings/types";

const DEFAULT_USER_FILTERS: UserFilters = {
  search: "",
  role: "All",
  status: "All",
  page: 1,
  pageSize: 10,
};

const DEFAULT_HUB_FILTERS: HubFilters = {
  search: "",
  type: "All",
  page: 1,
  pageSize: 10,
};

const INITIAL_USERS: SettingsUserRecord[] = [
  {
    id: "usr-1",
    fullName: "Sanchit Dutta",
    email: "owner@simontrade.com",
    role: "BUSINESS_OWNER",
    company: "Bangladesh Shipping Corporation (BSC)",
    status: "Active",
    createdAt: "2026-01-05T08:00:00.000Z",
  },
  {
    id: "usr-2",
    fullName: "Nabila Karim",
    email: "manager@simontrade.com",
    role: "BUSINESS_MANAGER",
    company: "Bangladesh Shipping Agencies (Pvt) Ltd",
    status: "Active",
    createdAt: "2026-01-12T10:10:00.000Z",
  },
  {
    id: "usr-3",
    fullName: "Rafi Ahmed",
    email: "sales@simontrade.com",
    role: "SALES_PERSON",
    company: "Sea King Marine Services Limited",
    status: "Active",
    createdAt: "2026-01-15T09:00:00.000Z",
  },
  {
    id: "usr-4",
    fullName: "Mithila Rahman",
    email: "sales.manager@simontrade.com",
    role: "SALES_MANAGER",
    company: "Kings Shipping Corporation (KSC)",
    status: "Active",
    createdAt: "2026-02-01T06:20:00.000Z",
  },
  {
    id: "usr-5",
    fullName: "Ayon Das",
    email: "projects@simontrade.com",
    role: "PROJECT_MANAGER",
    company: "Eastern Overseas Shipping Lines Ltd",
    status: "Disabled",
    createdAt: "2026-02-18T12:30:00.000Z",
  },
  {
    id: "usr-6",
    fullName: "Sadia Noor",
    email: "stock@simontrade.com",
    role: "STOCK_MANAGER",
    company: "V-OCEAN",
    status: "Active",
    createdAt: "2026-03-05T10:30:00.000Z",
  },
];

function createDefaultOperationSettings(
  overrides?: Partial<HubOperationSettings>,
): HubOperationSettings {
  return {
    enableImport: true,
    enableExport: false,
    enableTransit: false,
    financialControlHub: true,
    inventoryControlHub: true,
    activeStatus: true,
    ...overrides,
  };
}

function createDefaultTradeConnections(
  overrides?: Partial<HubTradeConnections>,
): HubTradeConnections {
  return {
    importCountries: [],
    importAdditional: [],
    importHubs: [],
    exportCountries: [],
    exportAdditional: [],
    exportHubs: [],
    ...overrides,
  };
}

const INITIAL_HUBS: HubRecord[] = [
  {
    id: "h1",
    name: "Mumbai Port Hub",
    hubCode: "MUM-HQ",
    country: "India",
    city: "Mumbai",
    type: "HQ",
    enabled: true,
    operationSettings: createDefaultOperationSettings({
      enableExport: true,
      enableTransit: true,
    }),
    tradeConnections: createDefaultTradeConnections({
      importCountries: ["India", "Bangladesh"],
      importHubs: ["Dhaka Air Cargo", "Chittagong Sea Port"],
      exportCountries: ["UAE", "Singapore"],
      exportHubs: ["Dubai Sea Port", "Singapore Sea Port"],
    }),
    updatedAt: "2026-03-21T08:00:00.000Z",
  },
  {
    id: "h2",
    name: "Dhaka Air Cargo",
    hubCode: "DAC-IMP",
    country: "Bangladesh",
    city: "Dhaka",
    type: "Import Hub",
    enabled: true,
    operationSettings: createDefaultOperationSettings({
      enableExport: false,
      enableTransit: false,
    }),
    tradeConnections: createDefaultTradeConnections({
      importCountries: ["Bangladesh", "China"],
      importHubs: ["Mumbai Port Hub"],
      exportCountries: ["India"],
      exportHubs: ["Mumbai Port Hub"],
    }),
    updatedAt: "2026-03-21T08:00:00.000Z",
  },
  {
    id: "h3",
    name: "Chittagong Sea Port",
    hubCode: "CGP-EXP",
    country: "Bangladesh",
    city: "Chittagong",
    type: "Export Hub",
    enabled: true,
    operationSettings: createDefaultOperationSettings({
      enableExport: true,
      enableTransit: true,
    }),
    tradeConnections: createDefaultTradeConnections({
      importCountries: ["Bangladesh", "India"],
      importHubs: ["Dhaka Air Cargo", "Mumbai Port Hub"],
      exportCountries: ["Singapore", "UAE"],
      exportHubs: ["Singapore Sea Port", "Dubai Sea Port"],
    }),
    updatedAt: "2026-03-24T07:30:00.000Z",
  },
  {
    id: "h4",
    name: "Dubai Sea Port",
    hubCode: "DXB-TRN",
    country: "UAE",
    city: "Dubai",
    type: "Transit Hub",
    enabled: true,
    operationSettings: createDefaultOperationSettings({
      enableExport: true,
      enableTransit: true,
    }),
    tradeConnections: createDefaultTradeConnections({
      importCountries: ["India", "Bangladesh"],
      importHubs: ["Mumbai Port Hub", "Chittagong Sea Port"],
      exportCountries: ["Singapore"],
      exportHubs: ["Singapore Sea Port"],
    }),
    updatedAt: "2026-03-25T04:20:00.000Z",
  },
  {
    id: "h5",
    name: "Karachi Port",
    hubCode: "KHI-TRN",
    country: "Pakistan",
    city: "Karachi",
    type: "Transit Hub",
    enabled: true,
    operationSettings: createDefaultOperationSettings({
      enableExport: true,
      enableTransit: true,
    }),
    tradeConnections: createDefaultTradeConnections({
      importCountries: ["Pakistan", "India"],
      importHubs: ["Mumbai Port Hub"],
      exportCountries: ["Singapore"],
      exportHubs: ["Singapore Sea Port"],
    }),
    updatedAt: "2026-03-28T11:40:00.000Z",
  },
  {
    id: "h6",
    name: "Singapore Sea Port",
    hubCode: "SGP-EXP",
    country: "Singapore",
    city: "Singapore",
    type: "Export Hub",
    enabled: true,
    operationSettings: createDefaultOperationSettings({
      enableExport: true,
      enableTransit: true,
    }),
    tradeConnections: createDefaultTradeConnections({
      importCountries: ["UAE", "Pakistan", "Bangladesh"],
      importHubs: ["Dubai Sea Port", "Karachi Port", "Chittagong Sea Port"],
      exportCountries: ["USA"],
      exportHubs: ["Mumbai Port Hub"],
    }),
    updatedAt: "2026-03-29T09:10:00.000Z",
  },
];

const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  id: "c1",
  companyName: "Bangladesh Shipping Corporation (BSC)",
  code: "BSC-001",
  codeMode: "Auto",
  businessTypes: ["Logistics"],
  logoName: "simon-trade-logo.png",
  status: "Active",
  operationStartDate: "2026-04-16",
  mainOperationHub: "Bangladesh",
  locationTags: ["Location Tag"],
  importConfig: {
    enabled: true,
    countries: ["Bangladesh", "India"],
    primarySources: ["Bangladesh"],
    defaultCurrency: "BDT",
  },
  exportConfig: {
    enabled: true,
    countries: ["UAE", "Singapore"],
    primaryDestinations: ["UAE"],
    defaultCurrency: "USD",
  },
};

let usersDb: SettingsUserRecord[] = INITIAL_USERS.map((row) => structuredClone(row));
let hubsDb: HubRecord[] = INITIAL_HUBS.map((row) => structuredClone(row));
let companySettingsDb: CompanySettings = structuredClone(DEFAULT_COMPANY_SETTINGS);

let notificationSettingsDb: NotificationSettings = {
  financeAlerts: {
    inApp: true,
    email: true,
    sms: false,
  },
  shipmentAlerts: {
    inApp: true,
    email: true,
    sms: true,
  },
  systemAlerts: {
    inApp: true,
    email: false,
    sms: false,
  },
};

async function simulateDelay(ms = 280) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function normalizeDate(value: string) {
  return new Date(value).getTime();
}

function sanitizeStringArray(values: string[]) {
  return values
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .filter((value, index, array) => array.indexOf(value) === index);
}

function toAutoCompanyCode(name: string) {
  const seed = name
    .split(/\s+/)
    .map((token) => token.replace(/[^A-Za-z0-9]/g, "").slice(0, 1).toUpperCase())
    .join("")
    .slice(0, 3)
    .padEnd(3, "X");

  return `${seed}-001`;
}

function toAutoHubCode(name: string) {
  const seed = name.replace(/[^A-Za-z0-9]/g, "").slice(0, 3).toUpperCase().padEnd(3, "X");
  const nextIndex = hubsDb.length + 1;
  return `${seed}-${String(nextIndex).padStart(3, "0")}`;
}

function cloneUser(row: SettingsUserRecord) {
  return structuredClone(row);
}

function cloneHub(row: HubRecord) {
  return structuredClone(row);
}

function assertUserExists(userId: string) {
  const index = usersDb.findIndex((row) => row.id === userId);
  if (index === -1) {
    throw new Error("User not found.");
  }

  return index;
}

function assertHubExists(hubId: string) {
  const index = hubsDb.findIndex((row) => row.id === hubId);
  if (index === -1) {
    throw new Error("Hub not found.");
  }

  return index;
}

function applyUserFilters(rows: SettingsUserRecord[], filters: UserFilters) {
  const query = normalizeText(filters.search);

  return rows.filter((row) => {
    const matchesSearch =
      query.length === 0 ||
      row.fullName.toLowerCase().includes(query) ||
      row.email.toLowerCase().includes(query) ||
      row.company.toLowerCase().includes(query);

    const matchesRole = filters.role === "All" || row.role === filters.role;
    const matchesStatus = filters.status === "All" || row.status === filters.status;

    return matchesSearch && matchesRole && matchesStatus;
  });
}

function applyHubFilters(rows: HubRecord[], filters: HubFilters) {
  const query = normalizeText(filters.search);

  return rows.filter((row) => {
    const matchesSearch =
      query.length === 0 ||
      row.name.toLowerCase().includes(query) ||
      row.country.toLowerCase().includes(query) ||
      row.city.toLowerCase().includes(query);

    const matchesType = filters.type === "All" || row.type === filters.type;

    return matchesSearch && matchesType;
  });
}

function nextUserId() {
  return `usr-${usersDb.length + 1}`;
}

function nextHubId() {
  const maxId = hubsDb.reduce((max, row) => {
    const value = Number(row.id.replace(/^h/, ""));
    return Number.isFinite(value) ? Math.max(max, value) : max;
  }, 0);

  return `h${maxId + 1}`;
}

function assertUniqueEmail(email: string, ignoreUserId?: string) {
  const normalized = normalizeText(email);
  const duplicate = usersDb.some(
    (row) => normalizeText(row.email) === normalized && row.id !== ignoreUserId,
  );

  if (duplicate) {
    throw new Error("A user with this email already exists.");
  }
}

function sanitizeOperationSettings(payload: HubOperationSettings): HubOperationSettings {
  return {
    enableImport: Boolean(payload.enableImport),
    enableExport: Boolean(payload.enableExport),
    enableTransit: Boolean(payload.enableTransit),
    financialControlHub: Boolean(payload.financialControlHub),
    inventoryControlHub: Boolean(payload.inventoryControlHub),
    activeStatus: Boolean(payload.activeStatus),
  };
}

function sanitizeTradeConnections(payload: HubTradeConnections): HubTradeConnections {
  return {
    importCountries: sanitizeStringArray(payload.importCountries),
    importAdditional: sanitizeStringArray(payload.importAdditional),
    importHubs: sanitizeStringArray(payload.importHubs),
    exportCountries: sanitizeStringArray(payload.exportCountries),
    exportAdditional: sanitizeStringArray(payload.exportAdditional),
    exportHubs: sanitizeStringArray(payload.exportHubs),
  };
}

export const settingsService = {
  async getUsers(filters: UserFilters = DEFAULT_USER_FILTERS): Promise<UserQueryResult> {
    await simulateDelay();

    const filtered = applyUserFilters(usersDb, filters).sort((a, b) => {
      return normalizeDate(b.createdAt) - normalizeDate(a.createdAt);
    });

    const start = (filters.page - 1) * filters.pageSize;
    const end = start + filters.pageSize;

    return {
      rows: filtered.slice(start, end).map(cloneUser),
      total: filtered.length,
      page: filters.page,
      pageSize: filters.pageSize,
    };
  },

  async createUser(payload: CreateUserPayload): Promise<SettingsUserRecord> {
    await simulateDelay(350);

    assertUniqueEmail(payload.email);

    const record: SettingsUserRecord = {
      id: nextUserId(),
      fullName: payload.fullName.trim(),
      email: payload.email.trim().toLowerCase(),
      role: payload.role,
      company: payload.company.trim(),
      status: "Active",
      createdAt: new Date().toISOString(),
    };

    usersDb = [record, ...usersDb];

    return cloneUser(record);
  },

  async updateUser(userId: string, payload: UpdateUserPayload): Promise<SettingsUserRecord> {
    await simulateDelay(320);

    const index = assertUserExists(userId);
    assertUniqueEmail(payload.email, userId);

    const updated: SettingsUserRecord = {
      ...usersDb[index],
      fullName: payload.fullName.trim(),
      email: payload.email.trim().toLowerCase(),
      role: payload.role,
      company: payload.company.trim(),
    };

    usersDb[index] = updated;

    return cloneUser(updated);
  },

  async toggleUserStatus(userId: string): Promise<SettingsUserRecord> {
    await simulateDelay(220);

    const index = assertUserExists(userId);
    const current = usersDb[index];

    const updated: SettingsUserRecord = {
      ...current,
      status: current.status === "Active" ? "Disabled" : "Active",
    };

    usersDb[index] = updated;

    return cloneUser(updated);
  },

  async getCompanySettings(): Promise<CompanySettings> {
    await simulateDelay(200);
    return structuredClone(companySettingsDb);
  },

  async updateCompanySettings(payload: CompanySettings): Promise<CompanySettings> {
    await simulateDelay(280);

    const normalizedCompanyName = payload.companyName.trim();
    const normalizedCode =
      payload.codeMode === "Auto"
        ? toAutoCompanyCode(normalizedCompanyName)
        : payload.code.trim().toUpperCase();

    companySettingsDb = {
      ...payload,
      companyName: normalizedCompanyName,
      code: normalizedCode,
      businessTypes: payload.businessTypes,
      logoName: payload.logoName?.trim() || undefined,
      operationStartDate: payload.operationStartDate,
      locationTags: sanitizeStringArray(payload.locationTags),
      importConfig: {
        ...payload.importConfig,
        countries: sanitizeStringArray(payload.importConfig.countries),
        primarySources: sanitizeStringArray(payload.importConfig.primarySources),
      },
      exportConfig: {
        ...payload.exportConfig,
        countries: sanitizeStringArray(payload.exportConfig.countries),
        primaryDestinations: sanitizeStringArray(payload.exportConfig.primaryDestinations),
      },
    };

    return structuredClone(companySettingsDb);
  },

  async getHubs(filters: HubFilters = DEFAULT_HUB_FILTERS): Promise<HubQueryResult> {
    await simulateDelay(240);

    const filtered = applyHubFilters(hubsDb, filters).sort((a, b) => a.name.localeCompare(b.name));

    const start = (filters.page - 1) * filters.pageSize;
    const end = start + filters.pageSize;

    return {
      rows: filtered.slice(start, end).map(cloneHub),
      total: filtered.length,
      page: filters.page,
      pageSize: filters.pageSize,
    };
  },

  async createHub(payload: UpsertHubPayload): Promise<HubRecord> {
    await simulateDelay(300);

    const operationSettings = sanitizeOperationSettings(payload.operationSettings);

    const record: HubRecord = {
      id: nextHubId(),
      name: payload.name.trim(),
      hubCode: payload.hubCode.trim().toUpperCase() || toAutoHubCode(payload.name),
      country: payload.country.trim(),
      city: payload.city.trim(),
      type: payload.type,
      enabled: payload.enabled,
      operationSettings,
      tradeConnections: sanitizeTradeConnections(payload.tradeConnections),
      updatedAt: new Date().toISOString(),
    };

    hubsDb = [record, ...hubsDb];

    return cloneHub(record);
  },

  async updateHub(hubId: string, payload: UpsertHubPayload): Promise<HubRecord> {
    await simulateDelay(260);

    const index = assertHubExists(hubId);

    const operationSettings = sanitizeOperationSettings(payload.operationSettings);

    const updated: HubRecord = {
      ...hubsDb[index],
      name: payload.name.trim(),
      hubCode: payload.hubCode.trim().toUpperCase(),
      country: payload.country.trim(),
      city: payload.city.trim(),
      type: payload.type,
      enabled: payload.enabled,
      operationSettings,
      tradeConnections: sanitizeTradeConnections(payload.tradeConnections),
      updatedAt: new Date().toISOString(),
    };

    hubsDb[index] = updated;

    return cloneHub(updated);
  },

  async getNotificationSettings(): Promise<NotificationSettings> {
    await simulateDelay(180);
    return structuredClone(notificationSettingsDb);
  },

  async updateNotificationSettings(payload: NotificationSettings): Promise<NotificationSettings> {
    await simulateDelay(220);

    notificationSettingsDb = structuredClone(payload);
    return structuredClone(notificationSettingsDb);
  },
};
