export type TransactionType = "Income" | "Expense";

export type CurrencyCode = "BDT";

export type InvoiceStatus = "Paid" | "Pending" | "Overdue";

export type FinanceTransaction = {
  id: string;
  transactionId: string;
  jobId?: string;
  partyId?: string;
  partyName: string;
  type: TransactionType;
  category: string;
  amount: number;
  currency: CurrencyCode;
  date: string;
  description: string;
};

export type FinanceSummary = {
  cashBalance: number;
  totalIncomeMonthly: number;
  totalExpenseMonthly: number;
  pendingPayments: number;
};

export type CashFlowPoint = {
  month: string;
  income: number;
  expense: number;
};

export type InvoiceRecord = {
  id: string;
  invoiceId: string;
  jobId?: string;
  amount: number;
  currency: CurrencyCode;
  status: InvoiceStatus;
  dueDate: string;
};

export type TransactionFilters = {
  search: string;
  type: TransactionType | "All";
  category: string | "All";
  fromDate: string;
  toDate: string;
  page: number;
  pageSize: number;
};

export type TransactionQueryResult = {
  rows: FinanceTransaction[];
  total: number;
  page: number;
  pageSize: number;
};

export type CreateTransactionPayload = {
  type: TransactionType;
  amount: number;
  currency: CurrencyCode;
  category: string;
  partyId?: string;
  partyName: string;
  jobId?: string;
  date: string;
  description: string;
};

export type TransactionJobOption = {
  jobId: string;
  partyId?: string;
  clientName: string;
};

export const TRANSACTION_CATEGORIES = [
  "Freight",
  "Customs",
  "Handling",
  "Fuel",
  "Warehousing",
  "Service Charge",
  "Client Payment",
  "Reimbursement",
] as const;
