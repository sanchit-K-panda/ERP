# NEO CRM — PM & Dev Lead Plan

**Version:** 1.0  
**Role:** Product Manager + Development Lead  
**Methodology:** Agile / Scrum (2-week sprints)  

---

## 1. Project Timeline Overview

```
Phase 0 — Setup & Planning          ─── Week 1–2
Phase 1 — Foundation                ─── Week 3–4      (Sprint 1–2)
Phase 2 — Onboarding Flow           ─── Week 5–6      (Sprint 3)
Phase 3 — Dashboard                 ─── Week 7–8      (Sprint 4)
Phase 4 — Job Management            ─── Week 9–12     (Sprint 5–6)
Phase 5 — Logistics & Finance       ─── Week 13–16    (Sprint 7–8)
Phase 6 — Remaining Modules         ─── Week 17–20    (Sprint 9–10)
Phase 7 — Settings + Polish         ─── Week 21–22    (Sprint 11)
Phase 8 — QA, Testing, Hardening    ─── Week 23–24    (Sprint 12)
Phase 9 — Staging → Production      ─── Week 25–26    (Sprint 13)
```

**Total estimated timeline: ~26 weeks (6 months)**

---

## 2. Sprint Plan

### Sprint 0 — Project Setup (Week 1–2)
**Goal:** Everyone can run the project locally. Foundation is in place.

**PM Tasks:**
- [ ] Finalize and lock PRD v1.0
- [ ] Set up Jira/Linear project board with epics and tickets
- [ ] Define Definition of Done (DoD) for all tickets
- [ ] Establish sprint ceremony schedule (standup, planning, review, retro)
- [ ] Align team on rules.md and CONTEXT.md
- [ ] Set up Slack channels: #neocrm-dev, #neocrm-qa, #neocrm-alerts

**Dev Tasks:**
- [ ] GitHub repo setup (monorepo or separate frontend/backend)
- [ ] Frontend: Vite + React + TS + Tailwind + shadcn scaffold
- [ ] Backend: NestJS scaffold + Prisma init + PostgreSQL Docker setup
- [ ] CI pipeline (GitHub Actions): lint + typecheck + test on PR
- [ ] `.env.example` documented for both services
- [ ] README written: local setup in < 5 steps
- [ ] Pre-commit hooks (Husky + lint-staged)

**DoD:** Both services run locally. CI pipeline passes. Team has reviewed rules.md.

---

### Sprint 1–2 — Foundation (Week 3–6)
**Goal:** Authenticated users can log in and have role-based context.

**Frontend:**
- [ ] Login page (email/password form)
- [ ] Demo login role picker (optional, feature-flagged)
- [ ] AuthGuard + RoleGuard hooks
- [ ] AppShell (sidebar + header shell)
- [ ] Sidebar with role-filtered navigation
- [ ] Axios service layer with interceptors
- [ ] Zustand context store (company/hub)
- [ ] 404 and error boundary pages

**Backend:**
- [ ] Auth module (login, JWT, refresh, logout)
- [ ] User module (CRUD)
- [ ] Company entity + basic CRUD
- [ ] Hub entity + basic CRUD
- [ ] Prisma schema: users, companies, hubs, user_company_roles
- [ ] AuthGuard + RolesGuard + CompanyContextGuard
- [ ] Standard response interceptor + error filter
- [ ] Swagger docs setup
- [ ] Health check endpoint

**DoD:** User can log in, see correct sidebar items for their role, and log out. JWT refresh works. API docs accessible.

---

### Sprint 3 — Onboarding Flow (Week 7–8)
**Goal:** User can select/create a company and select/create a hub.

**Frontend:**
- [ ] Company Selector page
- [ ] Create Company Wizard (4 steps with stepper UI)
- [ ] Hub Selector page
- [ ] Create Hub Wizard (4 steps)
- [ ] Hub connections UI (visual hub diagram)
- [ ] Context store updates on company/hub selection

**Backend:**
- [ ] Company setup wizard endpoint (multi-step, save as draft between steps)
- [ ] Hub creation endpoint with type (HQ/Origin/Destination/Transit)
- [ ] Hub connections CRUD
- [ ] Trade flow configuration persistence

**DoD:** Full onboarding flow works end-to-end. Company + hub can be created and selected. Context headers passed correctly.

---

### Sprint 4 — Dashboard (Week 9–10)
**Goal:** Live dashboard showing real KPI data and performance charts.

**Frontend:**
- [ ] KPI Cards row (5 cards with trend indicators)
- [ ] Recent Jobs card
- [ ] Recent Transactions card
- [ ] Latest Shipments card
- [ ] Quick Insights Panel (alerts)
- [ ] Revenue vs Expense bar chart (Recharts)
- [ ] Job Completion gauge
- [ ] Cash Flow area chart
- [ ] Hub Selector dropdown in header
- [ ] Notification bell + dropdown (Finance, Shipment, System tabs)
- [ ] Loading skeletons for all cards

**Backend:**
- [ ] `/dashboard/kpis` endpoint
- [ ] `/dashboard/recent-jobs`
- [ ] `/dashboard/recent-transactions`
- [ ] `/dashboard/latest-shipments`
- [ ] `/dashboard/performance` (chart data)
- [ ] Redis caching (60s TTL) for KPI endpoints

**DoD:** Dashboard loads with real data in < 2 seconds. All 5 KPI cards show correct values. Charts render. Empty states handled.

---

### Sprint 5–6 — Job Management (Week 11–14)
**Goal:** Full job creation and management lifecycle.

**Frontend:**
- [ ] Job List page (table + search + status/date filters + pagination)
- [ ] Create Job Wizard (all 7 sections, single-page)
  - [ ] Section 1: Client Info (party search dropdown)
  - [ ] Section 2: Service Type (3 options, Full Service disabled)
  - [ ] Section 3: Route Details (origin hub + read-only destination)
  - [ ] Section 4: Cargo Details
  - [ ] Section 5: Purchase Info (conditional on service type)
  - [ ] Section 6: Basic Financial
  - [ ] Section 7: Document Upload (drag & drop)
- [ ] Save as Draft functionality
- [ ] Job Detail page (4 tabs)
  - [ ] Overview tab (job info + route + status progress)
  - [ ] Logistics tab (shipments list)
  - [ ] Finance tab (transactions)
  - [ ] Documents tab (uploaded files)
- [ ] Update Status modal + confirmation
- [ ] Add Expense modal

**Backend:**
- [ ] Jobs module (full CRUD + status machine)
- [ ] Job auto-code generation (J-YYYYMMDD-NN)
- [ ] Job status transition validation (cannot skip states)
- [ ] Expense creation linked to job
- [ ] Job search + filter API (status, date range, party, hub)
- [ ] Job pagination (cursor-based or offset)

**DoD:** Job can be created end-to-end. Status transitions work. Job detail shows correct data in all 4 tabs. Draft save/resume works.

---

### Sprint 7–8 — Logistics & Finance (Week 15–18)
**Goal:** Shipments trackable. Finance visible.

**Frontend:**
- [ ] Shipment List page (with Quick Summary panel)
- [ ] Add Shipment modal (freight type, tracking, ETA)
- [ ] Shipment status update
- [ ] Finance page (transaction list)
- [ ] Add Transaction modal (income/expense)
- [ ] Cash Balance display
- [ ] Invoice list (basic)

**Backend:**
- [ ] Shipments module (CRUD + status update)
- [ ] Shipment auto-code (S-NN)
- [ ] Shipment filters (status, freight type, date)
- [ ] Finance/transactions module
- [ ] Cash balance calculation endpoint
- [ ] Invoice basic CRUD

**DoD:** Shipments can be added to jobs and tracked. Transactions recorded. Cash balance reflects real data.

---

### Sprint 9–10 — Remaining Modules (Week 19–22)
**Goal:** All core modules functional.

**Frontend + Backend:**
- [ ] Sales & Party: list, create, detail, search
- [ ] Warehouse / Stock: item registry, movements
- [ ] Documentation: file repository page
- [ ] Reports: 4 report types with date filters

**DoD:** All modules have functional list and create flows. Reports can be filtered and viewed.

---

### Sprint 11 — Settings + Polish (Week 23)
- [ ] Settings pages (company, hubs, users, notifications)
- [ ] User invitation flow (email invite → set password)
- [ ] Global search implementation
- [ ] Empty states for all tables/lists
- [ ] Full loading skeleton coverage
- [ ] Error boundary for all major page sections
- [ ] Toast notification system (success, error, warning)
- [ ] Confirmation dialogs for destructive actions

---

### Sprint 12 — QA & Hardening (Week 24)
- [ ] Unit test coverage ≥ 70% (services + hooks)
- [ ] E2E tests: login, create company, create job, add shipment, upload doc
- [ ] Cross-browser testing (Chrome, Firefox, Edge, Safari)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Lighthouse score ≥ 90 (performance)
- [ ] Security penetration test (basic: auth bypass, IDOR, XSS)
- [ ] Load test: 100 concurrent users, p95 < 500ms
- [ ] All known bugs triaged and resolved

---

### Sprint 13 — Staging → Production (Week 25–26)
- [ ] Staging deployment (full stack)
- [ ] Stakeholder UAT (User Acceptance Testing)
- [ ] UAT feedback incorporated
- [ ] Production infrastructure provisioned (RDS, S3, ECS/VPS)
- [ ] Production deployment
- [ ] Monitoring and alerting configured (Sentry, CloudWatch)
- [ ] Production smoke tests
- [ ] Runbook written (how to rollback, restart, scale)
- [ ] Go-live announcement

---

## 3. PM Checklist (Per Sprint)

### Sprint Planning (Day 1 of sprint)
- [ ] Groom and size tickets with dev team
- [ ] Assign owners for all tickets
- [ ] Confirm dependencies between tickets
- [ ] Update roadmap if scope changed
- [ ] Share sprint goal in #neocrm-dev

### Mid-Sprint Check-in (Day 5)
- [ ] Check velocity vs planned
- [ ] Unblock any stalled tickets
- [ ] Update stakeholders if risk detected

### Sprint Review (Last day)
- [ ] Demo working software to stakeholders
- [ ] Capture feedback as new tickets
- [ ] Update PRD if requirements clarified

### Retrospective (After review)
- [ ] What went well?
- [ ] What needs improvement?
- [ ] Concrete 1–3 action items for next sprint

---

## 4. Definition of Done (DoD)

A ticket is DONE when:
- [ ] Code is written and compiles without errors
- [ ] Feature matches the acceptance criteria in the ticket
- [ ] Unit tests written (if applicable)
- [ ] PR reviewed and approved by at least 1 team member
- [ ] Merged to `develop` branch
- [ ] Deployed to staging and verified
- [ ] No regressions introduced (existing tests still pass)
- [ ] Relevant docs updated (API docs, README if needed)

---

## 5. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Scope creep (new features mid-sprint) | High | High | Strict change control; new requests → backlog |
| Backend API delays blocking frontend | Medium | High | Agree on API contracts first; use mocks in frontend |
| Database schema changes mid-project | Medium | High | Finalize schema in Sprint 1 before feature work |
| Performance issues with large datasets | Low | Medium | Add indexes early; test with realistic data volumes |
| Team availability gaps | Medium | Medium | Cross-train; document all systems clearly |
| AI features complexity underestimated | High | Low | AI is v1.5 — do not let it delay v1 core |

---

## 6. Communication Plan

| Audience | Channel | Frequency | Content |
|---|---|---|---|
| Dev Team | #neocrm-dev (Slack) | Daily standup | Progress, blockers |
| Stakeholders | Email / Meet | Bi-weekly | Sprint demo, roadmap update |
| QA | #neocrm-qa | Per release | Test scope, known issues |
| All | Confluence/Notion | Weekly | Sprint summary, decisions log |

---

## 7. Key Metrics to Track

| Metric | Target | How Measured |
|---|---|---|
| Sprint velocity | Stable or improving | Story points delivered per sprint |
| Bug escape rate | < 5% of tickets | Bugs found in staging vs. total |
| API response time (p95) | < 500ms | CloudWatch / Datadog |
| Frontend build time | < 30s | CI logs |
| Test coverage | ≥ 70% | Jest coverage report |
| Time to create a job (UX) | < 3 minutes | User testing session |

---

*PM Lead: [Assign] | Dev Lead: [Assign] | Board: [Link to Jira/Linear]*
