# NEO CRM — Project Context

> Read this first. Before touching any code, spec, or plan — read this document.  
> This is the single source of truth for understanding **what we're building and why**.

---

## 1. What Is NEO CRM?

NEO CRM is a **trade and import/export logistics management platform** built for companies that manage cargo movement between countries — primarily focused on import operations (e.g., sourcing goods from Pakistan/China for delivery to Bangladesh).

It is **not** a generic CRM. It is domain-specific to:
- Cargo and freight businesses
- Import/export trading companies
- Logistics operators managing multi-origin, multi-destination shipments

Think of it as the operational backbone for a trade business — replacing WhatsApp threads, Excel sheets, and disconnected tools with a unified, role-aware, multi-company platform.

---

## 2. The Problem We're Solving

A typical import/logistics business today:
- Creates job orders via phone/email with no system record
- Tracks shipments in Excel spreadsheets shared over WhatsApp
- Has no clear view of which jobs are paid, outstanding, or overdue
- Cannot give clients real-time status updates on their shipments
- Cannot distinguish what their managers vs. sales staff should see or do
- Loses documents (packing lists, invoices, BOLs) across email inboxes
- Has no idea of actual profitability per job or per client

NEO CRM solves all of the above.

---

## 3. The Domain Model (Mental Map)

```
COMPANY
  └── HUB(s)                          ← Geographic operation node
        └── JOB(s)                    ← A single trade/shipment order
              ├── CLIENT (Party)      ← Who ordered the goods
              ├── SUPPLIER            ← Who is selling the goods (vendor)
              ├── SHIPMENT(s)         ← Physical movement of cargo
              ├── DOCUMENT(s)         ← Packing list, invoice, BOL
              └── TRANSACTION(s)      ← Money in/out related to the job
```

### Key Domain Terms

| Term | Meaning |
|---|---|
| **Company** | A business entity using the platform (e.g., "Simon Cargo Service", "Alpha Exim bd") |
| **Hub** | An operational node — a city/country location where the company operates (e.g., Bangladesh HQ, Pakistan Origin Hub) |
| **Job** | A trade order — the central unit of work. One client, one cargo, one route. |
| **Service Type** | What service the company provides for this job: Shipping Only / Purchase + Shipping / Full Service |
| **Party** | Any external entity — client (importer), vendor/supplier (exporter), agent, broker |
| **Shipment** | The physical movement of goods, linked to a job. Has freight type (Air/Sea), tracking number, ETA |
| **Hub Logic** | How goods flow: Import Countries → Origin Hub → Main Hub → Export Countries |
| **Job Status** | Created → Processing → In Transit → Delivered → Completed |

---

## 4. Real-World Usage Scenario

> **Simon Cargo Service** operates from Bangladesh (main HQ). They help businesses in Bangladesh import goods from Pakistan and China.

**Typical workflow:**
1. Client "Acme Global Trade" contacts Simon Cargo to import electronics from Pakistan.
2. A **Job** is created: client = Acme Global Trade, service = Purchase + Shipping, origin = Pakistan Hub, destination = Dhaka HQ.
3. The team sources a supplier in Pakistan, records supplier name and purchase amount.
4. Cargo is shipped (Air or Sea). A **Shipment** is created with a tracking number and departure date.
5. Status updates flow: Processing → In Transit → Delivered.
6. Documents are uploaded (packing list, invoice, customs).
7. Expenses and income are recorded — the job's financial picture is tracked.
8. Job is marked Completed. Report shows profitability.

---

## 5. Design Decisions & Rationale

### Why Multi-Company?
A business owner may operate multiple entities (e.g., one for local trade, one for international). The platform supports switching between companies without logging out.

### Why Hubs?
Logistics businesses don't think in terms of individual offices — they think in routes. A "Hub" represents an operational presence in a location. The hub concept allows route modeling (Pakistan Origin → Bangladesh HQ) and scales to multi-origin operations.

### Why Role-Based Access?
A Sales Person needs to create jobs but should never see financial data. A Stock Manager needs warehouse access but not client financial details. Role-based access is not a nice-to-have — it is operationally critical.

### Why "Purchase + Shipping" vs "Shipping Only"?
Some clients just need logistics (their own supplier, they just want cargo moved = "Shipping Only"). Others need the company to also source the goods ("Purchase + Shipping"). This distinction drives what sections appear in the job form and what costs are tracked.

### Why is "Full Service" Coming Soon?
Full Service (end-to-end including customs clearance, duties, etc.) requires deeper regulatory integration. Deferred to v2 to avoid scope creep.

### Why not a generic SaaS?
The system is purpose-built for this domain. Generic tools (Odoo, Zoho, Salesforce) don't understand the hub-based logistics model, trade flow configuration, or freight tracking at this level of specificity.

---

## 6. Known Constraints

- v1 targets **desktop web** — mobile is a v2 priority.
- Multi-language support is **planned but not v1** — English only for launch.
- The **Customer role** is partially implemented — customer portal is v2.
- **Full Service** job type is stubbed in UI but non-functional.
- AI Agent features are separate — see `AI_AGENT_DEV_PLAN.md`.

---

## 7. Team & Responsibilities

| Role | Responsibility |
|---|---|
| Product Manager | PRD, roadmap, sprint planning, stakeholder alignment |
| Frontend Lead | React app, UI components, client-side logic |
| Backend Lead | NestJS API, database, auth, business logic |
| DevOps | CI/CD, infrastructure, deployment, monitoring |
| AI/ML Engineer | AI Agent features (separate plan) |
| QA | Testing strategy, E2E tests, acceptance criteria |

---

## 8. Key Files Reference

| File | Purpose |
|---|---|
| `PRD.md` | Full product requirements — features, flows, acceptance criteria |
| `rules.md` | Non-negotiable coding, naming, and process rules |
| `ARCHITECTURE.md` | System design, infrastructure, deployment |
| `FRONTEND_DEV_PLAN.md` | Frontend tech stack, structure, phases |
| `BACKEND_DEV_PLAN.md` | Backend API, DB schema, endpoints, phases |
| `HLD.md` | High-Level Design — system and data flow diagrams |
| `AI_AGENT_DEV_PLAN.md` | AI features and agent integration plan |
| `PM_DEV_LEAD_PLAN.md` | Sprint plan, milestones, PM checklist |

---

## 9. What "Done" Looks Like (v1)

A v1 release is complete when:
- [ ] Business Owner can create a company + hub and onboard the system in < 10 minutes
- [ ] A sales person can create a job with all 7 sections and submit it
- [ ] The team can track a shipment from creation to delivery
- [ ] The dashboard shows real KPIs updated from actual data
- [ ] Documents can be uploaded, previewed, and downloaded
- [ ] Role-based access is enforced — no unauthorized access possible
- [ ] The system handles 100 concurrent users without degradation
- [ ] Zero critical bugs in production for 2 weeks post-launch

---

*Context Owner: Product Manager | Keep this document current as the product evolves.*
