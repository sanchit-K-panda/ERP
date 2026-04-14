# NEO CRM — System Architecture

**Version:** 1.0  
**Role:** Solutions Architect / DevOps  

---

## 1. Architecture Overview

NEO CRM follows a **layered, modular monolith** architecture for v1, designed to be decomposed into microservices in v2 if needed. The system is multi-tenant (company-scoped) and hub-aware.

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│        React SPA (Vite) — served via CDN / Nginx            │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS
┌──────────────────────────────▼──────────────────────────────┐
│                       API GATEWAY                           │
│           Nginx (reverse proxy + rate limiting)             │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    APPLICATION LAYER                        │
│              NestJS REST API (Node.js 20)                   │
│   Auth │ Companies │ Hubs │ Jobs │ Shipments │ Finance...   │
└────────────┬───────────────────────────────┬────────────────┘
             │                               │
┌────────────▼──────────┐      ┌─────────────▼───────────────┐
│    PRIMARY DATABASE   │      │        CACHE / QUEUES        │
│   PostgreSQL 15       │      │   Redis (cache + Bull MQ)    │
│   (main data store)   │      │   (job queues, sessions)     │
└───────────────────────┘      └─────────────────────────────┘
             │
┌────────────▼──────────┐
│    OBJECT STORAGE     │
│   AWS S3 / MinIO      │
│   (documents, files)  │
└───────────────────────┘
```

---

## 2. Infrastructure Components

### 2.1 Frontend (React SPA)
- Built with Vite, output as static files
- Deployed to **AWS S3 + CloudFront** (or Nginx on VPS)
- Environment-specific builds (dev / staging / prod)
- Cache: long-lived for hashed assets; no-cache for `index.html`

### 2.2 Backend API (NestJS)
- Runs on Node.js 20 LTS
- Containerized via **Docker**
- Deployed on **AWS ECS (Fargate)** or VPS with PM2
- Horizontal scaling behind a load balancer
- Health check endpoint: `GET /api/v1/health`

### 2.3 Database (PostgreSQL 15)
- Managed on **AWS RDS** (prod) or self-hosted with Docker (dev/staging)
- Connection pooling via **PgBouncer** in prod
- Read replica for reports module (optional, v2)
- Automated daily backups with 30-day retention
- Migrations managed via Prisma Migrate

### 2.4 Cache (Redis)
- **Session caching**: active company/hub context per user session
- **API response caching**: dashboard KPIs (TTL: 60s), report data (TTL: 5min)
- **Bull MQ**: background job queues (audit logs, email notifications, report generation)
- Hosted: **AWS ElastiCache** (prod) or Redis Docker (dev)

### 2.5 File Storage (AWS S3)
- All uploaded documents stored in S3 with company-scoped key prefix: `/{company_id}/{job_id}/{filename}`
- Access: presigned URLs (15-minute expiry) — never public URLs
- File validation: MIME type + size limit enforced at API level before S3 upload

### 2.6 Nginx (API Gateway)
- Reverse proxy to backend API
- Rate limiting: 100 req/min per IP for public routes; 1000 req/min for authenticated
- SSL termination (Let's Encrypt or ACM)
- Static file serving for frontend

---

## 3. Multi-Tenancy Architecture

```
User → [Auth] → Company Selection → Hub Selection → Scoped Operations
```

- **Tenant isolation**: Row-level, using `company_id` on all tables
- **No separate schemas or databases per tenant** (v1 shared schema)
- Every API request carries `X-Company-ID` header (validated by CompanyContextGuard)
- Hub scope carried via `X-Hub-ID` header (optional, per-route)
- Redis cache keys are namespaced: `company:{id}:dashboard:kpis`

---

## 4. Authentication & Session Flow

```
POST /auth/login
  → Validate credentials
  → Issue: access_token (JWT, 1hr, httpOnly cookie)
           refresh_token (JWT, 7 days, httpOnly cookie)
  → Return: user profile + available companies

Token Refresh:
  → Client detects 401 on any request
  → POST /auth/refresh (sends refresh cookie automatically)
  → Backend issues new access_token
  → Client retries original request

Logout:
  → POST /auth/logout
  → Backend clears both cookies + blacklists refresh token in Redis
```

---

## 5. Request Flow (Standard API Call)

```
Client (React)
  → Axios (attach X-Company-ID, X-Hub-ID headers)
  → Nginx (rate limit + proxy)
  → NestJS API
      → AuthGuard (validate JWT cookie)
      → CompanyContextGuard (validate X-Company-ID ownership)
      → RolesGuard (validate role from @Roles decorator)
      → Controller
      → Service (business logic)
      → Prisma (query with company_id filter)
      → PostgreSQL
  → AuditInterceptor (async → Bull queue → audit_logs)
  → Response envelope { success, data, message }
  → Client
```

---

## 6. Background Job Queues (Bull MQ)

| Queue | Trigger | Worker |
|---|---|---|
| `audit-log` | Any write operation | Write to audit_logs table |
| `email-notification` | Job status change, invoice due | Send via SendGrid |
| `report-generation` | POST /reports/export | Generate PDF/XLSX, upload to S3, notify user |
| `document-cleanup` | Document deletion | Remove S3 object |

---

## 7. Deployment Environments

| Environment | URL | Database | Purpose |
|---|---|---|---|
| Development | localhost:3000 | Docker PostgreSQL | Local dev |
| Staging | staging.neocrm.app | RDS (small) | QA & testing |
| Production | app.neocrm.app | RDS (prod) | Live |

---

## 8. CI/CD Pipeline

```
Push to feature/* branch
  → GitHub Actions trigger
  → Run linting + type check
  → Run unit tests
  → Build Docker image

PR to develop
  → All above + integration tests
  → Deploy to Staging

Merge to main (tagged release)
  → All above
  → Build production Docker image
  → Push to ECR
  → Deploy to ECS (rolling update)
  → Run smoke tests
  → Notify team on Slack
```

---

## 9. Monitoring & Observability

| Tool | Purpose |
|---|---|
| **Sentry** | Frontend + Backend error tracking |
| **Winston** | Structured JSON logging (shipped to CloudWatch) |
| **AWS CloudWatch** | Infrastructure metrics, API latency alarms |
| **Prisma metrics** | Query performance monitoring |
| **Uptime Robot** | External uptime monitoring (1-min checks) |

**Alerts triggered for:**
- API error rate > 1% (5-min window)
- p95 response time > 2s
- Database connection pool > 80% utilization
- Failed background jobs (Bull dead letter queue)

---

## 10. Security Architecture

- **HTTPS only** — HTTP redirected to HTTPS
- **httpOnly cookies** — tokens never accessible via JS
- **CORS**: whitelist of allowed origins only
- **Helmet.js**: HTTP security headers
- **Rate limiting**: IP-based via Nginx + application-level via `@nestjs/throttler`
- **Input sanitization**: class-validator DTOs on every endpoint
- **SQL injection**: impossible via Prisma ORM (parameterized queries)
- **File upload**: MIME type validated server-side + S3 virus scan (v2)
- **Secrets**: stored in AWS Secrets Manager (prod) / `.env` (dev only)
- **Dependency scanning**: Dependabot + monthly manual audit

---

*Architecture Owner: Tech Lead | Review: Quarterly or on major infra changes*
