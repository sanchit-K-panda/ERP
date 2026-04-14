# NEO CRM — Development Rules & Conventions

> These rules are **non-negotiable** across all roles (PM, Frontend, Backend, AI Agent).  
> Every contributor must read, acknowledge, and follow this file before writing a single line of code.

---

## 1. General Principles

- **Clarity over cleverness.** Write code that a mid-level developer can understand without explanation.
- **Single Responsibility.** Every function, component, and service does one thing.
- **No silent failures.** Every error must be logged, surfaced, or handled — never swallowed.
- **Data integrity first.** Never mutate data without validation. Never trust client input on the server.
- **Feature flags for incomplete work.** Anything "Coming Soon" must be guarded behind a feature flag — never shipped half-built.

---

## 2. Project Structure Rules

```
/src
  /modules          → Feature-based modules (jobs, shipments, finance, etc.)
  /core             → Shared utilities, auth, guards, interceptors
  /components       → Reusable UI components (atoms, molecules)
  /layouts          → Page shells and nav wrappers
  /services         → API service layer
  /store            → State management (per module)
  /types            → Shared TypeScript interfaces and enums
  /constants        → App-wide constants, enums, route keys
  /hooks            → Custom React hooks
  /utils            → Pure utility functions (no side effects)
```

- No business logic inside UI components.
- No API calls directly in components — use service layer.
- No hardcoded strings — use constants or i18n keys.

---

## 3. Naming Conventions

| Context | Convention | Example |
|---|---|---|
| Components | PascalCase | `JobCard.tsx` |
| Hooks | camelCase with `use` prefix | `useJobList.ts` |
| Services | camelCase with `Service` suffix | `jobService.ts` |
| Constants | SCREAMING_SNAKE_CASE | `JOB_STATUS_LABELS` |
| Types/Interfaces | PascalCase with `I` prefix for interfaces | `IJob`, `JobStatus` |
| CSS classes | kebab-case | `job-card__header` |
| API routes | kebab-case, versioned | `/api/v1/jobs` |
| Database tables | snake_case | `job_shipments` |

---

## 4. Role & Permission Rules

- Roles are hierarchical: `BUSINESS_OWNER > BUSINESS_MANAGER > SALES_MANAGER > SALES_PERSON > PROJECT_MANAGER > STOCK_MANAGER > CUSTOMER`
- **Business Owner** has full system access across all companies and hubs.
- Every protected route/action must be guarded with a `RoleGuard`.
- UI elements the user cannot access must be **hidden**, not just disabled.
- Never expose role-restricted data in API responses — enforce at query level.
- Permission checks must happen **both on the frontend (UX) and backend (security)**.

---

## 5. Multi-Tenancy Rules

- Every database record that belongs to a company **must** have a `company_id` foreign key.
- Every query at the service layer **must** include `company_id` filter — no global queries by default.
- Hub-scoped data must additionally filter by `hub_id`.
- Switching company or hub must reset all cached/scoped state.
- No cross-company data leakage is acceptable — test this explicitly.

---

## 6. API Design Rules

- RESTful conventions. Resource names are plural nouns: `/jobs`, `/shipments`, `/hubs`.
- All responses follow the standard envelope:
  ```json
  {
    "success": true,
    "data": {},
    "message": "Operation successful",
    "errors": []
  }
  ```
- Paginated lists must include `meta: { page, limit, total, totalPages }`.
- HTTP status codes must be semantically correct (200, 201, 400, 401, 403, 404, 422, 500).
- All write operations require CSRF protection and authentication.
- API versioning is mandatory: `/api/v1/...`

---

## 7. State Management Rules

- Use module-scoped stores — no single god store.
- Server state (API data) → React Query / TanStack Query.
- UI state (modals, tabs, selections) → Local component state or Zustand.
- Never store sensitive data (tokens, PII) in localStorage — use httpOnly cookies.
- Optimistic updates are allowed but must have rollback on failure.

---

## 8. Code Quality Gates

- **TypeScript strict mode** is ON. No `any` types without explicit justification in a comment.
- **ESLint + Prettier** must pass before every commit (enforced via pre-commit hook).
- **Unit test coverage** minimum: 70% for services and utils.
- **E2E tests** required for all critical flows: login, create job, create shipment, invoice generation.
- No `console.log` in production code — use the logger utility.
- PRs require at least **1 reviewer approval** before merge.
- No direct commits to `main` or `develop` — feature branches only.

---

## 9. Git Workflow Rules

```
main          → Production only. Tagged releases.
develop       → Integration branch. All features merge here first.
feature/*     → New features (e.g., feature/job-management)
fix/*         → Bug fixes (e.g., fix/shipment-status-badge)
hotfix/*      → Critical prod fixes only
```

**Commit message format (Conventional Commits):**
```
type(scope): short description

feat(jobs): add create job wizard with 7 sections
fix(auth): resolve token expiry loop on dashboard
chore(deps): upgrade react-query to v5
```

---

## 10. UI/UX Rules

- Every form must have loading, success, and error states.
- Empty states must have a descriptive message and a clear CTA.
- All tables must support search, filter, and pagination.
- Status badges must use consistent color coding across the app:
  - `Active / Success / Delivered` → Green
  - `In Transit / Processing` → Blue
  - `Warning / Pending` → Yellow/Orange
  - `Error / Delayed / Cancelled` → Red
  - `Draft` → Gray
- Modals for destructive actions must require explicit confirmation.
- All monetary values display with currency symbol and two decimal places.
- Dates display in `DD-MMM-YYYY` format consistently.

---

## 11. Security Rules

- All user inputs must be sanitized server-side.
- SQL injection protection via parameterized queries / ORM only.
- JWT tokens expire in 1 hour; refresh tokens in 7 days.
- File uploads: validate MIME type server-side, limit to 10MB, store in object storage (not local disk).
- Audit log every create/update/delete action with `user_id`, `timestamp`, `entity`, `action`.
- Never log passwords, tokens, or sensitive PII.

---

## 12. Documentation Rules

- Every API endpoint must have a JSDoc comment with description, params, and return type.
- Every complex business rule must have an inline comment explaining WHY, not just WHAT.
- All environment variables must be documented in `.env.example`.
- The README must be kept current — if you change setup steps, update the README in the same PR.

---

*Last updated: 2025 | Owner: Product & Engineering Lead*
