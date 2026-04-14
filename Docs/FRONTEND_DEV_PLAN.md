# NEO CRM — Frontend Development Plan

**Version:** 1.0  
**Role:** Frontend Lead / Developer  
**Stack:** React + TypeScript + TailwindCSS  

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 (with Vite) |
| Language | TypeScript (strict mode) |
| Styling | TailwindCSS + CSS Modules for overrides |
| UI Components | shadcn/ui (Radix primitives) |
| State (Server) | TanStack Query (React Query v5) |
| State (UI/Global) | Zustand |
| Forms | React Hook Form + Zod validation |
| Routing | React Router v6 |
| Charts | Recharts |
| Tables | TanStack Table v8 |
| HTTP Client | Axios (with interceptors) |
| File Upload | React Dropzone |
| Icons | Lucide React |
| Date Handling | date-fns |
| Testing | Vitest + React Testing Library + Playwright (E2E) |
| Linting | ESLint + Prettier |

---

## 2. Project Structure

```
/src
  /assets               → Images, SVGs, fonts
  /components
    /ui                 → shadcn/ui wrappers and atomic components
      Button.tsx
      Badge.tsx
      Modal.tsx
      DataTable.tsx
      StatusBadge.tsx
      KpiCard.tsx
      FileUploader.tsx
    /layout
      AppShell.tsx       → Sidebar + Header + Content wrapper
      Sidebar.tsx        → Navigation with role-aware menu items
      Header.tsx         → Hub selector, search, notifications, user menu
      PageHeader.tsx     → Page title + breadcrumb + actions slot
  /modules
    /auth
      LoginPage.tsx
      RolePicker.tsx     → Demo login role selector
      useAuth.ts
      authStore.ts
    /company
      CompanySelector.tsx
      CreateCompanyWizard.tsx
        Step1_BasicInfo.tsx
        Step2_OperationsSetup.tsx
        Step3_TradeFlowConfig.tsx
        Step4_ReviewCreate.tsx
      companyService.ts
      companyStore.ts
    /hub
      HubSelector.tsx
      CreateHubWizard.tsx
        HubStep1_BasicInfo.tsx
        HubStep2_OperationSettings.tsx
        HubStep3_TradeConnections.tsx
        HubStep4_Review.tsx
      hubService.ts
      hubStore.ts
    /dashboard
      DashboardPage.tsx
      KpiRow.tsx
      BusinessSnapshotRow.tsx
      PerformanceRow.tsx
      RecentJobsCard.tsx
      RecentTransactionsCard.tsx
      LatestShipmentsCard.tsx
      QuickInsightsPanel.tsx
      charts/
        RevenueExpenseChart.tsx
        JobCompletionGauge.tsx
        CashFlowMiniChart.tsx
    /jobs
      JobListPage.tsx
      JobDetailPage.tsx
      CreateJobWizard.tsx
        JobSection1_ClientInfo.tsx
        JobSection2_ServiceType.tsx
        JobSection3_RouteDetails.tsx
        JobSection4_CargoDetails.tsx
        JobSection5_PurchaseInfo.tsx
        JobSection6_BasicFinancial.tsx
        JobSection7_DocumentUpload.tsx
      tabs/
        JobOverviewTab.tsx
        JobLogisticsTab.tsx
        JobFinanceTab.tsx
        JobDocumentsTab.tsx
      jobService.ts
      jobStore.ts
      jobTypes.ts
    /shipments
      ShipmentListPage.tsx
      ShipmentRow.tsx
      AddShipmentModal.tsx
      shipmentService.ts
    /finance
      FinancePage.tsx
      TransactionList.tsx
      AddExpenseModal.tsx
      financeService.ts
    /parties
      PartyListPage.tsx
      PartyDetailPage.tsx
      partyService.ts
    /freight
      FreightPage.tsx
      freightService.ts
    /warehouse
      WarehousePage.tsx
      warehouseService.ts
    /documents
      DocumentsPage.tsx
      documentsService.ts
    /reports
      ReportsPage.tsx
    /settings
      SettingsPage.tsx
      UserManagement.tsx
      HubSettings.tsx
      CompanySettings.tsx
  /services
    api.ts               → Axios instance with interceptors
    authService.ts
  /hooks
    useRoleGuard.ts      → Hook to check role permissions
    usePagination.ts
    useDebounce.ts
    useCompanyContext.ts
    useHubContext.ts
  /store
    appStore.ts          → Global UI state (sidebar open, theme)
    contextStore.ts      → Active company + active hub
  /types
    index.ts
    roles.ts
    job.types.ts
    shipment.types.ts
    finance.types.ts
    company.types.ts
    hub.types.ts
  /constants
    routes.ts
    roles.ts
    jobStatus.ts
    shipmentStatus.ts
  /utils
    formatCurrency.ts
    formatDate.ts
    getStatusColor.ts
    buildApiUrl.ts
  /guards
    AuthGuard.tsx
    RoleGuard.tsx
    CompanyGuard.tsx
  App.tsx
  main.tsx
  router.tsx
```

---

## 3. Routing Architecture

```typescript
// router.tsx
/                         → Redirect to /login or /dashboard
/login                    → LoginPage (public)
/select-company           → CompanySelector (auth required)
/create-company           → CreateCompanyWizard (auth required)
/select-hub               → HubSelector (company required)
/create-hub               → CreateHubWizard (company required)

// App routes (company + hub context required)
/dashboard                → DashboardPage
/jobs                     → JobListPage
/jobs/create              → CreateJobWizard
/jobs/:jobId              → JobDetailPage (tabs: overview, logistics, finance, documents)
/finance                  → FinancePage
/finance/transactions     → TransactionList
/parties                  → PartyListPage
/parties/:partyId         → PartyDetailPage
/freight                  → FreightPage
/freight/shipments        → ShipmentListPage
/warehouse                → WarehousePage
/documents                → DocumentsPage
/reports                  → ReportsPage
/settings                 → SettingsPage
/settings/users           → UserManagement
/settings/hubs            → HubSettings
/settings/company         → CompanySettings
```

---

## 4. Key Components Spec

### 4.1 `AppShell`

- Left sidebar (collapsible, 240px expanded / 64px icon-only collapsed)
- Top header (fixed, 60px height)
- Main content area with padding
- Sidebar items are role-filtered using `useRoleGuard()`
- Active route highlighted in sidebar

### 4.2 `Header`

```
[Company Name] [Hub Selector ▼]   [Search Bar]   [Date Filter]   [🔔] [● Live] [User ▼]
```

- **Hub Selector**: Dropdown listing hubs for the active company
- **Search**: Global search — queries jobs, parties, invoices, shipments, ledger entries
- **Notifications bell**: Dropdown with 3 tabs (Finance alerts, Shipment alerts, System alerts)
- **Live System**: Green dot indicator (websocket connection status)
- **User Menu**: Profile, switch company, logout

### 4.3 `KpiCard`

```typescript
interface KpiCardProps {
  label: string;
  value: string | number;
  subLabel?: string;
  trend?: number;        // % change — positive = up (green), negative = down (red)
  icon: ReactNode;
  currency?: boolean;
}
```

### 4.4 `StatusBadge`

```typescript
const STATUS_COLORS: Record<string, string> = {
  active:      'bg-green-100 text-green-800',
  success:     'bg-green-100 text-green-800',
  delivered:   'bg-green-100 text-green-800',
  processing:  'bg-blue-100 text-blue-800',
  in_transit:  'bg-blue-100 text-blue-800',
  pending:     'bg-yellow-100 text-yellow-800',
  warning:     'bg-orange-100 text-orange-800',
  draft:       'bg-gray-100 text-gray-600',
  delayed:     'bg-red-100 text-red-800',
  cancelled:   'bg-red-100 text-red-800',
};
```

### 4.5 `DataTable` (wrapping TanStack Table)

- Built-in: search input, filter dropdowns, pagination
- Column definitions passed as props
- Row click → optional `onRowClick` callback
- Action column slot
- Empty state with message + optional CTA
- Loading skeleton rows

### 4.6 `CreateJobWizard`

- Multi-section form on a **single page** (not multi-step pages — all sections visible, scroll to navigate)
- Left panel: section nav (Section 1–7 with completion indicators)
- Conditional rendering: Section 5 (Purchase Info) only visible when Service Type = "Purchase + Shipping"
- Save as Draft persists progress
- Validation per section before final submit

### 4.7 `FileUploader`

- Accepts: PDF, JPG, PNG, XLSX (configurable)
- Max size: 10MB per file
- Shows upload progress bar per file
- File preview list: filename, type icon, progress bar, "..." action (download, delete)
- Drag & drop area with visual feedback

---

## 5. State Management Strategy

### Server State (TanStack Query)

```typescript
// Example: Jobs list
export const useJobs = (filters: JobFilters) =>
  useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => jobService.getJobs(filters),
    staleTime: 30_000,
  });

// Example: Create job mutation
export const useCreateJob = () =>
  useMutation({
    mutationFn: jobService.createJob,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
  });
```

### UI/Context State (Zustand)

```typescript
// contextStore.ts
interface ContextStore {
  activeCompany: Company | null;
  activeHub: Hub | null;
  setActiveCompany: (company: Company) => void;
  setActiveHub: (hub: Hub) => void;
  reset: () => void;
}
```

---

## 6. API Service Layer

```typescript
// api.ts — Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// Request interceptor: attach company/hub context headers
api.interceptors.request.use((config) => {
  const { activeCompany, activeHub } = useContextStore.getState();
  if (activeCompany) config.headers['X-Company-ID'] = activeCompany.id;
  if (activeHub) config.headers['X-Hub-ID'] = activeHub.id;
  return config;
});

// Response interceptor: handle 401 → redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 7. Role-Based UI Control

```typescript
// hooks/useRoleGuard.ts
export const useRoleGuard = (requiredRoles: Role[]) => {
  const { user } = useAuth();
  return requiredRoles.includes(user.role);
};

// Usage in component
const canCreateJob = useRoleGuard([
  Role.BUSINESS_OWNER,
  Role.BUSINESS_MANAGER,
  Role.SALES_MANAGER,
  Role.SALES_PERSON,
]);

// In JSX — hide (not disable) unauthorized elements
{canCreateJob && <Button>Create Job</Button>}
```

---

## 8. Form Validation (Zod + React Hook Form)

```typescript
// jobs/jobTypes.ts
export const CreateJobSchema = z.object({
  partyId: z.string().min(1, 'Client is required'),
  contactPerson: z.string().optional(),
  serviceType: z.enum(['SHIPPING_ONLY', 'PURCHASE_SHIPPING']),
  originHubId: z.string().min(1, 'Origin hub is required'),
  cargoDescription: z.string().min(3, 'Describe the cargo'),
  quantity: z.number().positive('Must be positive'),
  unit: z.enum(['kg', 'ton', 'pcs']),
  weight: z.number().optional(),
  estimatedCost: z.number().optional(),
  currency: z.enum(['BDT', 'USD']).default('USD'),
  // Conditional: required only for PURCHASE_SHIPPING
  supplierName: z.string().optional(),
  purchaseAmount: z.number().optional(),
});
```

---

## 9. Development Phases

### Phase 1 — Foundation (Sprint 1–2)
- [ ] Project scaffold (Vite + React + TS + Tailwind + shadcn)
- [ ] Routing setup
- [ ] Auth module (login, JWT handling, role detection)
- [ ] AppShell (sidebar + header)
- [ ] Role guard hook + component
- [ ] API service layer (Axios + interceptors)
- [ ] Context store (company + hub)

### Phase 2 — Onboarding Flow (Sprint 3)
- [ ] Company Selector page
- [ ] Create Company Wizard (4 steps)
- [ ] Hub Selector page
- [ ] Create Hub Wizard (4 steps)

### Phase 3 — Dashboard (Sprint 4)
- [ ] KPI Cards row
- [ ] Recent Jobs, Transactions, Shipments cards
- [ ] Quick Insights Panel
- [ ] Charts (Revenue vs Expense, Job Completion, Cash Flow)

### Phase 4 — Job Management (Sprint 5–6)
- [ ] Job List page (table + filters + search)
- [ ] Create Job wizard (all 7 sections + conditional logic)
- [ ] Job Detail page (4 tabs)
- [ ] Status update flow
- [ ] Document upload component

### Phase 5 — Logistics & Finance (Sprint 7–8)
- [ ] Shipment list + add shipment modal
- [ ] Finance page (transactions, expenses, invoices)
- [ ] Add Expense modal from Job context

### Phase 6 — Remaining Modules (Sprint 9–10)
- [ ] Sales & Party (list + detail)
- [ ] Warehouse / Stock
- [ ] Documentation
- [ ] Reports

### Phase 7 — Settings + Polish (Sprint 11)
- [ ] Settings pages
- [ ] Notification system
- [ ] Global search implementation
- [ ] Empty states, loading skeletons, error boundaries

### Phase 8 — QA & Handoff (Sprint 12)
- [ ] Unit tests (≥70% coverage on services/hooks)
- [ ] E2E tests (login, create job, create shipment, invoice)
- [ ] Accessibility audit
- [ ] Performance audit (Lighthouse ≥ 90)
- [ ] Cross-browser testing

---

## 10. Environment Variables

```env
VITE_API_BASE_URL=https://api.neocrm.app/v1
VITE_APP_ENV=development
VITE_ENABLE_DEMO_LOGIN=true
VITE_SENTRY_DSN=
```

---

*Frontend Lead: [Assign] | Review: Per sprint demo*
