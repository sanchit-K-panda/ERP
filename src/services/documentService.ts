import type {
  DocumentFilterOptions,
  DocumentFilters,
  DocumentQueryResult,
  DocumentRecord,
  DocumentStatus,
  UploadDocumentPayload,
} from "@/modules/documents/types";

function daysAgo(days: number) {
  const value = new Date();
  value.setDate(value.getDate() - days);
  return value.toISOString();
}

const INITIAL_DOCUMENTS: DocumentRecord[] = [
  {
    id: "document-1",
    documentId: "DOC-2026-001",
    fileName: "reliance-commercial-invoice.pdf",
    fileType: "application/pdf",
    fileSize: 254_000,
    category: "Invoice",
    entityType: "Job",
    entityId: "J-20260414-01",
    uploadedBy: "Nabila Karim",
    uploadedAt: daysAgo(2),
    status: "Uploaded",
    tags: ["client", "invoice"],
    previewText: "Commercial invoice for Bangladesh Shipping Corporation (BSC) shipment batch 01.",
  },
  {
    id: "document-2",
    documentId: "DOC-2026-002",
    fileName: "tata-bl-original.pdf",
    fileType: "application/pdf",
    fileSize: 198_400,
    category: "Bill of Lading",
    entityType: "Shipment",
    entityId: "SHP-20260413-04",
    uploadedBy: "Mithila Rahman",
    uploadedAt: daysAgo(3),
    status: "Uploaded",
    tags: ["bl", "sea"],
    previewText: "Original bill of lading associated with Bangladesh Shipping Agencies shipment.",
  },
  {
    id: "document-3",
    documentId: "DOC-2026-003",
    fileName: "adani-packing-list.xlsx",
    fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    fileSize: 118_900,
    category: "Packing List",
    entityType: "Job",
    entityId: "J-20260411-03",
    uploadedBy: "Ayon Das",
    uploadedAt: daysAgo(5),
    status: "Uploaded",
    tags: ["packing", "warehouse"],
    previewText: "Line-level packing list including crate references and item weights.",
  },
  {
    id: "document-4",
    documentId: "DOC-2026-004",
    fileName: "port-customs-clearance.pdf",
    fileType: "application/pdf",
    fileSize: 302_400,
    category: "Customs",
    entityType: "Shipment",
    entityId: "SHP-20260414-01",
    uploadedBy: "Rafi Ahmed",
    uploadedAt: daysAgo(7),
    status: "Processing",
    tags: ["customs", "clearance"],
    previewText: "Customs clearance file pending final verification from port authority.",
  },
  {
    id: "document-5",
    documentId: "DOC-2026-005",
    fileName: "warehouse-contract-q2.pdf",
    fileType: "application/pdf",
    fileSize: 428_900,
    category: "Contract",
    entityType: "Party",
    entityId: "party-lnt",
    uploadedBy: "Sadia Noor",
    uploadedAt: daysAgo(9),
    status: "Archived",
    tags: ["contract", "legal"],
    previewText: "Signed warehousing service agreement for Q2 allocation in western corridor.",
  },
  {
    id: "document-6",
    documentId: "DOC-2026-006",
    fileName: "finance-settlement-proof.pdf",
    fileType: "application/pdf",
    fileSize: 211_750,
    category: "Other",
    entityType: "Finance",
    entityId: "TXN-20260414-01",
    uploadedBy: "Nabila Karim",
    uploadedAt: daysAgo(1),
    status: "Uploaded",
    tags: ["finance", "payment"],
    previewText: "Settlement confirmation receipt attached against transaction TXN-20260414-01.",
  },
];

let documentsDb: DocumentRecord[] = INITIAL_DOCUMENTS.map((row) => structuredClone(row));

async function simulateDelay(ms = 300) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeDate(value: string) {
  return new Date(value).getTime();
}

function cloneRecord(row: DocumentRecord) {
  return structuredClone(row);
}

function assertDocumentExists(documentId: string) {
  const index = documentsDb.findIndex((row) => row.documentId === documentId);
  if (index === -1) {
    throw new Error("Document not found.");
  }

  return index;
}

function applyFilters(rows: DocumentRecord[], filters: DocumentFilters) {
  const query = filters.search.trim().toLowerCase();

  return rows.filter((row) => {
    const matchesSearch =
      query.length === 0 ||
      row.fileName.toLowerCase().includes(query) ||
      row.documentId.toLowerCase().includes(query) ||
      row.entityId.toLowerCase().includes(query) ||
      row.tags.some((tag) => tag.toLowerCase().includes(query));

    const matchesCategory = filters.category === "All" || row.category === filters.category;
    const matchesEntity = filters.entityType === "All" || row.entityType === filters.entityType;
    const matchesStatus = filters.status === "All" || row.status === filters.status;
    const matchesUploader = filters.uploadedBy === "All" || row.uploadedBy === filters.uploadedBy;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesEntity &&
      matchesStatus &&
      matchesUploader
    );
  });
}

function nextDocumentIdentifiers() {
  const sequence = documentsDb.length + 1;
  const year = new Date().getFullYear();

  return {
    id: `document-${sequence}`,
    documentId: `DOC-${year}-${String(sequence).padStart(3, "0")}`,
  };
}

export const documentService = {
  async getDocuments(filters: DocumentFilters): Promise<DocumentQueryResult> {
    await simulateDelay(320);

    const filtered = applyFilters(documentsDb, filters).sort(
      (a, b) => normalizeDate(b.uploadedAt) - normalizeDate(a.uploadedAt),
    );

    const start = (filters.page - 1) * filters.pageSize;
    const end = start + filters.pageSize;

    return {
      rows: filtered.slice(start, end).map(cloneRecord),
      total: filtered.length,
      page: filters.page,
      pageSize: filters.pageSize,
    };
  },

  async uploadDocument(payload: UploadDocumentPayload): Promise<DocumentRecord> {
    await simulateDelay(460);

    const ids = nextDocumentIdentifiers();

    const record: DocumentRecord = {
      ...ids,
      fileName: payload.fileName,
      fileType: payload.fileType,
      fileSize: payload.fileSize,
      category: payload.category,
      entityType: payload.entityType,
      entityId: payload.entityId,
      uploadedBy: payload.uploadedBy,
      uploadedAt: new Date().toISOString(),
      status: "Uploaded",
      tags: payload.tags?.length ? payload.tags : [payload.category.toLowerCase()],
      previewText: `Preview is not generated for ${payload.fileName} yet.`,
    };

    documentsDb = [record, ...documentsDb];

    return cloneRecord(record);
  },

  async deleteDocument(documentId: string): Promise<void> {
    await simulateDelay(200);

    const index = assertDocumentExists(documentId);
    documentsDb.splice(index, 1);
  },

  async updateDocumentStatus(documentId: string, status: DocumentStatus): Promise<DocumentRecord> {
    await simulateDelay(220);

    const index = assertDocumentExists(documentId);
    const updated: DocumentRecord = {
      ...documentsDb[index],
      status,
    };

    documentsDb[index] = updated;

    return cloneRecord(updated);
  },

  async getDocumentById(documentId: string): Promise<DocumentRecord> {
    await simulateDelay(160);

    const index = assertDocumentExists(documentId);
    return cloneRecord(documentsDb[index]);
  },

  async getFilterOptions(): Promise<DocumentFilterOptions> {
    await simulateDelay(150);

    const uploadedBySet = new Set(documentsDb.map((row) => row.uploadedBy));

    return {
      uploadedBy: [...uploadedBySet.values()].sort((a, b) => a.localeCompare(b)),
    };
  },
};
