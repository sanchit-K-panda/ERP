import type {
  AddExpensePayload,
  CreateJobPayload,
  JobDocument,
  JobExpense,
  JobRecord,
  JobStatus,
  JobsQueryFilters,
  JobsQueryResult,
  UploadDocumentPayload,
} from "@/modules/jobs/types";

const STATUS_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  Created: ["Processing", "Cancelled"],
  Processing: ["In Transit", "Cancelled"],
  "In Transit": ["Delivered", "Cancelled"],
  Delivered: ["Completed", "Cancelled"],
  Completed: [],
  Cancelled: [],
};

const INITIAL_JOBS: JobRecord[] = [
  {
    id: "job-1",
    jobId: "J-20260414-01",
    partyId: "party-reliance",
    clientName: "Reliance Retail Limited",
    contactPerson: "Ananya Sharma",
    serviceType: "Purchase + Shipping",
    originHub: "Mumbai Port Hub",
    destinationHub: "Dubai Free Zone Hub",
    cargoDescription: "Consumer electronics",
    quantity: 420,
    unit: "pcs",
    weight: 980,
    supplierName: "Jebel Ali Distribution LLC",
    purchaseAmount: 18000000,
    estimatedCost: 24500000,
    currency: "INR",
    notes: "Priority customs release for retail launch window",
    status: "In Transit",
    isDraft: false,
    createdDate: "2026-04-14",
    expenses: [
      {
        id: "exp-1",
        amount: 560000,
        category: "Freight",
        notes: "Air freight booking",
        createdAt: "2026-04-14T08:15:00.000Z",
      },
    ],
    documents: [
      {
        id: "doc-1",
        fileName: "packing-list-acme.pdf",
        fileType: "application/pdf",
        fileSize: 248732,
        uploadedAt: "2026-04-14T07:45:00.000Z",
      },
    ],
    shipments: [
      {
        id: "ship-1",
        route: "Mumbai Port Hub -> Dubai Free Zone Hub",
        status: "In Transit",
        eta: "2026-04-18",
      },
    ],
  },
  {
    id: "job-2",
    jobId: "J-20260413-04",
    partyId: "party-tata",
    clientName: "Tata Steel Limited",
    contactPerson: "Rohan Banerjee",
    serviceType: "Shipping Only",
    originHub: "Chennai Port Hub",
    destinationHub: "Singapore Gateway Hub",
    cargoDescription: "Industrial steel coils",
    quantity: 52,
    unit: "ton",
    weight: 52000,
    estimatedCost: 13200000,
    currency: "INR",
    notes: "Container split on arrival for two plants",
    status: "Processing",
    isDraft: false,
    createdDate: "2026-04-13",
    expenses: [],
    documents: [],
    shipments: [
      {
        id: "ship-2",
        route: "Chennai Port Hub -> Singapore Gateway Hub",
        status: "Processing",
        eta: "2026-04-21",
      },
    ],
  },
  {
    id: "job-3",
    jobId: "J-20260411-03",
    partyId: "party-adani",
    clientName: "Adani Ports and SEZ",
    contactPerson: "Kunal Mehta",
    serviceType: "Purchase + Shipping",
    originHub: "Mundra Port Hub",
    destinationHub: "Rotterdam Port Hub",
    cargoDescription: "Engineering machinery assemblies",
    quantity: 1200,
    unit: "pcs",
    weight: 1760,
    supplierName: "EuroMach BV",
    purchaseAmount: 8600000,
    estimatedCost: 12400000,
    currency: "INR",
    notes: "Export documentation verified and sealed",
    status: "Delivered",
    isDraft: false,
    createdDate: "2026-04-11",
    expenses: [
      {
        id: "exp-2",
        amount: 310000,
        category: "Customs",
        notes: "Port handling fees",
        createdAt: "2026-04-12T06:10:00.000Z",
      },
    ],
    documents: [
      {
        id: "doc-2",
        fileName: "invoice-nova.pdf",
        fileType: "application/pdf",
        fileSize: 164900,
        uploadedAt: "2026-04-12T04:00:00.000Z",
      },
    ],
    shipments: [
      {
        id: "ship-3",
        route: "Mundra Port Hub -> Rotterdam Port Hub",
        status: "Delivered",
        eta: "2026-04-12",
      },
    ],
  },
  {
    id: "job-4",
    jobId: "J-20260408-06",
    partyId: "party-mahindra",
    clientName: "Mahindra Logistics Limited",
    contactPerson: "Priya Nair",
    serviceType: "Shipping Only",
    originHub: "Delhi ICD Hub",
    destinationHub: "Mumbai Port Hub",
    cargoDescription: "Auto spare parts",
    quantity: 12,
    unit: "ton",
    weight: 12000,
    estimatedCost: 6400000,
    currency: "INR",
    notes: "Domestic rail-sea transfer",
    status: "Completed",
    isDraft: false,
    createdDate: "2026-04-08",
    expenses: [],
    documents: [],
    shipments: [
      {
        id: "ship-4",
        route: "Delhi ICD Hub -> Mumbai Port Hub",
        status: "Delivered",
        eta: "2026-04-10",
      },
    ],
  },
  {
    id: "job-5",
    jobId: "J-20260405-02",
    partyId: "party-lnt",
    clientName: "Larsen and Toubro Ltd",
    contactPerson: "Vivek Iyer",
    serviceType: "Purchase + Shipping",
    originHub: "Bangalore Air Cargo Hub",
    destinationHub: "Chennai Port Hub",
    cargoDescription: "Project control panels",
    quantity: 640,
    unit: "pcs",
    weight: 2200,
    supplierName: "South India Industrial Supplies",
    purchaseAmount: 9200000,
    estimatedCost: 13800000,
    currency: "INR",
    notes: "Carrier changed due to runway congestion",
    status: "Cancelled",
    isDraft: false,
    createdDate: "2026-04-05",
    expenses: [],
    documents: [],
    shipments: [],
  },
];

let jobsDb: JobRecord[] = INITIAL_JOBS.map((job) => structuredClone(job));

async function simulateDelay() {
  await new Promise((resolve) => setTimeout(resolve, 400));
}

function cloneJob(job: JobRecord) {
  return structuredClone(job);
}

function normalizeDate(value: string) {
  return new Date(value).getTime();
}

function generateJobIdentifiers() {
  const nextIndex = jobsDb.length + 1;
  const id = `job-${nextIndex}`;
  const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const jobId = `J-${datePart}-${String(nextIndex).padStart(2, "0")}`;

  return { id, jobId };
}

function findJobIndex(jobId: string) {
  return jobsDb.findIndex((item) => item.jobId === jobId);
}

function assertJobExists(jobId: string) {
  const index = findJobIndex(jobId);
  if (index === -1) {
    throw new Error("Job not found.");
  }

  return index;
}

function assertStatusTransition(currentStatus: JobStatus, nextStatus: JobStatus) {
  if (currentStatus === nextStatus) {
    return;
  }

  const allowedTransitions = STATUS_TRANSITIONS[currentStatus];
  if (!allowedTransitions.includes(nextStatus)) {
    throw new Error(`Invalid status transition from ${currentStatus} to ${nextStatus}.`);
  }
}

function applyJobFilters(allJobs: JobRecord[], filters: JobsQueryFilters) {
  const search = filters.search.trim().toLowerCase();

  return allJobs.filter((job) => {
    const matchesSearch =
      search.length === 0 ||
      job.jobId.toLowerCase().includes(search) ||
      job.clientName.toLowerCase().includes(search);

    const matchesStatus = filters.status === "All" || job.status === filters.status;

    const matchesHub =
      filters.hub === "All" ||
      job.originHub.toLowerCase() === filters.hub.toLowerCase() ||
      job.destinationHub.toLowerCase() === filters.hub.toLowerCase();

    const createdAt = normalizeDate(job.createdDate);
    const matchesFromDate =
      filters.fromDate.length === 0 || createdAt >= normalizeDate(filters.fromDate);
    const matchesToDate =
      filters.toDate.length === 0 || createdAt <= normalizeDate(filters.toDate);

    return matchesSearch && matchesStatus && matchesHub && matchesFromDate && matchesToDate;
  });
}

export const jobService = {
  async getJobs(filters: JobsQueryFilters): Promise<JobsQueryResult> {
    await simulateDelay();

    const filtered = applyJobFilters(jobsDb, filters);
    const startIndex = (filters.page - 1) * filters.pageSize;
    const endIndex = startIndex + filters.pageSize;

    return {
      rows: filtered.slice(startIndex, endIndex).map(cloneJob),
      total: filtered.length,
      page: filters.page,
      pageSize: filters.pageSize,
    };
  },

  async getJobById(jobId: string): Promise<JobRecord> {
    await simulateDelay();

    const index = assertJobExists(jobId);
    return cloneJob(jobsDb[index]);
  },

  async createJob(payload: CreateJobPayload, asDraft = false): Promise<JobRecord> {
    await simulateDelay();

    const { id, jobId } = generateJobIdentifiers();

    const job: JobRecord = {
      id,
      jobId,
      partyId: payload.partyId,
      clientName: payload.clientName,
      contactPerson: payload.contactPerson,
      serviceType: payload.serviceType,
      originHub: payload.originHub,
      destinationHub: payload.destinationHub,
      cargoDescription: payload.cargoDescription,
      quantity: payload.quantity,
      unit: payload.unit,
      weight: payload.weight,
      supplierName: payload.supplierName,
      purchaseAmount: payload.purchaseAmount,
      estimatedCost: payload.estimatedCost,
      currency: payload.currency,
      notes: payload.notes,
      status: "Created",
      isDraft: asDraft,
      createdDate: new Date().toISOString().slice(0, 10),
      expenses: [],
      documents: payload.documentDrafts.map((item, index) => ({
        id: `${id}-doc-${index + 1}`,
        fileName: item.fileName,
        fileType: item.fileType,
        fileSize: item.fileSize,
        uploadedAt: new Date().toISOString(),
      })),
      shipments: [],
    };

    jobsDb = [job, ...jobsDb];

    return cloneJob(job);
  },

  async updateJobStatus(jobId: string, nextStatus: JobStatus): Promise<JobRecord> {
    await simulateDelay();

    const index = assertJobExists(jobId);
    const current = jobsDb[index];

    assertStatusTransition(current.status, nextStatus);

    const updated: JobRecord = {
      ...current,
      status: nextStatus,
      isDraft: false,
    };

    jobsDb[index] = updated;
    return cloneJob(updated);
  },

  async addExpense(jobId: string, payload: AddExpensePayload): Promise<JobExpense> {
    await simulateDelay();

    const index = assertJobExists(jobId);
    const expense: JobExpense = {
      id: `${jobsDb[index].id}-exp-${jobsDb[index].expenses.length + 1}`,
      amount: payload.amount,
      category: payload.category,
      notes: payload.notes,
      createdAt: new Date().toISOString(),
    };

    jobsDb[index] = {
      ...jobsDb[index],
      expenses: [expense, ...jobsDb[index].expenses],
    };

    return structuredClone(expense);
  },

  async uploadDocument(jobId: string, payload: UploadDocumentPayload): Promise<JobDocument> {
    await simulateDelay();

    const index = assertJobExists(jobId);

    const document: JobDocument = {
      id: `${jobsDb[index].id}-doc-${jobsDb[index].documents.length + 1}`,
      fileName: payload.fileName,
      fileType: payload.fileType,
      fileSize: payload.fileSize,
      uploadedAt: new Date().toISOString(),
    };

    jobsDb[index] = {
      ...jobsDb[index],
      documents: [document, ...jobsDb[index].documents],
    };

    return structuredClone(document);
  },

  async deleteDocument(jobId: string, documentId: string): Promise<void> {
    await simulateDelay();

    const index = assertJobExists(jobId);
    jobsDb[index] = {
      ...jobsDb[index],
      documents: jobsDb[index].documents.filter((item) => item.id !== documentId),
    };
  },

  async getJobsByParty(partyId: string, fallbackName?: string): Promise<JobRecord[]> {
    await simulateDelay();

    return jobsDb
      .filter((job) => {
        if (job.partyId && job.partyId === partyId) {
          return true;
        }

        if (fallbackName) {
          return job.clientName.toLowerCase() === fallbackName.toLowerCase();
        }

        return false;
      })
      .map(cloneJob);
  },

  getAllowedStatusTransitions(status: JobStatus): JobStatus[] {
    return [...STATUS_TRANSITIONS[status]];
  },
};
