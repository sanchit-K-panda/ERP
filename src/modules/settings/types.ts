export type SettingsUserRole =
  | "BUSINESS_OWNER"
  | "BUSINESS_MANAGER"
  | "SALES_MANAGER"
  | "SALES_PERSON"
  | "PROJECT_MANAGER"
  | "STOCK_MANAGER";

export type SettingsUserStatus = "Active" | "Disabled";

export type SettingsUserRecord = {
  id: string;
  fullName: string;
  email: string;
  role: SettingsUserRole;
  company: string;
  status: SettingsUserStatus;
  createdAt: string;
};

export type UserFilters = {
  search: string;
  role: SettingsUserRole | "All";
  status: SettingsUserStatus | "All";
  page: number;
  pageSize: number;
};

export type UserQueryResult = {
  rows: SettingsUserRecord[];
  total: number;
  page: number;
  pageSize: number;
};

export type CreateUserPayload = {
  fullName: string;
  email: string;
  role: SettingsUserRole;
  company: string;
  password: string;
};

export type UpdateUserPayload = {
  fullName: string;
  email: string;
  role: SettingsUserRole;
  company: string;
  password?: string;
};

export type PermissionLevel = {
  read: boolean;
  write: boolean;
};

export type PermissionFeature = "Jobs" | "Shipments" | "Finance" | "Reports" | "Settings";

export type PermissionRoleKey = "Owner" | "Manager" | "Sales";

export type PermissionMatrix = Record<PermissionFeature, Record<PermissionRoleKey, PermissionLevel>>;

export type CompanySettingsStatus = "Active" | "Draft";

export type CompanyCodeMode = "Auto" | "Manual";

export type CompanyBusinessType = "Pharma" | "Logistics" | "Agriculture" | "Textile";

export type CompanyOperationHub = "Bangladesh" | "Pakistan" | "China" | "USA" | "UAE" | "India";

export type CompanyCurrencyCode = "BDT" | "USD" | "EUR";

export type CompanyImportConfig = {
  enabled: boolean;
  countries: string[];
  primarySources: string[];
  defaultCurrency: CompanyCurrencyCode;
};

export type CompanyExportConfig = {
  enabled: boolean;
  countries: string[];
  primaryDestinations: string[];
  defaultCurrency: CompanyCurrencyCode;
};

export type CompanySettings = {
  id: string;
  companyName: string;
  code: string;
  codeMode: CompanyCodeMode;
  businessTypes: CompanyBusinessType[];
  logoName?: string;
  status: CompanySettingsStatus;
  operationStartDate: string;
  mainOperationHub: CompanyOperationHub;
  locationTags: string[];
  importConfig: CompanyImportConfig;
  exportConfig: CompanyExportConfig;
};

export type HubType = "HQ" | "Import Hub" | "Export Hub" | "Transit Hub";

export type HubOperationSettings = {
  enableImport: boolean;
  enableExport: boolean;
  enableTransit: boolean;
  financialControlHub: boolean;
  inventoryControlHub: boolean;
  activeStatus: boolean;
};

export type HubTradeConnections = {
  importCountries: string[];
  importAdditional: string[];
  importHubs: string[];
  exportCountries: string[];
  exportAdditional: string[];
  exportHubs: string[];
};

export type HubRecord = {
  id: string;
  name: string;
  hubCode: string;
  country: string;
  city: string;
  type: HubType;
  enabled: boolean;
  operationSettings: HubOperationSettings;
  tradeConnections: HubTradeConnections;
  updatedAt: string;
};

export type HubFilters = {
  search: string;
  type: HubType | "All";
  page: number;
  pageSize: number;
};

export type HubQueryResult = {
  rows: HubRecord[];
  total: number;
  page: number;
  pageSize: number;
};

export type UpsertHubPayload = {
  name: string;
  hubCode: string;
  country: string;
  city: string;
  type: HubType;
  enabled: boolean;
  operationSettings: HubOperationSettings;
  tradeConnections: HubTradeConnections;
};

export type NotificationChannels = {
  inApp: boolean;
  email: boolean;
  sms: boolean;
};

export type NotificationSettings = {
  financeAlerts: NotificationChannels;
  shipmentAlerts: NotificationChannels;
  systemAlerts: NotificationChannels;
};

export const SETTINGS_ROLE_OPTIONS: SettingsUserRole[] = [
  "BUSINESS_OWNER",
  "BUSINESS_MANAGER",
  "SALES_MANAGER",
  "SALES_PERSON",
  "PROJECT_MANAGER",
  "STOCK_MANAGER",
];

export const HUB_TYPE_OPTIONS: HubType[] = ["HQ", "Import Hub", "Export Hub", "Transit Hub"];
