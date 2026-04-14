import type {
  CompanySettings,
  CreateUserPayload,
  HubFilters,
  HubQueryResult,
  HubRecord,
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
    email: "owner@neo.com",
    role: "BUSINESS_OWNER",
    company: "Mahadev Logistics Pvt Ltd",
    status: "Active",
    createdAt: "2026-01-05T08:00:00.000Z",
  },
  {
    id: "usr-2",
    fullName: "Nabila Karim",
    email: "manager@neo.com",
    role: "BUSINESS_MANAGER",
    company: "Mahadev Logistics Pvt Ltd",
    status: "Active",
    createdAt: "2026-01-12T10:10:00.000Z",
  },
  {
    id: "usr-3",
    fullName: "Rafi Ahmed",
    email: "sales@neo.com",
    role: "SALES_PERSON",
    company: "Mahadev Logistics Pvt Ltd",
    status: "Active",
    createdAt: "2026-01-15T09:00:00.000Z",
  },
  {
    id: "usr-4",
    fullName: "Mithila Rahman",
    email: "sales.manager@neo.com",
    role: "SALES_MANAGER",
    company: "Shree Ganesh Freight Lines",
    status: "Active",
    createdAt: "2026-02-01T06:20:00.000Z",
  },
  {
    id: "usr-5",
    fullName: "Ayon Das",
    email: "projects@neo.com",
    role: "PROJECT_MANAGER",
    company: "Bharat Coastal Movers",
    status: "Disabled",
    createdAt: "2026-02-18T12:30:00.000Z",
  },
  {
    id: "usr-6",
    fullName: "Sadia Noor",
    email: "stock@neo.com",
    role: "STOCK_MANAGER",
    company: "IndiTrans Supply Chain",
    status: "Active",
    createdAt: "2026-03-05T10:30:00.000Z",
  },
];

const INITIAL_HUBS: HubRecord[] = [
  {
    id: "hub-1",
    name: "Mumbai Port Hub",
    country: "India",
    city: "Mumbai",
    type: "HQ",
    enabled: true,
    updatedAt: "2026-03-21T08:00:00.000Z",
  },
  {
    id: "hub-2",
    name: "Delhi ICD Hub",
    country: "India",
    city: "New Delhi",
    type: "Origin",
    enabled: true,
    updatedAt: "2026-03-21T08:00:00.000Z",
  },
  {
    id: "hub-3",
    name: "Chennai Port Hub",
    country: "India",
    city: "Chennai",
    type: "Transit",
    enabled: true,
    updatedAt: "2026-03-24T07:30:00.000Z",
  },
  {
    id: "hub-4",
    name: "Mundra Port Hub",
    country: "India",
    city: "Mundra",
    type: "Destination",
    enabled: false,
    updatedAt: "2026-03-25T04:20:00.000Z",
  },
  {
    id: "hub-5",
    name: "Bangalore Air Cargo Hub",
    country: "India",
    city: "Bengaluru",
    type: "Transit",
    enabled: true,
    updatedAt: "2026-03-28T11:40:00.000Z",
  },
];

let usersDb: SettingsUserRecord[] = INITIAL_USERS.map((row) => structuredClone(row));
let hubsDb: HubRecord[] = INITIAL_HUBS.map((row) => structuredClone(row));

let companySettingsDb: CompanySettings = {
  companyName: "Mahadev Logistics Pvt Ltd",
  code: "MLP-001",
  businessType: "Logistics & Trading",
  logoName: "neo-logo.png",
  status: "Active",
};

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
  return `hub-${hubsDb.length + 1}`;
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

    companySettingsDb = {
      ...payload,
      companyName: payload.companyName.trim(),
      code: payload.code.trim().toUpperCase(),
      businessType: payload.businessType.trim(),
      logoName: payload.logoName?.trim() || undefined,
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

    const record: HubRecord = {
      id: nextHubId(),
      name: payload.name.trim(),
      country: payload.country.trim(),
      city: payload.city.trim(),
      type: payload.type,
      enabled: payload.enabled,
      updatedAt: new Date().toISOString(),
    };

    hubsDb = [record, ...hubsDb];

    return cloneHub(record);
  },

  async updateHub(hubId: string, payload: UpsertHubPayload): Promise<HubRecord> {
    await simulateDelay(260);

    const index = assertHubExists(hubId);

    const updated: HubRecord = {
      ...hubsDb[index],
      name: payload.name.trim(),
      country: payload.country.trim(),
      city: payload.city.trim(),
      type: payload.type,
      enabled: payload.enabled,
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
