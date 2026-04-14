import type {
  CashFlowPoint,
  CreateTransactionPayload,
  FinanceSummary,
  FinanceTransaction,
  InvoiceRecord,
  TransactionFilters,
  TransactionQueryResult,
} from "@/modules/finance/types";

const INITIAL_TRANSACTIONS: FinanceTransaction[] = [
  {
    id: "txn-1",
    transactionId: "TXN-20260414-01",
    jobId: "J-20260414-01",
    partyId: "party-reliance",
    partyName: "Reliance Retail Limited",
    type: "Income",
    category: "Client Payment",
    amount: 22500000,
    currency: "INR",
    date: "2026-04-14",
    description: "Advance payment received for April shipment window",
  },
  {
    id: "txn-2",
    transactionId: "TXN-20260414-02",
    jobId: "J-20260414-01",
    partyId: "party-adani",
    partyName: "Adani Ports and SEZ",
    type: "Expense",
    category: "Freight",
    amount: 6420000,
    currency: "INR",
    date: "2026-04-14",
    description: "Air freight booking and airway bill charges",
  },
  {
    id: "txn-3",
    transactionId: "TXN-20260413-03",
    jobId: "J-20260413-04",
    partyId: "party-tata",
    partyName: "Tata Steel Limited",
    type: "Income",
    category: "Client Payment",
    amount: 19850000,
    currency: "INR",
    date: "2026-04-13",
    description: "Milestone payment for sea freight release",
  },
  {
    id: "txn-4",
    transactionId: "TXN-20260412-04",
    jobId: "J-20260411-03",
    partyId: "party-mahindra",
    partyName: "Mahindra Logistics Limited",
    type: "Expense",
    category: "Customs",
    amount: 2185000,
    currency: "INR",
    date: "2026-04-12",
    description: "Port duty, inspection, and handling",
  },
  {
    id: "txn-5",
    transactionId: "TXN-20260411-05",
    jobId: "J-20260411-03",
    partyId: "party-adani",
    partyName: "Adani Ports and SEZ",
    type: "Income",
    category: "Service Charge",
    amount: 12100000,
    currency: "INR",
    date: "2026-04-11",
    description: "Final logistics service fee settlement",
  },
  {
    id: "txn-6",
    transactionId: "TXN-20260330-06",
    jobId: "J-20260408-06",
    partyId: "party-mahindra",
    partyName: "Mahindra Logistics Limited",
    type: "Expense",
    category: "Handling",
    amount: 980000,
    currency: "INR",
    date: "2026-03-30",
    description: "Last-mile handling and local transport",
  },
  {
    id: "txn-7",
    transactionId: "TXN-20260322-07",
    jobId: "J-20260405-02",
    partyId: "party-lnt",
    partyName: "Larsen and Toubro Ltd",
    type: "Income",
    category: "Client Payment",
    amount: 8600000,
    currency: "INR",
    date: "2026-03-22",
    description: "Project installment against cancelled route coverage",
  },
  {
    id: "txn-8",
    transactionId: "TXN-20260216-08",
    partyId: "party-adani",
    partyName: "Adani Ports and SEZ",
    type: "Expense",
    category: "Warehousing",
    amount: 1240000,
    currency: "INR",
    date: "2026-02-16",
    description: "Monthly warehouse rent",
  },
  {
    id: "txn-9",
    transactionId: "TXN-20260117-09",
    partyId: "party-tata",
    partyName: "Tata Steel Limited",
    type: "Income",
    category: "Reimbursement",
    amount: 5200000,
    currency: "INR",
    date: "2026-01-17",
    description: "Freight differential reimbursement",
  },
];

const INITIAL_INVOICES: InvoiceRecord[] = [
  {
    id: "inv-1",
    invoiceId: "INV-202604-010",
    jobId: "J-20260414-01",
    amount: 12600000,
    currency: "INR",
    status: "Pending",
    dueDate: "2026-04-21",
  },
  {
    id: "inv-2",
    invoiceId: "INV-202604-009",
    jobId: "J-20260413-04",
    amount: 9400000,
    currency: "INR",
    status: "Overdue",
    dueDate: "2026-04-10",
  },
  {
    id: "inv-3",
    invoiceId: "INV-202604-004",
    jobId: "J-20260411-03",
    amount: 17300000,
    currency: "INR",
    status: "Paid",
    dueDate: "2026-04-08",
  },
  {
    id: "inv-4",
    invoiceId: "INV-202603-022",
    jobId: "J-20260408-06",
    amount: 5200000,
    currency: "INR",
    status: "Paid",
    dueDate: "2026-03-30",
  },
];

let transactionsDb: FinanceTransaction[] = INITIAL_TRANSACTIONS.map((row) => structuredClone(row));
const invoicesDb: InvoiceRecord[] = INITIAL_INVOICES.map((row) => structuredClone(row));

async function simulateDelay() {
  await new Promise((resolve) => setTimeout(resolve, 320));
}

function normalizeDate(value: string) {
  return new Date(value).getTime();
}

function cloneTransaction(row: FinanceTransaction) {
  return structuredClone(row);
}

function cloneInvoice(row: InvoiceRecord) {
  return structuredClone(row);
}

function toMonthLabel(value: string) {
  const date = new Date(value);
  return date.toLocaleDateString("en-IN", { month: "short" });
}

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function monthKeyFromDate(value: string) {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function applyFilters(rows: FinanceTransaction[], filters: TransactionFilters) {
  const query = filters.search.trim().toLowerCase();

  return rows.filter((row) => {
    const matchesSearch =
      query.length === 0 ||
      row.transactionId.toLowerCase().includes(query) ||
      row.partyName.toLowerCase().includes(query) ||
      (row.jobId?.toLowerCase().includes(query) ?? false);

    const matchesType = filters.type === "All" || row.type === filters.type;
    const matchesCategory = filters.category === "All" || row.category === filters.category;

    const dateValue = normalizeDate(row.date);
    const matchesFromDate =
      filters.fromDate.length === 0 || dateValue >= normalizeDate(filters.fromDate);
    const matchesToDate = filters.toDate.length === 0 || dateValue <= normalizeDate(filters.toDate);

    return matchesSearch && matchesType && matchesCategory && matchesFromDate && matchesToDate;
  });
}

function getNextTransactionIds() {
  const sequence = transactionsDb.length + 1;
  const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");

  return {
    id: `txn-${sequence}`,
    transactionId: `TXN-${datePart}-${String(sequence).padStart(2, "0")}`,
  };
}

function computeSummary(rows: FinanceTransaction[], invoices: InvoiceRecord[]): FinanceSummary {
  const monthKey = currentMonthKey();

  const monthlyIncome = rows
    .filter((row) => row.type === "Income" && monthKeyFromDate(row.date) === monthKey)
    .reduce((sum, row) => sum + row.amount, 0);

  const monthlyExpense = rows
    .filter((row) => row.type === "Expense" && monthKeyFromDate(row.date) === monthKey)
    .reduce((sum, row) => sum + row.amount, 0);

  const cashBalance = rows.reduce((sum, row) => {
    if (row.type === "Income") {
      return sum + row.amount;
    }

    return sum - row.amount;
  }, 0);

  const pendingPayments = invoices
    .filter((invoice) => invoice.status === "Pending" || invoice.status === "Overdue")
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  return {
    cashBalance,
    totalIncomeMonthly: monthlyIncome,
    totalExpenseMonthly: monthlyExpense,
    pendingPayments,
  };
}

function computeCashFlow(rows: FinanceTransaction[]): CashFlowPoint[] {
  const monthMap = new Map<string, { month: string; income: number; expense: number; sort: number }>();

  rows.forEach((row) => {
    const date = new Date(row.date);
    const key = monthKeyFromDate(row.date);
    const existing = monthMap.get(key) ?? {
      month: toMonthLabel(row.date),
      income: 0,
      expense: 0,
      sort: date.getFullYear() * 100 + date.getMonth(),
    };

    if (row.type === "Income") {
      existing.income += row.amount;
    } else {
      existing.expense += row.amount;
    }

    monthMap.set(key, existing);
  });

  return [...monthMap.values()]
    .sort((a, b) => a.sort - b.sort)
    .slice(-6)
    .map(({ month, income, expense }) => ({ month, income, expense }));
}

export const financeService = {
  async getTransactions(filters: TransactionFilters): Promise<TransactionQueryResult> {
    await simulateDelay();

    const filtered = applyFilters(transactionsDb, filters).sort(
      (a, b) => normalizeDate(b.date) - normalizeDate(a.date),
    );

    const start = (filters.page - 1) * filters.pageSize;
    const end = start + filters.pageSize;

    return {
      rows: filtered.slice(start, end).map(cloneTransaction),
      total: filtered.length,
      page: filters.page,
      pageSize: filters.pageSize,
    };
  },

  async createTransaction(payload: CreateTransactionPayload): Promise<FinanceTransaction> {
    await simulateDelay();

    const ids = getNextTransactionIds();

    const record: FinanceTransaction = {
      ...ids,
      type: payload.type,
      amount: payload.amount,
      currency: payload.currency,
      category: payload.category,
      partyId: payload.partyId,
      partyName: payload.partyName,
      jobId: payload.jobId,
      date: payload.date,
      description: payload.description,
    };

    transactionsDb = [record, ...transactionsDb];
    return cloneTransaction(record);
  },

  async getFinanceSummary(): Promise<FinanceSummary> {
    await simulateDelay();
    return computeSummary(transactionsDb, invoicesDb);
  },

  async getCashFlowData(): Promise<CashFlowPoint[]> {
    await simulateDelay();
    return computeCashFlow(transactionsDb);
  },

  async getInvoices(): Promise<InvoiceRecord[]> {
    await simulateDelay();
    return invoicesDb
      .slice()
      .sort((a, b) => normalizeDate(a.dueDate) - normalizeDate(b.dueDate))
      .map(cloneInvoice);
  },

  async getJobTransactions(jobId: string): Promise<FinanceTransaction[]> {
    await simulateDelay();

    return transactionsDb
      .filter((row) => row.jobId === jobId)
      .sort((a, b) => normalizeDate(b.date) - normalizeDate(a.date))
      .map(cloneTransaction);
  },

  async getPartyTransactions(partyId: string, fallbackName?: string): Promise<FinanceTransaction[]> {
    await simulateDelay();

    return transactionsDb
      .filter((row) => {
        if (row.partyId && row.partyId === partyId) {
          return true;
        }

        if (fallbackName) {
          return row.partyName.toLowerCase() === fallbackName.toLowerCase();
        }

        return false;
      })
      .sort((a, b) => normalizeDate(b.date) - normalizeDate(a.date))
      .map(cloneTransaction);
  },
};
