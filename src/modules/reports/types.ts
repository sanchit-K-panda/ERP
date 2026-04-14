export type ReportType = "Revenue vs Expense" | "Job Throughput" | "Shipment Timeliness";

export type ReportValueFormat = "currency" | "number" | "percent";

export type ReportPresetRange = "7d" | "30d" | "90d" | "12m";

export type ReportViewMode = "table" | "chart";

export type ReportRow = {
  id: string;
  date: string;
  hub: string;
  dimension: string;
  primaryValue: number;
  secondaryValue: number;
  tertiaryValue: number;
};

export type ReportSchema = {
  reportType: ReportType;
  dimensionLabel: string;
  primaryLabel: string;
  secondaryLabel: string;
  tertiaryLabel: string;
  primaryFormat: ReportValueFormat;
  secondaryFormat: ReportValueFormat;
  tertiaryFormat: ReportValueFormat;
  exportFileName: string;
};

export type ReportSummaryMetric = {
  id: string;
  label: string;
  value: number;
  format: ReportValueFormat;
};

export type ReportChartPoint = {
  dimension: string;
  primaryValue: number;
  secondaryValue: number;
  tertiaryValue: number;
};

export type ReportFilters = {
  reportType: ReportType;
  search: string;
  hub: string | "All";
  range: ReportPresetRange;
  fromDate: string;
  toDate: string;
  page: number;
  pageSize: number;
};

export type ReportQueryResult = {
  schema: ReportSchema;
  summary: ReportSummaryMetric[];
  chartPoints: ReportChartPoint[];
  rows: ReportRow[];
  total: number;
  page: number;
  pageSize: number;
  generatedAt: string;
};

export type ReportExportFormat = "CSV" | "PDF";

export type CreateReportExportPayload = {
  filters: ReportFilters;
  format: ReportExportFormat;
};

export type ReportExportRequest = {
  id: string;
  format: ReportExportFormat;
  requestedAt: string;
  status: "Queued";
};

export const REPORT_TYPES: ReportType[] = [
  "Revenue vs Expense",
  "Job Throughput",
  "Shipment Timeliness",
];

export const REPORT_PRESET_RANGES: Array<{ value: ReportPresetRange; label: string }> = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "12m", label: "Last 12 months" },
];
