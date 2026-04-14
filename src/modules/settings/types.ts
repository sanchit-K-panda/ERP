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

export type CompanySettings = {
  companyName: string;
  code: string;
  businessType: string;
  logoName?: string;
  status: CompanySettingsStatus;
};

export type HubType = "HQ" | "Origin" | "Destination" | "Transit";

export type HubRecord = {
  id: string;
  name: string;
  country: string;
  city: string;
  type: HubType;
  enabled: boolean;
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
  country: string;
  city: string;
  type: HubType;
  enabled: boolean;
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

export const HUB_TYPE_OPTIONS: HubType[] = ["HQ", "Origin", "Destination", "Transit"];
