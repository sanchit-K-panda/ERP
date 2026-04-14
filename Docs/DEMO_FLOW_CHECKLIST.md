# NEO CRM Demo Flow Checklist (Phase 10)

## 1) Login and Role Context
- Open login and sign in as a business owner user.
- Confirm sidebar modules match role permissions.
- Confirm no loading flicker after authentication redirect.

## 2) Company and Hub Context
- Use header company chip to switch company.
- Use header hub chip to switch hub.
- Confirm dashboard KPIs refresh with selected context.

## 3) Dashboard Story
- Show KPI cards and trend indicators.
- Open Recent Jobs, Recent Transactions, and Latest Shipments.
- Highlight Quick Insights panel priorities.

## 4) Jobs Story
- Navigate to Jobs list and show filters/search.
- Open one job detail and walk through Overview, Logistics, Finance, Documents tabs.
- Show status workflow transition confirmation.

## 5) Shipments Story
- Open Shipments and show summary strip.
- Demonstrate status progression controls and Open Job action.

## 6) Finance Story
- Open Finance Dashboard and explain cash flow chart.
- Open Transactions and show job-linked financial tracking.
- Open Invoices and show paid/pending/overdue readability.

## 7) Reports Story
- Open Reports table and chart views.
- Switch report type and date ranges.
- Trigger export placeholder action.

## 8) Documents Story
- Open Documents and upload a sample file.
- Show preview modal and archive/delete actions.

## 9) Warehouse Story
- Show inventory health and movement log.
- Record one movement and verify stock update feedback.

## 10) Settings Story
- Show system overview tiles.
- Open User Management, Hub Settings, Company Settings, Notification Settings.
- Demonstrate create/edit/toggle actions.

## Final Verification
- Loading states appear with skeletons.
- Empty states show clear CTA where applicable.
- Error states show graceful messaging and retry actions.
- All primary routes render without broken navigation.
