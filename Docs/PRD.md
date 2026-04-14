# NEO CRM — Product Requirements Document (PRD)

**Version:** 1.0  
**Status:** Active Development  
**Product Owner:** Business Lead  
**Last Revised:** 2025  

---

## 1. Executive Summary

NEO CRM is a multi-company, multi-hub **trade and logistics management platform** designed for import/export businesses. It provides end-to-end visibility and control over trade operations — from job creation and shipment tracking to financial management and reporting.

The system supports multiple business roles with differentiated access, serves multiple companies from a single platform, and organizes operations around geographic **hubs** (origin/destination nodes in a trade network).

---

## 2. Problem Statement

Import/export logistics businesses currently suffer from:
- Fragmented tools — using Excel, WhatsApp, and disconnected software simultaneously.
- No unified view of jobs, shipments, and finances in one place.
- Difficulty managing multiple companies or hubs under one operational roof.
- No role-based access — everyone sees everything, creating data risk and confusion.
- Manual status tracking leads to delays and client miscommunication.
- No structured documentation management for packing lists, invoices, and compliance docs.

---

## 3. Goals & Success Metrics

| Goal | Success Metric |
|---|---|
| Centralize trade operations | 100% of jobs created in-system within 3 months of launch |
| Reduce manual work | 50% reduction in time to create and track a shipment |
| Improve visibility | Dashboard KPIs update in real-time; team reports satisfaction ≥ 4/5 |
| Ensure data security | Zero cross-company data leaks; role violations = 0 in audit |
| Support business growth | System handles 500+ concurrent jobs without performance degradation |

---

## 4. Scope

### In Scope (v1.0)

- Multi-company workspace with company setup wizard
- Multi-hub configuration (origin, destination, transit hubs)
- Role-based authentication and authorization
- Job Management (create, track, manage lifecycle)
- Shipment Management (add shipments to jobs, track freight)
- Basic Finance (expense logging, revenue tracking, cash balance)
- Sales & Party (client/vendor contact management)
- Document Management (upload packing lists, invoices, supporting docs)
- Dashboard with KPIs and performance charts
- Reports module
- Settings & configuration

### Out of Scope (v1.0 — deferred to v2)

- Full Service job type (marked "Coming Soon")
- AI Agent features
- Customer-facing portal
- Mobile application
- Advanced accounting (journal entries, trial balance)
- ERP integrations

---

## 5. User Roles & Personas

### 5.1 Role Hierarchy

```
BUSINESS OWNER
    └── BUSINESS MANAGER
            ├── SALES MANAGER
            │       └── SALES PERSON
            ├── PROJECT MANAGER
            └── STOCK MANAGER
                        └── CUSTOMER (read-only, limited scope)
```

### 5.2 Role Capabilities

| Feature | Business Owner | Business Manager | Sales Manager | Sales Person | Project Manager | Stock Manager | Customer |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Manage Companies | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Hubs | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create Jobs | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage Shipments | ✅ | ✅ | ✅ | 🔶 | ✅ | ❌ | 👁️ |
| View Finance | ✅ | ✅ | 🔶 | ❌ | ❌ | ❌ | ❌ |
| Manage Expenses | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Access Reports | ✅ | ✅ | ✅ | ❌ | 🔶 | ❌ | ❌ |
| System Settings | ✅ | 🔶 | ❌ | ❌ | ❌ | ❌ | ❌ |
| Warehouse/Stock | ✅ | ✅ | ❌ | ❌ | 🔶 | ✅ | ❌ |

✅ Full access | 🔶 Limited access | 👁️ View only | ❌ No access

---

## 6. User Flows

### 6.1 Onboarding Flow

```
Landing / Login
    → Select Company (or Create New Company — 4-step wizard)
        Step 1: Company Basic Info (name, code, logo, business type, status)
        Step 2: Operations Setup (start date, operation hub, countries)
        Step 3: Trade Flow Configuration (import/export config, hub logic)
        Step 4: Review & Create
    → Select Hub (or Add New Hub — 4-step wizard)
        Step 1: Hub Basic Info (name, country, city, hub type)
        Step 2: Operation Settings
        Step 3: Trade Connections (import/export routes, hub links)
        Step 4: Review
    → Main Dashboard
```

### 6.2 Job Creation Flow

```
Job Management → Create New Job
    Section 1: Client Information
        - Select Client/Party (search)
        - Contact person (optional)
        - Auto-generated Job ID

    Section 2: Service Type
        - Shipping Only
        - Purchase + Shipping ← (default, highlighted)
        - Full Service (Coming Soon)

    Section 3: Route Details
        - Origin Hub (selectable)
        - Destination Hub (read-only, auto-filled)

    Section 4: Cargo Details
        - Product description
        - Quantity & Unit
        - Weight

    Section 5: If "Purchase + Shipping" (Conditional)
        - Supplier Name
        - Supplier Invoice upload
        - Vendor Selection
        - Purchase Amount & Currency

    Section 6: Basic Financial
        - Estimated Total Cost
        - Currency (BDT/USD)
        - Notes

    Section 7: Document Upload
        - Packing List
        - Invoice
        - Supporting Documents
        - Drag & drop + upload progress

    → Save as Draft | Create Job
```

### 6.3 Job Detail & Lifecycle

```
Job Created → Processing → In Transit → Delivered → Completed
```

**Job Detail Tabs:**
- **Overview**: Job Info (client, service type, cargo, quantity/weight) + Route Info (origin, destination, ETA) + Status Progress
- **Logistics**: Shipment sub-records linked to this job
- **Finance**: Expenses, invoices, payments
- **Documents**: Uploaded files (packing list, invoice, supporting docs)

**Job Detail Actions:**
- Update Status
- Add Expense
- Upload Document

### 6.4 Shipment Tracking Flow

```
Job → Logistics Tab → Shipments List
    Columns: Shipment ID, Job ID, Client Name, Route, Freight Type (Air/Sea), Tracking Number, Departure Date, ETA, Status, Action

    Filters: Status | Freight Type | Date range | Search

    Quick Summary Panel:
        Total Shipments | In Transit | Delivered | Delayed

    Add Shipment → Shipment Form
```

---

## 7. Feature Requirements

### 7.1 Dashboard

**ROW 1 — KPI Overview:**
- Total Jobs (Active)
- Total Revenue (Monthly)
- Total Expenses (Monthly)
- Cash Balance
- Pending Payments
- Each KPI card shows a % trend indicator (up/down vs previous period)

**ROW 2 — Business Snapshot (70% width):**
- Recent 5 Jobs (table: job ID, date, status badge)
- Recent Transactions (party, type, amount, time ago)
- Latest Shipments (job ID, date, status badge)
- Quick Insights Panel: Alerts (payment / shipment / tax), System notifications, Risk indicators

**ROW 3 — Performance Overview:**
- Monthly Revenue vs Expense (bar chart)
- Job Completion Rate (donut/gauge chart)
- Cash Flow Mini Graph (area chart)

**Header Elements:**
- Company name + Hub Selector dropdown
- Global search (Job ID, Party Name, Invoice, Shipment ID, Ledger Entry)
- Date filter (Today / Month / Year)
- Notifications bell with alert categories (Finance, Shipment, System)
- Live System indicator
- User menu

### 7.2 Job Management

- Job list view: filterable, searchable, sortable
- Create Job: 7-section wizard (see flow above)
- Job detail: 4-tab view (Overview, Logistics, Finance, Documents)
- Status update workflow with confirmation
- Expense addition from job context
- Document upload with file preview and progress

### 7.3 Accounts & Finance

- Transaction log (income and expenses)
- Invoice generation and tracking
- Payment status management
- Cash balance view
- Currency support: BDT, USD (extendable)

### 7.4 Sales & Party

- Party/contact directory (clients and vendors)
- Party profile with trade history
- Contact person management
- Party type tagging (client, vendor, broker, etc.)

### 7.5 Freight & Logistics

- Shipment creation linked to jobs
- Freight type: Air or Sea
- Tracking number assignment
- Departure and ETA management
- Route display: Origin Hub → Destination Hub
- Status tracking: Processing, In Transit, Delivered, Delayed

### 7.6 Warehouse / Stock

- Stock item registry (managed by Stock Manager)
- Inventory tracking per hub
- Stock movements linked to jobs

### 7.7 Documentation

- Centralized document repository
- Document types: Packing List, Invoice, Bill of Lading, Supporting Docs
- Linked to jobs and shipments
- Preview + download functionality

### 7.8 Reports

- Revenue report (by period, client, hub)
- Job completion report
- Shipment performance report
- Expense breakdown report
- Export to PDF/Excel

### 7.9 Settings

- Company settings (edit company profile)
- Hub management
- User management (invite, roles)
- Notification preferences
- Currency settings
- System configuration (role access matrix)

---

## 8. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Dashboard loads in < 2 seconds; API responses < 500ms |
| Scalability | Supports 50 companies, 200 hubs, 10,000 jobs per company |
| Availability | 99.5% uptime SLA |
| Security | RBAC enforced server-side; audit log all mutations |
| Compatibility | Chrome, Firefox, Edge, Safari (latest 2 versions) |
| Responsiveness | Desktop-first; tablet support for viewing |
| Accessibility | WCAG 2.1 AA compliance for core flows |
| Localization | English first; framework supports multi-language |

---

## 9. Open Questions & Decisions

| # | Question | Status |
|---|---|---|
| 1 | Should demo login buttons (role picker) be implemented? | Under review — see UX note in mockup |
| 2 | Full Service job type — what is the scope? | Deferred to v2 |
| 3 | Customer portal — separate app or embedded view? | Deferred to v2 |
| 4 | AI Agent integration — which workflows? | Defined in AI_AGENT_DEV_PLAN.md |
| 5 | Multi-currency accounting — full ledger or simplified? | Simplified for v1 |

---

## 10. Dependencies

- Backend API (see BACKEND_DEV_PLAN.md)
- Frontend implementation (see FRONTEND_DEV_PLAN.md)
- Infrastructure / DevOps (see ARCHITECTURE.md)
- AI features (see AI_AGENT_DEV_PLAN.md)

---

*Document Owner: Product Manager | Review Cycle: Per sprint*
