# NEO CRM — High-Level Design (HLD)

**Version:** 1.0  
**Type:** Architecture & Data Flow Reference  

---

## 1. System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                           NEO CRM PLATFORM                           │
│                                                                      │
│  ┌─────────────┐    ┌──────────────────────────────────────────────┐ │
│  │   Browser   │    │                  BACKEND API                 │ │
│  │  React SPA  │◄──►│    NestJS + PostgreSQL + Redis + S3          │ │
│  │  (Desktop)  │    │                                              │ │
│  └─────────────┘    │  ┌──────────────────────────────────────┐   │ │
│                     │  │           MODULE DOMAINS              │   │ │
│                     │  │  Auth  │  Company  │  Hub  │  Jobs    │   │ │
│                     │  │  Finance │ Shipments │ Docs │ Reports  │   │ │
│                     │  └──────────────────────────────────────┘   │ │
│                     └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. Application Layer Diagram

```
┌────────────────────────────────────────────────────────────┐
│                     REACT SPA (Frontend)                   │
│                                                            │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │  Router  │  │  Zustand     │  │   TanStack Query      │ │
│  │  (pages) │  │  (UI state)  │  │   (server state)      │ │
│  └────┬─────┘  └──────────────┘  └──────────┬───────────┘ │
│       │                                       │             │
│  ┌────▼─────────────────────────────────────▼───────────┐ │
│  │              COMPONENTS + MODULES                    │ │
│  │  Auth | Company | Hub | Dashboard | Jobs             │ │
│  │  Finance | Shipments | Parties | Docs | Reports      │ │
│  └──────────────────────────┬───────────────────────────┘ │
│                             │                              │
│  ┌──────────────────────────▼───────────────────────────┐ │
│  │            SERVICE LAYER (Axios + interceptors)      │ │
│  │  Attaches: Authorization cookie, X-Company-ID,       │ │
│  │            X-Hub-ID headers on every request         │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────┬───────────────────────────────┘
                             │ HTTPS
┌────────────────────────────▼───────────────────────────────┐
│                     NESTJS API (Backend)                   │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │          REQUEST PIPELINE                            │ │
│  │  Nginx → AuthGuard → CompanyGuard → RolesGuard       │ │
│  │       → Controller → Service → Prisma → PostgreSQL   │ │
│  │       ← AuditInterceptor (async via Bull queue)       │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌─────────────┐  ┌────────────┐  ┌────────────────────┐ │
│  │ PostgreSQL  │  │   Redis    │  │     AWS S3         │ │
│  │ (main DB)   │  │ (cache +   │  │  (file storage)    │ │
│  │             │  │  queues)   │  │                    │ │
│  └─────────────┘  └────────────┘  └────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

---

## 3. User Onboarding Flow (HLD)

```
                    ┌──────────┐
                    │  Login   │
                    └────┬─────┘
                         │
              ┌──────────▼──────────┐
              │  Select Company     │
              │  (or Create New)    │
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │  Create Company     │  4-Step Wizard:
              │  Wizard             │  1. Basic Info
              │  (if creating new)  │  2. Operations Setup
              └──────────┬──────────┘  3. Trade Flow Config
                         │             4. Review & Create
              ┌──────────▼──────────┐
              │  Select Hub         │
              │  (or Add New)       │
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │  Dashboard          │
              └─────────────────────┘
```

---

## 4. Job Lifecycle State Machine

```
                    ┌─────────┐
              ┌────►│  DRAFT  │────┐
              │     └─────────┘    │  Discard
              │                    ▼
        Save  │     ┌─────────┐   [deleted]
        Draft │     │ CREATED │
              │     └────┬────┘
              │          │ Processing started
              │     ┌────▼──────┐
              │     │ PROCESSING│
              │     └────┬──────┘
              │          │ Cargo shipped
              │     ┌────▼──────┐
              │     │ IN TRANSIT│
              │     └────┬──────┘
              │          │ Cargo arrived
              │     ┌────▼──────┐
              │     │ DELIVERED │
              │     └────┬──────┘
              │          │ All settled
              │     ┌────▼──────┐
              │     │ COMPLETED │
              │     └───────────┘
              │
              │          ── At any point ──
              │
              │     ┌────────────┐
              └─────│ CANCELLED  │
                    └────────────┘
```

---

## 5. Shipment Tracking Flow

```
Job Created
     │
     ▼
Add Shipment (linked to job)
     │  Fields: Freight Type, Tracking #, Departure, ETA, Route
     ▼
┌──────────────┐
│  PROCESSING  │  → Goods prepared for shipping
└──────┬───────┘
       │
┌──────▼───────┐
│  IN TRANSIT  │  → Cargo en route (Air/Sea)
└──────┬───────┘
       │
┌──────▼───────┐
│  DELIVERED   │  → Arrived at destination hub
└──────┬───────┘
       │
   [Job status can now → DELIVERED]
```

---

## 6. Trade Flow Model (Hub Logic)

```
IMPORT FLOW:
  ┌─────────────────┐
  │ Import Countries│ (China, Pakistan, India...)
  └────────┬────────┘
           │ Sea / Air freight
  ┌────────▼────────┐
  │   ORIGIN HUB    │ (e.g., Pakistan Hub)
  │  (Agent/Partner)│
  └────────┬────────┘
           │ Consolidation + customs
  ┌────────▼────────┐
  │    MAIN HUB     │ (Bangladesh HQ)
  │  (Home Office)  │
  └────────┬────────┘
           │ Local delivery
  ┌────────▼────────┐
  │   CLIENT SITE   │ (Acme Global Trade, Dhaka)
  └─────────────────┘

EXPORT FLOW (reverse — for export-enabled hubs):
  Main Hub → Origin Hub → Export Countries
```

---

## 7. Data Scoping Model

```
REQUEST: GET /api/v1/jobs

Headers:
  Authorization: Bearer <jwt>          ← Who is the user?
  X-Company-ID: company-uuid           ← Which company context?
  X-Hub-ID: hub-uuid                   ← Which hub context? (optional)

Service Layer Query:
  WHERE company_id = req.company.id
    AND hub_id = req.hub?.id           ← if hub-scoped
    AND (role-based filters)           ← if role restricts visibility

Result: Only jobs for this company/hub that this role can see.
```

---

## 8. Financial Data Flow

```
JOB CREATED
     │
     ├─ Estimated Cost recorded (planning)
     │
     ▼
PURCHASE MADE (if Purchase + Shipping)
     │
     ├─ Supplier Invoice uploaded
     ├─ Purchase Amount → Expense Transaction created
     │
     ▼
EXPENSES ADDED (during job lifecycle)
     │
     ├─ Freight cost, customs fees, local transport
     ├─ Each → Transaction (type: EXPENSE)
     │
     ▼
INVOICE TO CLIENT
     │
     ├─ Invoice generated for client
     ├─ Amount → Transaction (type: INCOME) when paid
     │
     ▼
CASH BALANCE = Σ INCOME - Σ EXPENSE  (per company, per period)
```

---

## 9. Notification Architecture

```
System Events → Event Emitter (NestJS)
     │
     ├─── Finance Events:
     │    - Invoice overdue → Alert: Finance
     │    - Payment received → Alert: Finance
     │
     ├─── Shipment Events:
     │    - Shipment delayed → Alert: Shipment
     │    - Status updated → Alert: Shipment
     │
     └─── System Events:
          - New user added → Alert: System
          - Company settings changed → Alert: System

Bull Queue (email-notification)
     │
     └─ SendGrid → User email

Frontend (Notification Bell)
     │
     └─ GET /api/v1/notifications → Badge count + dropdown
```

---

## 10. Document Management Flow

```
User selects file in UI (Drag & Drop or click)
     │
     ▼ (client-side validation: type, size)
POST /api/v1/documents/upload
  multipart/form-data: file + metadata (job_id, doc_type)
     │
     ▼ (server-side validation: MIME type, size)
Upload to AWS S3
  Key: /{company_id}/{job_id}/{timestamp}_{filename}
     │
     ▼
Save document metadata to PostgreSQL
  (file_name, doc_type, storage_key, file_size, uploaded_by)
     │
     ▼
Return: { document_id, file_name, doc_type }

Download:
  GET /api/v1/documents/:id/download
     │
     ▼ Generate S3 presigned URL (15-min expiry)
     │
     ▼ Return URL → Client opens in new tab
```

---

## 11. Role-Permission Matrix (Simplified)

```
                  BO   BM   SM   SP   PM   StM  CUST
Dashboard         ✅   ✅   ✅   ✅   ✅   ✅   ❌
Create Job        ✅   ✅   ✅   ✅   ❌   ❌   ❌
View Jobs         ✅   ✅   ✅   ✅   ✅   ❌   👁️
Manage Finance    ✅   ✅   ❌   ❌   ❌   ❌   ❌
Add Expense       ✅   ✅   ❌   ❌   ❌   ❌   ❌
Manage Shipments  ✅   ✅   ✅   🔶   ✅   ❌   👁️
Upload Documents  ✅   ✅   ✅   ✅   ✅   ❌   ❌
View Reports      ✅   ✅   ✅   ❌   🔶   ❌   ❌
System Settings   ✅   🔶   ❌   ❌   ❌   ❌   ❌
Manage Warehouse  ✅   ✅   ❌   ❌   🔶   ✅   ❌

BO=Business Owner, BM=Business Manager, SM=Sales Manager,
SP=Sales Person, PM=Project Manager, StM=Stock Manager, CUST=Customer
✅ Full | 🔶 Limited | 👁️ View Only | ❌ None
```

---

*HLD Owner: Tech Lead / Architect | Updated: Per major feature addition*
