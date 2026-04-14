import type {
  CreateReportExportPayload,
  ReportChartPoint,
  ReportExportRequest,
  ReportFilters,
  ReportQueryResult,
  ReportRow,
  ReportSchema,
  ReportSummaryMetric,
  ReportType,
} from "@/modules/reports/types";

type MonthSeed = {
  date: string;
  dimension: string;
  index: number;
};

type ReportSeed = {
  schema: ReportSchema;
  rows: ReportRow[];
};

const HUBS = [
  "Mumbai Port Hub",
  "Delhi ICD Hub",
  "Chennai Port Hub",
  "Mundra Port Hub",
  "Bangalore Air Cargo Hub",
];

function shiftMonths(base: Date, delta: number) {
  return new Date(base.getFullYear(), base.getMonth() + delta, 1);
}

function buildMonthSeeds(totalMonths: number): MonthSeed[] {
  const now = new Date();

  return Array.from({ length: totalMonths }).map((_, index) => {
    const offset = index - (totalMonths - 1);
    const date = shiftMonths(now, offset);

    return {
      date: date.toISOString(),
      dimension: date.toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      }),
      index,
    };
  });
}

function toOneDecimal(value: number) {
  return Number(value.toFixed(1));
}

function buildRevenueRows(months: MonthSeed[]): ReportRow[] {
  return months.map((month) => {
    const primaryValue = 11_800_000 + month.index * 830_000 + (month.index % 3) * 610_000;
    const expenseRatio = 0.58 + (month.index % 4) * 0.03;
    const secondaryValue = Math.round(primaryValue * expenseRatio);
    const tertiaryValue = toOneDecimal(((primaryValue - secondaryValue) / primaryValue) * 100);

    return {
      id: `report-revenue-${month.index + 1}`,
      date: month.date,
      hub: HUBS[month.index % HUBS.length],
      dimension: month.dimension,
      primaryValue,
      secondaryValue,
      tertiaryValue,
    };
  });
}

function buildThroughputRows(months: MonthSeed[]): ReportRow[] {
  return months.map((month) => {
    const primaryValue = 42 + month.index * 3 + (month.index % 2) * 4;
    const secondaryValue = Math.max(0, primaryValue - (4 + (month.index % 4)));
    const tertiaryValue = toOneDecimal((secondaryValue / Math.max(primaryValue, 1)) * 100);

    return {
      id: `report-throughput-${month.index + 1}`,
      date: month.date,
      hub: HUBS[(month.index + 1) % HUBS.length],
      dimension: month.dimension,
      primaryValue,
      secondaryValue,
      tertiaryValue,
    };
  });
}

function buildTimelinessRows(months: MonthSeed[]): ReportRow[] {
  return months.map((month) => {
    const primaryValue = 58 + month.index * 2;
    const secondaryValue = 5 + (month.index % 5);
    const tertiaryValue = toOneDecimal(
      (primaryValue / Math.max(primaryValue + secondaryValue, 1)) * 100,
    );

    return {
      id: `report-timeliness-${month.index + 1}`,
      date: month.date,
      hub: HUBS[(month.index + 2) % HUBS.length],
      dimension: month.dimension,
      primaryValue,
      secondaryValue,
      tertiaryValue,
    };
  });
}

const MONTH_SEEDS = buildMonthSeeds(12);

const REPORT_SEEDS: Record<ReportType, ReportSeed> = {
  "Revenue vs Expense": {
    schema: {
      reportType: "Revenue vs Expense",
      dimensionLabel: "Month",
      primaryLabel: "Revenue",
      secondaryLabel: "Expense",
      tertiaryLabel: "Margin %",
      primaryFormat: "currency",
      secondaryFormat: "currency",
      tertiaryFormat: "percent",
      exportFileName: "revenue-expense",
    },
    rows: buildRevenueRows(MONTH_SEEDS),
  },
  "Job Throughput": {
    schema: {
      reportType: "Job Throughput",
      dimensionLabel: "Month",
      primaryLabel: "Jobs Opened",
      secondaryLabel: "Jobs Completed",
      tertiaryLabel: "Completion %",
      primaryFormat: "number",
      secondaryFormat: "number",
      tertiaryFormat: "percent",
      exportFileName: "job-throughput",
    },
    rows: buildThroughputRows(MONTH_SEEDS),
  },
  "Shipment Timeliness": {
    schema: {
      reportType: "Shipment Timeliness",
      dimensionLabel: "Month",
      primaryLabel: "On-time Shipments",
      secondaryLabel: "Delayed Shipments",
      tertiaryLabel: "On-time %",
      primaryFormat: "number",
      secondaryFormat: "number",
      tertiaryFormat: "percent",
      exportFileName: "shipment-timeliness",
    },
    rows: buildTimelinessRows(MONTH_SEEDS),
  },
};

async function simulateDelay(ms = 300) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeDate(value: string) {
  return new Date(value).getTime();
}

function daysFromRange(range: ReportFilters["range"]) {
  if (range === "7d") {
    return 7;
  }

  if (range === "30d") {
    return 30;
  }

  if (range === "90d") {
    return 90;
  }

  return 365;
}

function applyDateWindow(rows: ReportRow[], filters: ReportFilters) {
  if (rows.length === 0) {
    return rows;
  }

  const maxDate = rows.reduce((max, row) => {
    const rowDate = normalizeDate(row.date);
    return rowDate > max ? rowDate : max;
  }, normalizeDate(rows[0].date));

  const defaultStartDate = new Date(maxDate);
  defaultStartDate.setDate(defaultStartDate.getDate() - daysFromRange(filters.range));

  const fromDate = filters.fromDate ? normalizeDate(filters.fromDate) : defaultStartDate.getTime();
  const toDate = filters.toDate ? normalizeDate(filters.toDate) : maxDate;

  return rows.filter((row) => {
    const rowDate = normalizeDate(row.date);
    return rowDate >= fromDate && rowDate <= toDate;
  });
}

function applyFilters(rows: ReportRow[], filters: ReportFilters) {
  const search = filters.search.trim().toLowerCase();

  return rows.filter((row) => {
    const matchesSearch =
      search.length === 0 ||
      row.dimension.toLowerCase().includes(search) ||
      row.hub.toLowerCase().includes(search);

    const matchesHub = filters.hub === "All" || row.hub === filters.hub;

    return matchesSearch && matchesHub;
  });
}

function summarize(rows: ReportRow[], schema: ReportSchema): ReportSummaryMetric[] {
  const totalPrimary = rows.reduce((sum, row) => sum + row.primaryValue, 0);
  const totalSecondary = rows.reduce((sum, row) => sum + row.secondaryValue, 0);
  const avgTertiary =
    rows.length === 0
      ? 0
      : rows.reduce((sum, row) => sum + row.tertiaryValue, 0) / rows.length;

  return [
    {
      id: "primary",
      label: `Total ${schema.primaryLabel}`,
      value: totalPrimary,
      format: schema.primaryFormat,
    },
    {
      id: "secondary",
      label: `Total ${schema.secondaryLabel}`,
      value: totalSecondary,
      format: schema.secondaryFormat,
    },
    {
      id: "tertiary",
      label: `Average ${schema.tertiaryLabel}`,
      value: toOneDecimal(avgTertiary),
      format: schema.tertiaryFormat,
    },
  ];
}

function toChartPoints(rows: ReportRow[]): ReportChartPoint[] {
  return rows
    .slice()
    .sort((a, b) => normalizeDate(a.date) - normalizeDate(b.date))
    .map((row) => ({
      dimension: row.dimension,
      primaryValue: row.primaryValue,
      secondaryValue: row.secondaryValue,
      tertiaryValue: row.tertiaryValue,
    }));
}

let exportRequestsDb: ReportExportRequest[] = [];

export const reportService = {
  async getReportData(filters: ReportFilters): Promise<ReportQueryResult> {
    await simulateDelay(320);

    const seed = REPORT_SEEDS[filters.reportType];

    const filteredRows = applyFilters(applyDateWindow(seed.rows, filters), filters)
      .slice()
      .sort((a, b) => normalizeDate(b.date) - normalizeDate(a.date));

    const start = (filters.page - 1) * filters.pageSize;
    const end = start + filters.pageSize;

    return {
      schema: seed.schema,
      summary: summarize(filteredRows, seed.schema),
      chartPoints: toChartPoints(filteredRows).slice(-12),
      rows: filteredRows.slice(start, end).map((row) => structuredClone(row)),
      total: filteredRows.length,
      page: filters.page,
      pageSize: filters.pageSize,
      generatedAt: new Date().toISOString(),
    };
  },

  async getAvailableHubs(reportType: ReportType): Promise<string[]> {
    await simulateDelay(160);

    const hubs = new Set(REPORT_SEEDS[reportType].rows.map((row) => row.hub));
    return [...hubs.values()].sort((a, b) => a.localeCompare(b));
  },

  async requestReportExport(payload: CreateReportExportPayload): Promise<ReportExportRequest> {
    await simulateDelay(420);

    const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");
    const sequence = exportRequestsDb.length + 1;

    const record: ReportExportRequest = {
      id: `rpt-exp-${datePart}-${String(sequence).padStart(3, "0")}`,
      format: payload.format,
      requestedAt: new Date().toISOString(),
      status: "Queued",
    };

    exportRequestsDb = [record, ...exportRequestsDb];

    return structuredClone(record);
  },
};
