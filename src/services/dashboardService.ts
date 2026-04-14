export type KpiMetric = {
  id: "totalJobs" | "revenue" | "expenses" | "cashBalance" | "pendingPayments";
  label: string;
  value: number;
  trend: number;
};

export type JobStatus = "Delivered" | "In Transit" | "Pending" | "Delayed";

export type RecentJob = {
  jobId: string;
  client: string;
  status: JobStatus;
  date: string;
};

export type TransactionType = "Income" | "Expense";

export type TransactionItem = {
  id: string;
  party: string;
  type: TransactionType;
  amount: number;
  time: string;
};

export type ShipmentItem = {
  shipmentId: string;
  route: string;
  status: JobStatus;
  eta: string;
};

export type InsightPriority = "high" | "medium" | "low";
export type InsightCategory = "payments" | "shipments" | "revenue" | "system";

export type InsightItem = {
  id: string;
  category: InsightCategory;
  title: string;
  detail: string;
  priority: InsightPriority;
};

export type RevenueExpensePoint = {
  month: string;
  revenue: number;
  expense: number;
};

export type CashFlowPoint = {
  month: string;
  value: number;
};

export type PerformanceData = {
  revenueExpense: RevenueExpensePoint[];
  jobCompletionRate: number;
  cashFlow: CashFlowPoint[];
};

const KPI_DATA: KpiMetric[] = [
  { id: "totalJobs", label: "Total Jobs", value: 54, trend: 6.2 },
  { id: "revenue", label: "Revenue (Monthly)", value: 54450000, trend: 4.9 },
  { id: "expenses", label: "Expenses (Monthly)", value: 26390000, trend: -1.2 },
  { id: "cashBalance", label: "Cash Balance", value: 42870000, trend: 3.8 },
  { id: "pendingPayments", label: "Pending Payments", value: 22000000, trend: -3.4 },
];

const RECENT_JOBS: RecentJob[] = [
  {
    jobId: "J-20260414-01",
    client: "Reliance Retail Limited",
    status: "In Transit",
    date: "2026-04-14",
  },
  {
    jobId: "J-20260413-04",
    client: "Tata Steel Limited",
    status: "Pending",
    date: "2026-04-13",
  },
  {
    jobId: "J-20260412-04",
    client: "Adani Ports and SEZ",
    status: "Delivered",
    date: "2026-04-12",
  },
  {
    jobId: "J-20260408-06",
    client: "Mahindra Logistics Limited",
    status: "Delayed",
    date: "2026-04-10",
  },
  {
    jobId: "J-20260405-02",
    client: "Larsen and Toubro Ltd",
    status: "Delayed",
    date: "2026-04-09",
  },
  {
    jobId: "J-20260408-09",
    client: "Bharat Coastal Movers",
    status: "In Transit",
    date: "2026-04-08",
  },
  {
    jobId: "J-20260407-06",
    client: "IndiTrans Supply Chain",
    status: "Pending",
    date: "2026-04-07",
  },
];

const TRANSACTIONS: TransactionItem[] = [
  {
    id: "T-2081",
    party: "Reliance Retail Limited",
    type: "Income",
    amount: 22500000,
    time: "12m ago",
  },
  {
    id: "T-2080",
    party: "Adani Ports and SEZ",
    type: "Expense",
    amount: 6420000,
    time: "25m ago",
  },
  {
    id: "T-2079",
    party: "Mahindra Logistics Limited",
    type: "Expense",
    amount: 2185000,
    time: "43m ago",
  },
  {
    id: "T-2078",
    party: "Adani Ports and SEZ",
    type: "Income",
    amount: 12100000,
    time: "1h ago",
  },
  {
    id: "T-2077",
    party: "Tata Steel Limited",
    type: "Income",
    amount: 19850000,
    time: "2h ago",
  },
  {
    id: "T-2076",
    party: "Larsen and Toubro Ltd",
    type: "Expense",
    amount: 980000,
    time: "3h ago",
  },
];

const SHIPMENTS: ShipmentItem[] = [
  {
    shipmentId: "S-1009",
    route: "Mumbai Port Hub -> Dubai Free Zone Hub",
    status: "In Transit",
    eta: "2026-04-18",
  },
  {
    shipmentId: "S-1008",
    route: "Chennai Port Hub -> Singapore Gateway Hub",
    status: "Pending",
    eta: "2026-04-21",
  },
  {
    shipmentId: "S-1007",
    route: "Delhi ICD Hub -> Mumbai Port Hub",
    status: "Delivered",
    eta: "2026-04-13",
  },
  {
    shipmentId: "S-1006",
    route: "Bangalore Air Cargo Hub -> Chennai Port Hub",
    status: "Delayed",
    eta: "2026-04-15",
  },
  {
    shipmentId: "S-1005",
    route: "Mundra Port Hub -> Rotterdam Port Hub",
    status: "Delivered",
    eta: "2026-04-12",
  },
];

const INSIGHTS: InsightItem[] = [
  {
    id: "I-1",
    category: "payments",
    title: "Overdue payments",
    detail: "3 invoices are overdue for more than 7 days.",
    priority: "high",
  },
  {
    id: "I-2",
    category: "shipments",
    title: "Delayed shipments",
    detail: "2 active shipments are past expected checkpoint.",
    priority: "high",
  },
  {
    id: "I-3",
    category: "revenue",
    title: "Revenue pacing",
    detail: "Month is currently +5.4% against previous period.",
    priority: "medium",
  },
  {
    id: "I-4",
    category: "system",
    title: "System update",
    detail: "New audit policy applied to finance actions.",
    priority: "low",
  },
];

const PERFORMANCE_DATA: PerformanceData = {
  revenueExpense: [
    { month: "Jan", revenue: 40200000, expense: 27100000 },
    { month: "Feb", revenue: 44800000, expense: 25900000 },
    { month: "Mar", revenue: 50700000, expense: 28100000 },
    { month: "Apr", revenue: 54450000, expense: 26390000 },
  ],
  jobCompletionRate: 82,
  cashFlow: [
    { month: "Jan", value: 13100000 },
    { month: "Feb", value: 18900000 },
    { month: "Mar", value: 22600000 },
    { month: "Apr", value: 28060000 },
  ],
};

async function simulateDelay() {
  await new Promise((resolve) => setTimeout(resolve, 400));
}

export const dashboardService = {
  async getKpis(): Promise<KpiMetric[]> {
    await simulateDelay();
    return KPI_DATA.map((item) => ({ ...item }));
  },

  async getRecentJobs(): Promise<RecentJob[]> {
    await simulateDelay();
    return RECENT_JOBS.map((item) => ({ ...item }));
  },

  async getTransactions(): Promise<TransactionItem[]> {
    await simulateDelay();
    return TRANSACTIONS.map((item) => ({ ...item }));
  },

  async getShipments(): Promise<ShipmentItem[]> {
    await simulateDelay();
    return SHIPMENTS.map((item) => ({ ...item }));
  },

  async getPerformanceData(): Promise<PerformanceData> {
    await simulateDelay();
    return {
      revenueExpense: PERFORMANCE_DATA.revenueExpense.map((item) => ({ ...item })),
      jobCompletionRate: PERFORMANCE_DATA.jobCompletionRate,
      cashFlow: PERFORMANCE_DATA.cashFlow.map((item) => ({ ...item })),
    };
  },

  async getInsights(): Promise<InsightItem[]> {
    await simulateDelay();
    return INSIGHTS.map((item) => ({ ...item }));
  },
};
