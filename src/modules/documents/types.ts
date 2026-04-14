export type DocumentCategory =
  | "Invoice"
  | "Bill of Lading"
  | "Packing List"
  | "Customs"
  | "Contract"
  | "Other";

export type DocumentStatus = "Uploaded" | "Processing" | "Archived";

export type DocumentEntityType = "Job" | "Shipment" | "Party" | "Finance";

export type DocumentRecord = {
  id: string;
  documentId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  category: DocumentCategory;
  entityType: DocumentEntityType;
  entityId: string;
  uploadedBy: string;
  uploadedAt: string;
  status: DocumentStatus;
  tags: string[];
  previewText: string;
};

export type DocumentFilters = {
  search: string;
  category: DocumentCategory | "All";
  entityType: DocumentEntityType | "All";
  status: DocumentStatus | "All";
  uploadedBy: string | "All";
  page: number;
  pageSize: number;
};

export type DocumentQueryResult = {
  rows: DocumentRecord[];
  total: number;
  page: number;
  pageSize: number;
};

export type UploadDocumentPayload = {
  fileName: string;
  fileType: string;
  fileSize: number;
  category: DocumentCategory;
  entityType: DocumentEntityType;
  entityId: string;
  uploadedBy: string;
  tags?: string[];
};

export type UploadQueueItem = {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  progress: number;
  status: "uploading" | "done" | "error";
  message?: string;
};

export type DocumentFilterOptions = {
  uploadedBy: string[];
};

export const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  "Invoice",
  "Bill of Lading",
  "Packing List",
  "Customs",
  "Contract",
  "Other",
];

export const DOCUMENT_ENTITY_TYPES: DocumentEntityType[] = [
  "Job",
  "Shipment",
  "Party",
  "Finance",
];
