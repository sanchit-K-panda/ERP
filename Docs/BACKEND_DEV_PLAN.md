# NEO CRM — Backend Development Plan

**Version:** 1.0  
**Role:** Backend Lead / Developer  
**Stack:** Node.js + TypeScript + PostgreSQL  

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 LTS |
| Framework | NestJS (TypeScript) |
| Database | PostgreSQL 15 |
| ORM | Prisma |
| Authentication | JWT (access + refresh) + httpOnly cookies |
| Caching | Redis |
| File Storage | AWS S3 (or MinIO for self-hosted) |
| Background Jobs | Bull (Redis-backed queues) |
| Email | Nodemailer / SendGrid |
| API Docs | Swagger (OpenAPI 3.0) via @nestjs/swagger |
| Testing | Jest + Supertest |
| Validation | class-validator + class-transformer |
| Logging | Winston + structured JSON logs |

---

## 2. Core Architecture — Module Map

```
/src
  /auth               → JWT auth, login, refresh, logout
  /users              → User CRUD, role assignment
  /companies          → Company creation wizard, company context
  /hubs               → Hub creation, hub management, hub connections
  /jobs               → Job lifecycle management (core module)
  /shipments          → Shipment tracking, freight management
  /finance            → Transactions, expenses, invoices, cash balance
  /parties            → Client/vendor contacts
  /documents          → File upload, document metadata, download
  /warehouse          → Stock management, inventory
  /reports            → Report generation (PDF/XLSX)
  /notifications      → Alerts: finance, shipment, system
  /dashboard          → Aggregated KPI data endpoints
  /settings           → System config, role permissions
  /common             → Guards, interceptors, decorators, pipes, filters
  /prisma             → PrismaService, migrations, seeds
```

---

## 3. Database Schema (Core Tables)

### users
```sql
id              UUID PK
email           VARCHAR UNIQUE NOT NULL
password_hash   VARCHAR NOT NULL
full_name       VARCHAR
role            ENUM (BUSINESS_OWNER, BUSINESS_MANAGER, SALES_MANAGER, 
                       SALES_PERSON, PROJECT_MANAGER, STOCK_MANAGER, CUSTOMER)
is_active       BOOLEAN DEFAULT true
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### companies
```sql
id              UUID PK
name            VARCHAR NOT NULL
code            VARCHAR UNIQUE
logo_url        VARCHAR
business_type   ENUM (CARGO, TRADING, LOGISTICS, MANUFACTURING)
operation_start DATE
status          ENUM (ACTIVE, DRAFT)
main_hub_id     UUID FK → hubs.id
created_by      UUID FK → users.id
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### user_company_roles
```sql
id              UUID PK
user_id         UUID FK → users.id
company_id      UUID FK → companies.id
role            ENUM (see above)
UNIQUE(user_id, company_id)
```

### hubs
```sql
id              UUID PK
company_id      UUID FK → companies.id
name            VARCHAR NOT NULL
country         VARCHAR
city            VARCHAR
hub_code        VARCHAR
hub_type        ENUM (HQ, ORIGIN, DESTINATION, TRANSIT)
is_import_hub   BOOLEAN DEFAULT false
is_export_hub   BOOLEAN DEFAULT false
is_enabled      BOOLEAN DEFAULT true
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### hub_connections
```sql
id              UUID PK
company_id      UUID FK
from_hub_id     UUID FK → hubs.id
to_hub_id       UUID FK → hubs.id
route_name      VARCHAR
is_active       BOOLEAN
```

### jobs
```sql
id              UUID PK
job_code        VARCHAR UNIQUE (auto: J-YYYYMMDD-NN)
company_id      UUID FK → companies.id
hub_id          UUID FK → hubs.id (operating hub)
party_id        UUID FK → parties.id
contact_person  VARCHAR
service_type    ENUM (SHIPPING_ONLY, PURCHASE_SHIPPING, FULL_SERVICE)
status          ENUM (CREATED, PROCESSING, IN_TRANSIT, DELIVERED, COMPLETED, CANCELLED)
origin_hub_id   UUID FK → hubs.id
destination_hub_id UUID FK → hubs.id
cargo_description TEXT
quantity        DECIMAL
unit            ENUM (kg, ton, pcs)
weight          DECIMAL
estimated_cost  DECIMAL
currency        VARCHAR(3) DEFAULT 'USD'
notes           TEXT
supplier_name   VARCHAR
purchase_amount DECIMAL
created_by      UUID FK → users.id
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### shipments
```sql
id              UUID PK
shipment_code   VARCHAR UNIQUE (auto: S-NN)
job_id          UUID FK → jobs.id
company_id      UUID FK → companies.id
client_name     VARCHAR (denormalized for display)
origin_hub_id   UUID FK → hubs.id
destination_hub_id UUID FK → hubs.id
freight_type    ENUM (AIR, SEA)
tracking_number VARCHAR
departure_date  DATE
eta             DATE
status          ENUM (PROCESSING, IN_TRANSIT, DELIVERED, DELAYED)
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### parties
```sql
id              UUID PK
company_id      UUID FK → companies.id
name            VARCHAR NOT NULL
type            ENUM (CLIENT, VENDOR, BROKER, AGENT)
email           VARCHAR
phone           VARCHAR
country         VARCHAR
address         TEXT
created_at      TIMESTAMP
```

### transactions
```sql
id              UUID PK
company_id      UUID FK → companies.id
job_id          UUID FK → jobs.id (nullable)
party_id        UUID FK → parties.id (nullable)
type            ENUM (INCOME, EXPENSE)
category        VARCHAR
amount          DECIMAL NOT NULL
currency        VARCHAR(3)
description     TEXT
transaction_date DATE
created_by      UUID FK → users.id
created_at      TIMESTAMP
```

### documents
```sql
id              UUID PK
company_id      UUID FK → companies.id
job_id          UUID FK → jobs.id (nullable)
shipment_id     UUID FK → shipments.id (nullable)
file_name       VARCHAR
file_type       VARCHAR
doc_type        ENUM (PACKING_LIST, INVOICE, BILL_OF_LADING, SUPPORTING)
storage_key     VARCHAR (S3 key)
file_size       INTEGER
uploaded_by     UUID FK → users.id
created_at      TIMESTAMP
```

### audit_logs
```sql
id              UUID PK
company_id      UUID FK
user_id         UUID FK → users.id
entity          VARCHAR (jobs, shipments, transactions, etc.)
entity_id       UUID
action          ENUM (CREATE, UPDATE, DELETE, STATUS_CHANGE)
old_values      JSONB
new_values      JSONB
ip_address      VARCHAR
created_at      TIMESTAMP
```

---

## 4. API Endpoints

### Auth
```
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
GET    /api/v1/auth/me
```

### Companies
```
GET    /api/v1/companies                  → list user's companies
POST   /api/v1/companies                  → create company (wizard step 4)
GET    /api/v1/companies/:id
PUT    /api/v1/companies/:id
POST   /api/v1/companies/:id/activate
```

### Hubs
```
GET    /api/v1/hubs                       → list hubs for active company
POST   /api/v1/hubs                       → create hub
GET    /api/v1/hubs/:id
PUT    /api/v1/hubs/:id
DELETE /api/v1/hubs/:id
GET    /api/v1/hubs/:id/connections
POST   /api/v1/hubs/connections           → create hub connection
```

### Jobs
```
GET    /api/v1/jobs                       → list (paginated, filtered)
POST   /api/v1/jobs                       → create job
GET    /api/v1/jobs/:id
PUT    /api/v1/jobs/:id
POST   /api/v1/jobs/:id/status            → update status
GET    /api/v1/jobs/:id/shipments         → job's shipments
GET    /api/v1/jobs/:id/transactions      → job's finance
GET    /api/v1/jobs/:id/documents         → job's documents
POST   /api/v1/jobs/:id/expenses          → add expense to job
```

### Shipments
```
GET    /api/v1/shipments                  → list (filtered by status, type, date)
POST   /api/v1/shipments                  → create shipment
GET    /api/v1/shipments/:id
PUT    /api/v1/shipments/:id
POST   /api/v1/shipments/:id/status       → update status
GET    /api/v1/shipments/summary          → quick summary counts
```

### Finance
```
GET    /api/v1/finance/transactions
POST   /api/v1/finance/transactions
GET    /api/v1/finance/summary            → cash balance, revenue, expenses
GET    /api/v1/finance/invoices
POST   /api/v1/finance/invoices
```

### Parties
```
GET    /api/v1/parties
POST   /api/v1/parties
GET    /api/v1/parties/:id
PUT    /api/v1/parties/:id
GET    /api/v1/parties/search?q=          → for job form party search
```

### Dashboard
```
GET    /api/v1/dashboard/kpis             → total jobs, revenue, expenses, cash, pending
GET    /api/v1/dashboard/recent-jobs      → last 5 jobs
GET    /api/v1/dashboard/recent-transactions
GET    /api/v1/dashboard/latest-shipments
GET    /api/v1/dashboard/performance      → monthly revenue/expense chart data
```

### Documents
```
POST   /api/v1/documents/upload           → multipart upload
GET    /api/v1/documents/:id/download     → presigned S3 URL
DELETE /api/v1/documents/:id
```

### Reports
```
GET    /api/v1/reports/revenue
GET    /api/v1/reports/jobs
GET    /api/v1/reports/shipments
GET    /api/v1/reports/expenses
POST   /api/v1/reports/export             → generate PDF/XLSX
```

---

## 5. Guards & Middleware

### AuthGuard
- Validates JWT from httpOnly cookie
- Attaches `req.user` to request

### RolesGuard
- Checks `req.user.role` against `@Roles(...)` decorator
- Returns 403 if insufficient role

### CompanyContextGuard
- Validates `X-Company-ID` header exists and user belongs to that company
- Injects `req.company` into request context

### HubContextGuard
- Validates `X-Hub-ID` header (optional — not all routes require hub scope)

### AuditInterceptor
- Runs after successful write operations (POST/PUT/DELETE)
- Writes to `audit_logs` table asynchronously via Bull queue

---

## 6. Job ID Generation Logic

```typescript
// Format: J-YYYYMMDD-NN (sequential per day per company)
async generateJobCode(companyId: string): Promise<string> {
  const today = format(new Date(), 'yyyyMMdd');
  const count = await this.prisma.job.count({
    where: {
      companyId,
      createdAt: { gte: startOfDay(new Date()) }
    }
  });
  return `J-${today}-${String(count + 1).padStart(2, '0')}`;
}
```

---

## 7. Development Phases

### Phase 1 — Foundation (Sprint 1–2)
- [ ] NestJS project scaffold + TypeScript config
- [ ] Prisma setup + PostgreSQL connection
- [ ] Auth module (login, JWT, refresh, logout, guards)
- [ ] User module
- [ ] Common utilities (response interceptor, error filter, logger)
- [ ] Swagger setup

### Phase 2 — Onboarding (Sprint 3)
- [ ] Companies module (CRUD + wizard support)
- [ ] Hubs module (CRUD + connections)

### Phase 3 — Core Business (Sprint 4–6)
- [ ] Jobs module (full CRUD + status machine)
- [ ] Parties module
- [ ] Shipments module
- [ ] Documents module (S3 upload)

### Phase 4 — Finance & Dashboard (Sprint 7–8)
- [ ] Finance/transactions module
- [ ] Dashboard aggregation endpoints
- [ ] Notifications module

### Phase 5 — Reports & Settings (Sprint 9–10)
- [ ] Reports module (PDF/XLSX generation)
- [ ] Warehouse module
- [ ] Settings API

### Phase 6 — QA (Sprint 11–12)
- [ ] Unit tests (services)
- [ ] Integration tests (API endpoints)
- [ ] Performance testing
- [ ] Security audit

---

*Backend Lead: [Assign] | DB migrations tracked in /prisma/migrations*
