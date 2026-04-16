# NEO CRM — Change Requirements Document

**Document Type:** Change Request Specification  
**Raised By:** Product Manager  
**Status:** Pending Implementation  
**Date:** 2026-04-16  
**Reference Sources:** UI Mockups (Create Company Wizard, Create Hub Wizard) + PDF Change Brief  

---

## OVERVIEW

This document captures all required changes across data/content, UI components, and configuration. Every change listed here must be implemented exactly as specified — no deviation without PM sign-off.

---

## SECTION 1 — BRANDING / APP NAME CHANGE

### Change 1.1 — App Name

| Field | Old Value | New Value |
|---|---|---|
| Application Name / Logo Text | `NEO CRM` | `Simon Logistics` |

**Scope:** All places the app name appears:
- Top-left sidebar / navbar logo text
- Browser tab title (`<title>`)
- Login / landing page heading
- Email notification sender name
- Any footer references to the product name

---

## SECTION 2 — COMPANY DATA CHANGES

### Change 2.1 — Company List (Select Company Screen)

Replace all existing demo/seed company names with the following:

| # | Old Company Name | New Company Name | Company ID |
|---|---|---|---|
| 1 | Mahadev Logistics Pvt Ltd | Simon Cargo Service | c1 |
| 2 | Shree Ganesh Freight Lines | Alpha Exim | c2 |
| 3 | Bharat Coastal Movers | Simon Logistics | c3 |
| 4 | IndidiTrans Supply Chain | XYX Limited | c4 |

> **Note:** IDs remain the same (c1–c4). Only the display names change.

---

### Change 2.2 — Create Company Wizard — Business Type Options

**Location:** Step 1 → Company Basic Information → Business Type dropdown

| Old Options | New Options |
|---|---|
| Cargo / Trading / Logistics / Manufacturing | Pharma |
| | Logistics |
| | Agriculture |
| | Textile |

**UI Behavior:** Multi-select dropdown (same as current). Replace the entire option set.

---

### Change 2.3 — Create Company Wizard — Company Name Example

**Location:** Step 1 → Company Name field placeholder / demo data

Default demo companies shown in context should reflect:
- Alpha Exim
- Simon Cargo Service

---

### Change 2.4 — Create Company Wizard — Specific Company: "DHAKA STOCK Exchange"

When creating a company with the name **"DHAKA STOCK Exchange"**, the business type options available must include:
- Pharma
- Logistics
- Agriculture
- Textile

> This is covered by Change 2.2 above — confirming these are the correct business types for this company's setup.

---

### Change 2.5 — Currency: Default to Bangladeshi Taka (৳)

**Scope:** All currency display across the entire app where demo/default data is shown.

| Context | Old Currency | New Currency |
|---|---|---|
| Dashboard KPI cards | ₹ (Indian Rupee) | ৳ (Bangladeshi Taka) |
| Revenue (Monthly) KPI | ₹5,44,50,000 | ৳5,44,50,000 |
| Expenses (Monthly) KPI | ₹2,63,90,000 | ৳2,63,90,000 |
| Cash Balance KPI | ₹4,28,70,000 | ৳4,28,70,000 |
| Pending Payments KPI | ₹2,20,00,000 | ৳2,20,00,000 |
| Recent Transactions amounts | ₹ prefix | ৳ prefix |
| All financial fields | ₹ | ৳ |

**Default Currency in Create Company Wizard:**
- Step 3 → Trade Flow Configuration → Default Currency → set default to **BDT (Bangladeshi Taka)**

---

## SECTION 3 — HUB DATA CHANGES

### Change 3.1 — Hub List (Select Hub Screen)

Replace all existing hub entries with the following list:

| # | Old Hub Name | New Hub Name | Hub ID |
|---|---|---|---|
| 1 | Mumbai Port Hub | **Mumbai Port Hub** *(keep as-is)* | h1 |
| 2 | Delhi ICD Hub | Dhaka Air Cargo | h2 |
| 3 | Chennai Port Hub | Chittagong Sea Port | h3 |
| 4 | Mundra Port Hub | Dubai Sea Port | h4 |
| 5 | Bangalore Air Cargo Hub | Karachi Port | h5 |
| 6 | *(new entry)* | Singapore Sea Port | h6 |

> **Explicit instruction from PM:** Mumbai Port Hub is kept. All other original hubs (Delhi ICD, Chennai Port, Mundra Port, Bangalore Air Cargo) are replaced with the new hub names above.

**Final hub list after change:**
1. Mumbai Port Hub (h1) — retained
2. Dhaka Air Cargo (h2)
3. Chittagong Sea Port (h3)
4. Dubai Sea Port (h4)
5. Karachi Port (h5)
6. Singapore Sea Port (h6)

---

### Change 3.2 — Dashboard: Hub Context Display

**Location:** Header → Hub Selector (currently shows "Mumbai Port Hub")

**Change:** Default selected hub context in demo data:
- Company: `Alpha Exim` or `Simon Cargo Service`
- Hub: `Chittagong Sea Port`

**Header bar after change:**
```
[Simon Logistics logo] | Alpha Exim ▼ | Chittagong Sea Port ▼ | [search] | [bell] | [user]
```

---

### Change 3.3 — Latest Shipments — Route Data Update

**Location:** Dashboard → Latest Shipments section → Route column

Replace all shipment routes to use the new hub names:

| Shipment ID | Old Route | New Route |
|---|---|---|
| S-1009 | Mumbai Port Hub → Dubai Free Zone Hub | Mumbai Port Hub → Dubai Sea Port |
| S-1008 | Chennai Port Hub → Singapore Gateway Hub | Chittagong Sea Port → Singapore Sea Port |
| S-1007 | Delhi ICD Hub → Mumbai Port Hub | Dhaka Air Cargo → Mumbai Port Hub |
| S-1006 | Bangalore Air Cargo Hub → Chennai Port Hub | Dhaka Air Cargo → Chittagong Sea Port |
| S-1005 | Mundra Port Hub → Rotterdam Port Hub | Karachi Port → Singapore Sea Port |

---

## SECTION 4 — CREATE COMPANY WIZARD — UI COMPONENT SPEC

> Based on Image 1 provided. These are the exact field definitions and behavior for the 4-step Create Company Setup wizard.

### Step 1 — Company Basic Information

| Field | Type | Behavior / Notes |
|---|---|---|
| Company Name | Text input | Required. Free text. |
| Company Code | Text input + toggle | Toggle: Auto (auto-generated) / Manual (user types). Default: Auto. |
| Company Logo | File upload | Drag & drop area. Accepts image files. Preview on upload. |
| Business Type | Multi-select dropdown | Options: Pharma, Logistics, Agriculture, Textile *(updated per Change 2.2)* |
| Status | Toggle switch | Active / Draft. Default: Active. Label: "Active/Draft" |
| Next Step | Button | Validates Step 1 fields before proceeding. Primary action. |

**Stepper:** 4 dots across the top. Step 1 active. Steps 2–4 greyed until completed.

---

### Step 2 — Operations Setup

| Field | Type | Behavior / Notes |
|---|---|---|
| Operation Start Date | Date picker | Format: DD/MM/YYYY. Default: today's date. Calendar icon on left. |
| Main Operation Hub | Dropdown (searchable) | Shows country/hub list. Options include: Bangladesh, Pakistan, China, USA, UAE, India. Default: Bangladesh. |
| Location Tag | Tag chip input | User types a location tag. Shows as dismissible chip (× button). E.g., "Location Tag". |

**Dropdown behavior:** On focus, shows list — Bangladesh, Pakistan, China, USA, UAE, India (scrollable). Selected item shows highlighted in the dropdown list.

---

### Step 3 — Trade Flow Configuration

**Import Configuration (left column):**

| Field | Type | Notes |
|---|---|---|
| Enable (Import) | Toggle | ON by default |
| Countries | Multi-select | "Select multi-select" placeholder |
| Primary Sources | Tag chip multi-select | Selected items show as dismissible chips with × |
| Default Currency | Dropdown | Default: BDT *(updated per Change 2.5)* |

**Export Configuration (right column):**

| Field | Type | Notes |
|---|---|---|
| Enable (Export) | Toggle | ON by default |
| Countries | Multi-select | "Select multi-select" placeholder |
| Primary Destinations | Tag chip multi-select | Selected items show as dismissible chips with × |
| Default Currency | Dropdown | Default: USD |

**Hub Logic Diagram (bottom of Step 3):**
- Visual diagram showing: `[Import Countries] → [Main Hub] → [Export Countries]`
- 3 rows of Import Countries feeding into 1 Main Hub node
- Main Hub node feeding into 3 rows of Export Countries
- Non-interactive — display only

---

### Step 4 — Review & Create

**Company Summary panel (right side):**

| Label | Value Source |
|---|---|
| Name | From Step 1 Company Name |
| Business Type | From Step 1 Business Type |
| Start Date | From Step 2 Operation Start Date |
| Main Hub | From Step 2 Main Operation Hub |

**Trade Setup Summary panel:**

| Section | Content |
|---|---|
| Import Enabled | ✓ Countries (shows count / "+ Countries" chip) |
| Export Enabled | ✓ Countries (shows count / "+ Countries" chip) |

**Action Buttons:**
- `Create Company` → Primary (dark/filled button). Submits the form.
- `Save as Draft` → Secondary (outline button). Saves without activating.

---

## SECTION 5 — CREATE HUB WIZARD — UI COMPONENT SPEC

> Based on Image 2 provided. These are the exact field definitions for the 4-step Create New Hub wizard.

**Wizard Header:**
- Title: `Create New Hub`
- Subtitle: `Define operational logistics center for company network`
- Stepper: 4 steps. Steps 1 & 2 completed (filled circles with check). Steps 3 & 4 in progress/pending.

---

### Step 1 — Hub Basic Info

| Field | Type | Behavior / Notes |
|---|---|---|
| Hub Name | Text input | Placeholder: "Hub Name". Required. |
| Country | Dropdown | Searchable country selector. |
| City | Text input | Free text. Required. |
| Hub Code | Text input | Placeholder: "Auto-generated field". Read-only when auto. |
| Hub Type | Radio group (2×2 grid) | Options: HQ *(default, pre-selected)*, Import Hub, Export Hub, Transit Hub |

**Hub Type radio layout:**
```
( ) HQ          ( ) Import Hub
( ) Export Hub  ( ) Transit Hub
```

---

### Step 2 — Operation Settings

All fields are **toggle switches** (ON/OFF):

| Toggle Label | Default | Notes |
|---|---|---|
| Enable Import | ON | Enables import operations for this hub |
| Enable Export | OFF | Enables export operations |
| Enable Transit | OFF | Enables transit/pass-through operations |
| Financial Control Hub | ON | Hub handles financial oversight |
| Inventory Control Hub | ON | Hub manages inventory |
| Active Status | ON | Hub is live and active |

**Layout:** 2-column grid (3 rows × 2 columns)

---

### Step 3 — Trade Connections

**Import Settings (left panel):**

| Field | Type | Notes |
|---|---|---|
| Allowed Import Countries | Multi-select dropdown | Placeholder: "Multi-Select..." |
| *(second multi-select)* | Multi-select dropdown | Placeholder: "Multi-Select..." (additional import config) |
| Allowed Import Hubs | Multi-select dropdown | Placeholder: "Multi-Select..." |

**Export Settings (right panel):**

| Field | Type | Notes |
|---|---|---|
| Allowed Export Countries | Multi-select dropdown | Placeholder: "Select Select..." |
| *(second multi-select)* | Multi-select dropdown | Placeholder: "Select Select..." |
| Allowed Export Hubs | Multi-select dropdown | Placeholder: "Select Select..." |

**Central Hub Diagram:**
- Visual node diagram between Import and Export panels
- Central blue circular node (the hub being created)
- Import arrows flowing IN from left
- Export arrows flowing OUT to right
- Non-interactive — display only

---

### Step 4 — Review Panel

Displays a read-only summary card:

| Field | Value |
|---|---|
| Hub Name | *(from Step 1)* |
| Country | *(from Step 1)* |
| Type | Import / Export Hub *(based on Step 1 selection)* |
| Import / Export Links | Import / Export *(summary)* |
| Enabled Operations | HQ *(or selected type)* |

**Action Buttons:**
- `Create Hub` → Primary (dark/navy filled button)
- `Save Draft` → Secondary (outline button)

---

## SECTION 6 — DASHBOARD DATA CHANGES

### Change 6.1 — Welcome Banner

| Field | Old Value | New Value |
|---|---|---|
| User greeting | "Welcome Owner User" | Keep as "Welcome Owner User" |
| Role context subtitle | "BUSINESS_OWNER • Mahadev Logistics Pvt Ltd • Mumbai Port Hub" | "BUSINESS_OWNER • Alpha Exim • Chittagong Sea Port" |

---

### Change 6.2 — Recent Jobs — Client Names

The following client/party names appear in the Recent Jobs section. These are **not changed** per PM instructions (no explicit replacement given for client names). Retain as-is unless PM specifies new client names in a future change request:

- Reliance Retail Limited
- Tata Steel Limited
- Adani Ports and SEZ
- Mahindra Logistics Limited
- Larsen and Toubro Ltd

---

### Change 6.3 — Recent Transactions — Currency Symbol

All transaction amounts: replace `₹` with `৳` (Bangladeshi Taka symbol).

Examples:
- `₹2,25,00,000` → `৳2,25,00,000`
- `₹64,20,000` → `৳64,20,000`
- `₹21,85,000` → `৳21,85,000`

---

## SECTION 7 — SUMMARY CHANGE CHECKLIST

Use this as your implementation and QA checklist:

### Branding
- [ ] App name changed from "NEO CRM" → "Simon Logistics" everywhere

### Companies
- [ ] Company list updated: Simon Cargo Service, Alpha Exim, Simon Logistics, XYX Limited
- [ ] Business Type options updated: Pharma, Logistics, Agriculture, Textile
- [ ] Default company context = Alpha Exim or Simon Cargo Service

### Currency
- [ ] Default currency changed to BDT (Bangladeshi Taka ৳) throughout
- [ ] All dashboard KPI values display ৳ symbol
- [ ] All transaction amounts display ৳ symbol
- [ ] Create Company wizard → Step 3 → Default Currency = BDT

### Hubs
- [ ] Hub list updated: Mumbai Port Hub (kept), Dhaka Air Cargo, Chittagong Sea Port, Dubai Sea Port, Karachi Port, Singapore Sea Port
- [ ] Old hubs removed: Delhi ICD, Chennai Port, Mundra Port, Bangalore Air Cargo
- [ ] Default hub context = Chittagong Sea Port
- [ ] Shipment routes updated to use new hub names

### Create Company Wizard (UI)
- [ ] Step 1: Company Code (Auto/Manual toggle) implemented
- [ ] Step 1: Business Type options = Pharma, Logistics, Agriculture, Textile
- [ ] Step 1: Status toggle (Active/Draft) implemented
- [ ] Step 2: Operation Start Date picker implemented
- [ ] Step 2: Main Operation Hub searchable dropdown (Bangladesh, Pakistan, China, USA, UAE, India)
- [ ] Step 2: Location Tag chip input implemented
- [ ] Step 3: Import config (Enable toggle, Countries, Primary Sources chips, Currency)
- [ ] Step 3: Export config (Enable toggle, Countries, Primary Destinations chips, Currency)
- [ ] Step 3: Hub Logic diagram rendered
- [ ] Step 4: Company Summary + Trade Setup Summary display
- [ ] Step 4: Create Company + Save as Draft buttons

### Create Hub Wizard (UI)
- [ ] Step 1: Hub Name, Country, City, Hub Code (auto), Hub Type (4 radio options)
- [ ] Step 2: 6 toggles (Enable Import, Export, Transit, Financial Control, Inventory Control, Active Status)
- [ ] Step 3: Import Settings multi-selects (Countries, Hubs)
- [ ] Step 3: Export Settings multi-selects (Countries, Hubs)
- [ ] Step 3: Central hub node diagram rendered
- [ ] Step 4: Review summary card (Name, Country, Type, Links, Operations)
- [ ] Step 4: Create Hub + Save Draft buttons

---

## SECTION 8 — NOTES & CONSTRAINTS

1. **No other data changes** beyond what is explicitly listed above. Do not modify job IDs, shipment IDs, status labels, or other UI elements unless listed in this document.
2. **Mumbai Port Hub is intentionally kept** in the hub list alongside the new hubs.
3. **Client/Party names** (Reliance Retail, Tata Steel, Adani Ports, etc.) are NOT changed in this round — await separate PM instruction.
4. **XYX Limited** is the exact name as specified by PM (not "XYZ") — confirm before implementing.
5. **Currency format:** Use `৳` symbol (Unicode: U+09F3) for all Taka displays. Format: `৳X,XX,XXX` (Indian/Bangladeshi comma format).
6. All wizard UI changes (Sections 4 & 5) apply to both the **Create flow** and the **Edit flow** of companies and hubs.

---

*Change Document Owner: Product Manager | Developer must confirm receipt and timeline before start of implementation.*
