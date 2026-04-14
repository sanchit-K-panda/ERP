export type JobStatus =
  | "Created"
  | "Processing"
  | "In Transit"
  | "Delivered"
  | "Completed"
  | "Cancelled";

export type ServiceType = "Shipping Only" | "Purchase + Shipping" | "Full Service";

export type CargoUnit = "kg" | "ton" | "pcs";

export type CurrencyCode = "INR";

export type JobExpense = {
  id: string;
  amount: number;
  category: string;
  notes: string;
  createdAt: string;
};

export type JobDocument = {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
};

export type JobShipment = {
  id: string;
  route: string;
  status: JobStatus;
  eta: string;
};

export type JobRecord = {
  id: string;
  jobId: string;
  partyId?: string;
  clientName: string;
  contactPerson?: string;
  serviceType: ServiceType;
  originHub: string;
  destinationHub: string;
  cargoDescription: string;
  quantity: number;
  unit: CargoUnit;
  weight?: number;
  supplierName?: string;
  purchaseAmount?: number;
  estimatedCost?: number;
  currency: CurrencyCode;
  notes?: string;
  status: JobStatus;
  isDraft: boolean;
  createdDate: string;
  expenses: JobExpense[];
  documents: JobDocument[];
  shipments: JobShipment[];
};

export type JobsQueryFilters = {
  search: string;
  status: JobStatus | "All";
  hub: string | "All";
  fromDate: string;
  toDate: string;
  page: number;
  pageSize: number;
};

export type JobsQueryResult = {
  rows: JobRecord[];
  total: number;
  page: number;
  pageSize: number;
};

export type CreateJobPayload = {
  partyId?: string;
  clientName: string;
  contactPerson?: string;
  serviceType: ServiceType;
  originHub: string;
  destinationHub: string;
  cargoDescription: string;
  quantity: number;
  unit: CargoUnit;
  weight?: number;
  supplierName?: string;
  purchaseAmount?: number;
  estimatedCost?: number;
  currency: CurrencyCode;
  notes?: string;
  documentDrafts: Array<{
    fileName: string;
    fileType: string;
    fileSize: number;
  }>;
};

export type CreateJobFormValues = {
  partyId: string;
  clientName: string;
  contactPerson: string;
  serviceType: ServiceType;
  originHub: string;
  destinationHub: string;
  cargoDescription: string;
  quantity: string;
  unit: CargoUnit;
  weight: string;
  supplierName: string;
  purchaseAmount: string;
  estimatedCost: string;
  currency: CurrencyCode;
  notes: string;
  documents: LocalUploadDocument[];
};

export type AddExpensePayload = {
  amount: number;
  category: string;
  notes: string;
};

export type UploadDocumentPayload = {
  fileName: string;
  fileType: string;
  fileSize: number;
};

export type LocalUploadDocument = {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  progress: number;
  status: "uploading" | "done";
};

export type SectionId =
  | "client-info"
  | "service-type"
  | "route-details"
  | "cargo-details"
  | "purchase-info"
  | "financial"
  | "documents";

export const JOB_STATUS_ORDER: JobStatus[] = [
  "Created",
  "Processing",
  "In Transit",
  "Delivered",
  "Completed",
];
