# NEO CRM - Copilot Working Context

Version: 1.0  
Updated: 2026-04-13

## 1) Purpose

This file is the condensed operating context for future implementation prompts.
Use this as the default baseline unless a prompt explicitly overrides it.

## 2) Product Identity

- Product: NEO CRM
- Domain: import/export trade and logistics operations
- Core model: Company -> Hub -> Job -> Shipment/Document/Transaction
- Platform type: domain-specific operations CRM (not a generic CRM)

## 3) Source of Truth Priority

If two documents conflict, resolve in this order:

1. `Docs/CONTEXT.md` (business intent and domain meaning)
2. `Docs/PRD.md` (functional requirements and scope)
3. `Docs/rules.md` (engineering non-negotiables)
4. `Docs/ARCHITECTURE.md` and `Docs/HLD.md` (system/data flow)
5. `Docs/FRONTEND_DEV_PLAN.md` and `Docs/BACKEND_DEV_PLAN.md` (implementation details)
6. `Docs/PM_DEV_LEAD_PLAN.md` (timeline/process)
7. `Docs/AI_AGENT_DEV_PLAN.md` (v1.5/v2, not blocking v1)

## 4) Default Role for Future Prompts

Treat all build tasks as if assigned to:

- Full-stack developer
- Software engineer

Execution style:

- Implement end-to-end when feasible
- Keep scope aligned to v1 unless asked otherwise
- Enforce code quality and security constraints from rules.md

## 5) Core Technical Baseline

- Frontend: React 18 + TypeScript (strict) + Tailwind + shadcn/ui
- Backend: NestJS + Prisma + PostgreSQL 15
- Infra dependencies: Redis (cache/queues), S3 (documents), Nginx (gateway)
- Auth: JWT access/refresh in httpOnly cookies

## 6) Non-Negotiable Constraints

- Multi-tenancy: every company-owned query must filter by `company_id`
- Hub scoping: apply `hub_id` where route/module requires it
- RBAC: enforce on backend and reflect in frontend visibility
- API versioning: `/api/v1/...`
- Response contract: standard envelope with success/data/message/errors
- No direct business logic in UI components
- No direct API calls from UI components (use service layer)

## 7) v1 Scope Guardrails

In scope:

- Company and hub onboarding
- Dashboard
- Jobs and shipments lifecycle
- Finance basics
- Parties
- Documents
- Reports
- Settings

Out of scope for v1 (unless explicitly requested):

- Full Service job implementation
- Customer portal
- Mobile app
- Advanced accounting suite
- ERP integrations
- Full AI assistant rollout

## 8) Domain Rules to Preserve

- Job statuses: CREATED -> PROCESSING -> IN_TRANSIT -> DELIVERED -> COMPLETED
- Shipment statuses: PROCESSING -> IN_TRANSIT -> DELIVERED / DELAYED
- Service types: SHIPPING_ONLY, PURCHASE_SHIPPING, FULL_SERVICE
- Create Job section 5 is conditional on PURCHASE_SHIPPING

## 9) Ambiguity Handling Defaults

When docs vary slightly, default to:

- Security and data boundaries over UX convenience
- PRD feature intent over timeline/task wording
- stricter role visibility in case of matrix mismatch

## 10) Task Completion Standard

For implementation prompts, consider work complete only when:

- Code changes are applied in the correct module/layer
- Relevant validation/tests/checks are run when available
- Scope is confirmed against v1 boundaries
- Outcome and next steps are summarized clearly
