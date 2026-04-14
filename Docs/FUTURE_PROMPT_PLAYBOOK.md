# NEO CRM - Future Prompt Playbook (Frontend Mode)

Use these templates to get consistent, high-quality frontend execution in future chats.

Current working mode: frontend only.
Do not implement backend, database, or migration changes unless explicitly requested.

## 1) Session Bootstrap Prompt

Paste at the start of a new conversation:

I am building NEO CRM. Use Docs/CONTEXT.md, Docs/PRD.md, Docs/rules.md, Docs/ARCHITECTURE.md, Docs/HLD.md, Docs/FRONTEND_DEV_PLAN.md, Docs/PM_DEV_LEAD_PLAN.md, and Docs/COPILOT_WORKING_CONTEXT.md as source of truth. Act as a frontend developer/software engineer. Work only in frontend code. Keep scope in v1 unless I explicitly ask for v2. If backend work is required, document API assumptions and proceed with frontend-safe mocks/adapters.

## 2) Frontend Feature Implementation Prompt (End-to-End)

Implement this frontend feature end-to-end in NEO CRM:

- Feature name: [name]
- User role(s): [roles]
- Screen/page(s): [list]
- Route(s): [list]
- Components to add/update: [list]
- Data source/API endpoint(s): [list]
- Acceptance criteria:
  1. [criterion]
  2. [criterion]
  3. [criterion]
- Loading/empty/error states: [required behavior]
- Accessibility requirements: [requirements]
- Out of scope: [items]

Also run relevant frontend checks and report what passed/failed.

## 3) Frontend API Integration Prompt

Implement frontend integration for these existing APIs:

- Screen/page: [name]
- Endpoint(s): [route list]
- Request params/query: [details]
- Response shape assumptions: [details]
- Error states to handle: [details]
- Caching/invalidation behavior: [details]
- Role-based visibility rules: [rules]

Return:

1. Updated files
2. API assumptions and fallbacks used
3. Test/check output summary

## 4) UI Component Prompt

Build or update this reusable frontend component in NEO CRM:

- Component name: [name]
- Location/module: [module]
- Props contract: [details]
- Visual states: default/loading/empty/error/disabled
- Accessibility behavior: keyboard/focus/aria requirements
- Usage examples needed in pages: [list]

Keep component logic focused and avoid embedding module business rules.

## 5) Frontend Bug Fix Prompt

Fix this frontend bug in NEO CRM:

- Problem: [description]
- Expected behavior: [description]
- Actual behavior: [description]
- Repro steps:
  1. [step]
  2. [step]
  3. [step]
- Suspected screen/module/file: [optional]

Include root cause, patch, and verification steps.

## 6) Frontend Code Review Prompt

Review these frontend changes with a production-risk focus:

- Scope: [files/module/PR]
- Priorities: role-based visibility, tenant context headers usage, state management regressions, form validation, API error handling, rendering/performance

Return findings ordered by severity, then open questions, then brief summary.

## 7) Frontend Sprint Planning Prompt

Create a frontend implementation plan for this scope in NEO CRM:

- Sprint number or date window: [value]
- Goal: [goal]
- Scope: [features]
- Dependencies on backend/design: [items]
- Risks: [items]

Return:

1. Ticket breakdown
2. Suggested sequence
3. Risk mitigations
4. Definition of done checks

## 8) Frontend API Contract Alignment Prompt

Design or update frontend-consumed API contracts for:

- Resource/module: [name]
- Operations: [list]
- Filters/pagination: [details]
- Role constraints: [details]
- Tenant context required: X-Company-ID and optional X-Hub-ID

Return example request/response handling, TypeScript typing strategy, and UI fallback strategy if fields are missing.

## 9) Frontend Testing Prompt

Create or update frontend tests for:

- Scope: [component/page/flow]
- Test types: [unit/integration/e2e]
- Critical paths: [list]
- Edge/error cases: [list]

Include what is covered, what is not covered, and any test data/mocks added.

## 10) Prompt Tips (Frontend)

- Always specify role(s), screen(s), and route(s).
- Always include acceptance criteria.
- State whether API endpoints already exist or are assumed.
- Ask for loading/empty/error behavior explicitly.
- Ask for accessibility behavior where relevant.
- Ask for verification output explicitly when needed.
