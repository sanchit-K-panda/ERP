# NEO CRM — AI Agent Development Plan

**Version:** 1.0  
**Role:** AI/ML Engineer + Backend Integration  
**Status:** Planned for v1.5 / v2  

---

## 1. Vision

The NEO CRM AI Agent acts as an **intelligent operations assistant** embedded in the platform. It augments the team's capabilities by automating repetitive tasks, surfacing insights proactively, and allowing natural-language interaction with the system.

The agent is **not a chatbot** — it is an action-capable assistant that understands the domain (trade, logistics, cargo) and can read and write to the system on behalf of authorized users.

---

## 2. Agent Capabilities Overview

| Capability | Description | Priority |
|---|---|---|
| **Document Extraction** | Extract structured data from uploaded documents (invoices, packing lists) | P1 |
| **Job Summary** | Generate a natural-language summary of any job's status, costs, and timeline | P1 |
| **Shipment Alerts** | Proactively flag delayed or at-risk shipments with explanations | P1 |
| **Financial Insights** | Summarize revenue, expenses, and outstanding payments in plain language | P2 |
| **Auto-fill Assistance** | Suggest field values when creating a job (based on party history) | P2 |
| **Report Generation** | Generate narrative report summaries alongside charts | P2 |
| **Natural Language Search** | "Show me all overdue jobs for Acme Global Trade this month" | P3 |
| **Anomaly Detection** | Flag unusual patterns (cost spikes, route delays, payment gaps) | P3 |
| **Client Communication Draft** | Draft status update emails to clients | P3 |

---

## 3. Architecture

```
┌──────────────────────────────────────────────────────────┐
│                  NEO CRM AI AGENT LAYER                  │
│                                                          │
│  ┌──────────────┐   ┌──────────────┐  ┌──────────────┐  │
│  │  Agent UI    │   │ Agent Router │  │  Tool Layer  │  │
│  │  (chat panel │   │ (intent →    │  │  (API calls  │  │
│  │   + results) │   │  tool map)   │  │   to NEO CRM)│  │
│  └──────┬───────┘   └──────┬───────┘  └──────┬───────┘  │
│         │                  │                  │           │
│  ┌──────▼──────────────────▼──────────────────▼───────┐  │
│  │              LLM Core (Claude / GPT-4o)            │  │
│  │  System prompt: NEO CRM domain knowledge +         │  │
│  │  current company/hub/user context                  │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
                           │
          ┌────────────────▼────────────────┐
          │         NEO CRM API              │
          │  (authenticated, company-scoped) │
          └─────────────────────────────────┘
```

---

## 4. Agent Tools (Function Calling)

The agent uses structured tool calls (function calling) to interact with the NEO CRM system.

### Tool: `get_job_details`
```json
{
  "name": "get_job_details",
  "description": "Retrieve full details of a job by job ID or client name",
  "parameters": {
    "job_id": "string (optional)",
    "client_name": "string (optional)",
    "status": "string (optional filter)"
  }
}
```

### Tool: `get_shipment_status`
```json
{
  "name": "get_shipment_status",
  "description": "Get current status and details of shipments",
  "parameters": {
    "job_id": "string (optional)",
    "status": "enum: processing|in_transit|delivered|delayed (optional)",
    "date_range": "object { from: date, to: date } (optional)"
  }
}
```

### Tool: `get_financial_summary`
```json
{
  "name": "get_financial_summary",
  "description": "Get revenue, expense, and balance summary for a period",
  "parameters": {
    "period": "enum: today|week|month|year|custom",
    "date_range": "object (required if period=custom)"
  }
}
```

### Tool: `extract_document_data`
```json
{
  "name": "extract_document_data",
  "description": "Extract structured fields from an uploaded document",
  "parameters": {
    "document_id": "string",
    "doc_type": "enum: invoice|packing_list|bill_of_lading"
  }
}
```

### Tool: `list_alerts`
```json
{
  "name": "list_alerts",
  "description": "Get current system alerts (overdue payments, delayed shipments, etc.)",
  "parameters": {
    "alert_type": "enum: finance|shipment|system|all"
  }
}
```

### Tool: `search_entities`
```json
{
  "name": "search_entities",
  "description": "Search across jobs, shipments, parties using natural language query",
  "parameters": {
    "query": "string",
    "entity_types": "array: ['jobs', 'shipments', 'parties']"
  }
}
```

### Tool: `create_job_draft` *(write — role-gated)*
```json
{
  "name": "create_job_draft",
  "description": "Pre-fill a new job form draft based on user description",
  "parameters": {
    "client_name": "string",
    "cargo_description": "string",
    "service_type": "string",
    "origin": "string"
  }
}
```

---

## 5. Document Intelligence (OCR + Extraction)

### Use Case
When a user uploads a **supplier invoice** or **packing list**, the AI agent automatically extracts key fields to pre-populate the job form — reducing manual data entry errors.

### Pipeline
```
User uploads PDF/Image document
     │
     ▼
Document stored in S3
     │
     ▼
Bull queue: document-ai-extraction job enqueued
     │
     ▼
AI Worker:
  1. Retrieve file from S3
  2. Convert to base64 / extract text (OCR if scanned)
  3. Send to LLM with extraction prompt:
     "Extract: supplier_name, invoice_number, 
      total_amount, currency, item_list, dates"
  4. Parse structured JSON response
  5. Store extracted_data in documents table
     │
     ▼
Frontend:
  - Show "AI extracted the following data" panel
  - Allow user to confirm/edit before saving to job
```

### Extraction Output Schema
```json
{
  "supplier_name": "Al-Faisal Traders",
  "invoice_number": "INV-2023-4521",
  "invoice_date": "2023-10-15",
  "total_amount": 12500.00,
  "currency": "USD",
  "items": [
    { "description": "Electronics Components", "qty": 50, "unit": "pcs", "unit_price": 250.00 }
  ],
  "confidence_score": 0.94
}
```

---

## 6. Agent UI Design

The agent is accessible as a **side panel** that can be opened from any page.

```
┌──────────────────────────────────┐
│ 🤖 NEO Assistant           [×]   │
├──────────────────────────────────┤
│                                  │
│  Context: Simon Cargo / BD HQ    │
│  Role: Business Manager          │
│                                  │
│  ┌──────────────────────────┐   │
│  │ Suggested Actions        │   │
│  │ • Summarize today's jobs │   │
│  │ • Show delayed shipments │   │
│  │ • Outstanding payments   │   │
│  └──────────────────────────┘   │
│                                  │
│  [conversation messages here]    │
│                                  │
│  ┌──────────────────────────┐   │
│  │ Ask anything...     [▶]  │   │
│  └──────────────────────────┘   │
└──────────────────────────────────┘
```

---

## 7. System Prompt Design

```
You are the NEO CRM Assistant, an intelligent operations helper for a 
trade and import/export logistics company.

CURRENT CONTEXT:
- Company: {company.name}
- Active Hub: {hub.name}
- User: {user.name} ({user.role})
- Date: {current_date}

YOUR CAPABILITIES:
- Access jobs, shipments, financial data, documents, and parties for this company
- Extract and summarize information from documents
- Surface alerts and risk indicators
- Help create job drafts based on user descriptions

YOUR CONSTRAINTS:
- Only access data for company_id: {company.id}
- Respect role permissions: this user is {user.role} and cannot {restricted_actions}
- Never invent data — only report what the system returns
- For write operations, always confirm with the user before executing
- Respond in concise, professional language — this is a business tool

DOMAIN KNOWLEDGE:
- A "Job" is a trade order (import/export operation)
- "Hub" = operational location node (e.g., Bangladesh HQ, Pakistan Origin Hub)
- Service types: Shipping Only, Purchase + Shipping, Full Service
- Job status flow: Created → Processing → In Transit → Delivered → Completed
- "Party" = any external entity (client, vendor, broker)
```

---

## 8. Implementation Phases

### Phase 1 — Document Intelligence (v1.5)
- [ ] OCR pipeline for PDF/image documents
- [ ] Invoice + packing list extraction
- [ ] UI: "AI detected fields" confirmation panel
- [ ] Store extracted_data in documents table

### Phase 2 — Agent Panel + Query Tools (v1.5)
- [ ] Agent side panel UI
- [ ] LLM integration (Anthropic Claude API)
- [ ] Read-only tools: get_job_details, get_shipment_status, get_financial_summary, list_alerts
- [ ] Suggested actions UI
- [ ] Context injection (company/hub/user/role)

### Phase 3 — Advanced Tools (v2)
- [ ] Natural language search across entities
- [ ] Anomaly detection (delayed patterns, cost outliers)
- [ ] Create job draft tool (with user confirmation)
- [ ] Client communication draft generator
- [ ] Narrative report summaries

---

## 9. Security Considerations for AI Features

- All agent tool calls are authenticated and company-scoped — the agent cannot access data outside the user's company
- Write operations require explicit user confirmation before execution
- LLM responses are never rendered as raw HTML — sanitize all outputs
- Document data sent to LLM must be stripped of credentials/tokens
- Agent activity is logged to audit_logs with `source: AI_AGENT`
- Rate limiting on agent calls: 60 requests/hour per user

---

*AI Lead: [Assign] | Dependencies: Backend API must be complete before agent tools can be built*
