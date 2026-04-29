# AI Product-to-Buyer Finder: Updated Technical Plan
**Date**: 2026-04-29
**UI Stack**: Vite + React 18 + TypeScript (confirmed from `market-matcher-x/market-matcher-x-main`)
**Backend Stack**: FastAPI + Celery + Redis + PostgreSQL + OpenAI Agents SDK

---

## 1. Updated Product Requirements (UI-Aligned)

### Key UI-Discovered Fields (not in original PRD)
| Field | UI Type | Description |
|-------|---------|-------------|
| `score` | number (0-100) | Confidence score (renamed from `confidence_score`) |
| `type` | enum | "Manufacturer" \| "Distributor" \| "Wholesaler" \| "Retailer" \| "Service Provider" |
| `size` | string | "1-50", "50-500", "500-5,000", "5,000-10,000", "10,000+" |
| `risks` | string[] | Risk flags (e.g., "Long procurement cycle") |
| `breakdown` | {label, value}[] | Score component breakdown (Industry match, Procurement signals, etc.) |
| `location` | string | "City, CC" format (e.g., "München, DE") |
| `evidence` | {title, url, snippet}[] | Rich evidence with title and snippet (not just URLs) |

### User Flows (Extracted from UI)
```
[Home View] SearchCard
  ├── Inputs: product name, manufacturer (optional), file upload (image/PDF ≤10MB), country selector (DE/AT/CH/NL), leads slider (10-200)
  └── Action: Click "Find buyers" → [Loading View]

[Loading View] LoadingState (4 steps with progress)
  ├── Step 1: "Analyzing product" (Brain icon)
  ├── Step 2: "Mapping industries" (Network icon)
  ├── Step 3: "Searching companies in {country}" (Globe icon)
  └── Step 4: "Scoring leads" (Target icon) → Auto-transition to [Results View]

[Results View] ResultsView
  ├── Header: Back button, query title, stats (total leads, high-confidence count, avg score), sort dropdown, Save project, Export CSV
  ├── Left: FiltersPanel (industries multi-select, types multi-select, min score slider, size dropdown)
  ├── Center: LeadsTable (score badge, company, website, industry, type, fitReason preview, evidence count, View button)
  └── Right: LeadDetailPanel (slide-in panel with full lead details, breakdown, evidence, risks, Save/Contact buttons)
```

### Functional Requirements (Updated)
- `FR-1` to `FR-5`: Same as original PRD, but adjust max leads to 200 (UI slider: 10-200)
- `FR-6`: Support country selection: Germany (default), Austria, Switzerland, Netherlands (UI has 4 options)
- `FR-7`: Return `type` (company type) and `size` (employee count range) for each lead
- `FR-8`: Return `risks` array and `breakdown` (score components) for each lead
- `FR-9`: Return `location` as "City, CC" string for each lead
- `FR-10`: Evidence must include `title`, `url`, and `snippet` for each source
- `FR-11`: Expose 4-step progress for loading state: `analyzing` → `mapping` → `searching` → `scoring`
- `FR-12`: Support filtering by `industries` (multi), `types` (multi), `minScore` (0-100), `size` (enum)
- `FR-13`: Support sorting by `score` (desc) or `name` (asc)

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Vite + React)                  │
│  SearchCard → LoadingState → ResultsView (Filters+Table+Detail) │
│  TanStack React Query for data fetching                     │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API (HTTP)
┌────────────────────────▼────────────────────────────────────┐
│                   FastAPI Backend (Python)                 │
│  /api/upload, /api/search, /api/search/{id}/status,       │
│  /api/search/{id}/results, /api/search/{id}/export        │
└────────────────────────┬────────────────────────────────────┘
                         │ Celery Task
┌────────────────────────▼────────────────────────────────────┐
│                  Celery Worker(s) + Redis                  │
│  OpenAI Agents SDK:                                        │
│    1. Input Parser Agent (OCR for files, product analysis)  │
│    2. Industry Mapper Agent (map to industries, HS codes)   │
│    3. Search Agent (execute queries via Search API abstraction) │
│    4. Enricher Agent (extract company details, evidence)    │
│    5. Scorer Agent (calculate score, breakdown, risks)      │
└────────────────────────┬────────────────────────────────────┘
                         │ Read/Write
┌────────────────────────▼────────────────────────────────────┐
│                  PostgreSQL Database                        │
│  Tables: tasks, product_inputs, leads, search_queries       │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Refined Tech Stack with Justification

### Frontend (Fixed by UI)
| Technology | Purpose | Justification |
|------------|---------|---------------|
| Vite + React 18 + TypeScript | UI framework | Confirmed from `package.json`; Lovable-generated, no Next.js |
| TanStack React Query | Data fetching/caching | Already installed; perfect for polling task status |
| Tailwind CSS + shadcn/ui | Styling | Already in use; glass-morphism effects in UI |
| React Router DOM v6 | Routing | Single page with view state, but ready for future routes |
| lucide-react | Icons | Already in use across all components |
| react-hook-form + zod | Form validation | Installed; can be added to SearchCard for validation |
| sonner | Toast notifications | Already installed for user feedback |

### Backend (Aligned with UI)
| Technology | Purpose | Justification |
|------------|---------|---------------|
| FastAPI (Python 3.11+) | REST API | Matches original PRD; fast async support for polling |
| Celery + Redis | Async task processing | Original PRD; handles long-running AI workflows |
| PostgreSQL 16 | Persistent storage | Original PRD; supports JSON columns for flexible evidence/risks |
| OpenAI Agents SDK | AI workflow orchestration | Original PRD; agent-based architecture matches 4-step UI loading |
| Search API Abstraction | Multi-provider search | Original PRD; swap between SerpAPI, Google CSE, etc. |
| python-multipart + aiofiles | File upload handling | For product image/PDF uploads from SearchCard |

---

## 4. API Design (Key Endpoints)

### `POST /api/upload`
Upload product image or PDF.
```json
Request: multipart/form-data with "file" field (image/* or .pdf, max 10MB)
Response: { "file_key": "uuid-filename", "url": "/tmp/uploads/uuid-filename" }
```

### `POST /api/search`
Submit a new buyer search.
```json
Request: {
  "product": "Industrial pressure sensor",
  "manufacturer": "Acme Sensors GmbH (optional)",
  "file_key": "uuid-filename (optional)",
  "country": "Germany",
  "leads_count": 50
}
Response: { "task_id": "uuid", "status": "pending" }
```

### `GET /api/search/{task_id}/status`
Poll task progress (used by LoadingState component).
```json
Response: {
  "task_id": "uuid",
  "status": "processing",
  "step": "mapping",  // analyzing | mapping | searching | scoring
  "progress": 45,     // 0-100
  "error": null
}
```

### `GET /api/search/{task_id}/results`
Get ranked leads with filtering/sorting (used by ResultsView).
```
Query Params:
  min_score: int (0-100, default 0)
  industries: string[] (multi, optional)
  types: string[] (multi, optional)
  size: string (optional, e.g., "10,000+")
  sort_by: "score" | "name" (default "score")
  order: "asc" | "desc" (default "desc" for score)

Response: {
  "leads": [{
    "id": "uuid",
    "score": 96,
    "company": "Siemens AG",
    "website": "siemens.com",
    "industry": "Industrial Automation",
    "type": "Manufacturer",
    "size": "10,000+",
    "fitReason": "...",
    "evidence": [{"title": "...", "url": "...", "snippet": "..."}],
    "risks": [],
    "breakdown": [{"label": "Industry match", "value": 98}],
    "location": "München, DE"
  }],
  "stats": { "total": 10, "high": 3, "avg": 78 }
}
```

### `GET /api/search/{task_id}/export`
Download CSV export (triggered by Export CSV button).
```
Response: CSV file download with Content-Disposition: attachment; filename="leads-{task_id}.csv"
```

---

## 5. Data Model Updates

### `tasks` table
```sql
CREATE TYPE task_status AS ENUM ('pending', 'analyzing', 'mapping', 'searching', 'scoring', 'completed', 'failed');

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status task_status DEFAULT 'pending',
  progress INT DEFAULT 0,  -- 0-100
  product_input_id UUID REFERENCES product_inputs(id),
  leads_count INT DEFAULT 50,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

### `product_inputs` table
```sql
CREATE TABLE product_inputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name VARCHAR(200) NOT NULL,
  manufacturer_name VARCHAR(200),
  file_key VARCHAR(500),  -- temporary storage key
  target_country VARCHAR(50) DEFAULT 'Germany',
  created_at TIMESTAMP DEFAULT now()
);
```

### `leads` table
```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) NOT NULL,
  score INT CHECK (score >= 0 AND score <= 100),
  company VARCHAR(200) NOT NULL,
  website VARCHAR(500) NOT NULL,
  industry VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,  -- Manufacturer, Distributor, etc.
  size VARCHAR(50),             -- 10,000+, 5,000-10,000, etc.
  fit_reason TEXT NOT NULL,
  evidence JSONB NOT NULL,      -- [{title, url, snippet}]
  risks JSONB DEFAULT '[]',    -- string[]
  breakdown JSONB DEFAULT '[]', -- [{label, value}]
  location VARCHAR(100),        -- "München, DE"
  created_at TIMESTAMP DEFAULT now()
);

-- Indexes for filtering/sorting
CREATE INDEX idx_leads_task_id ON leads(task_id);
CREATE INDEX idx_leads_score ON leads(score DESC);
CREATE INDEX idx_leads_industry ON leads(industry);
CREATE INDEX idx_leads_type ON leads(type);
```

---

## 6. Detailed Phased Plan with Epics and Tasks

### Phase 1: Search Page & Input Handling
**Epic**: Connect SearchCard to backend file upload and search submission
- Task 1.1: Build `POST /api/upload` endpoint in FastAPI (file validation: image/*, .pdf, ≤10MB)
- Task 1.2: Build `POST /api/search` endpoint (validate inputs, create task + product_input records)
- Task 1.3: Update SearchCard to call `/api/upload` on file drop/select
- Task 1.4: Update SearchCard "Find buyers" button to call `/api/search` and store task_id
- Task 1.5: Add react-hook-form + zod validation to SearchCard (required product name, file size check)
- Task 1.6: Redirect to LoadingView on successful search submission

### Phase 2: AI Product Analysis Agents
**Epic**: Implement first 2 steps of AI workflow (Analyzing → Mapping)
- Task 2.1: Build Input Parser Agent (OpenAI Agents SDK): extract product metadata from name/file (OCR for PDFs via PyPDF2, images via OpenAI Vision)
- Task 2.2: Build Industry Mapper Agent: map product to industries, HS codes, company types, size ranges
- Task 2.3: Update task status to `analyzing` → `mapping` with progress 0-50%
- Task 2.4: Store product metadata in `product_inputs` or separate `product_metadata` table

### Phase 3: Lead Discovery Engine
**Epic**: Implement Search Agent to find candidate companies
- Task 3.1: Build Search Query Generator (agent): generate targeted queries for selected country
- Task 3.2: Implement Search API abstraction (provider interface for SerpAPI, Google CSE)
- Task 3.3: Build Search Executor: run queries, collect candidate companies (deduplicate by domain)
- Task 3.4: Update task status to `searching` with progress 50-75%
- Task 3.5: Filter candidates to only include companies in target country

### Phase 4: Results & Lead Display
**Epic**: Implement Scorer Agent and wire results to UI
- Task 4.1: Build Enricher Agent: scrape company website for industry, type, size, location, generic contact
- Task 4.2: Build Scorer Agent: calculate score, breakdown, risks, fit reason, evidence with snippets
- Task 4.3: Update task status to `scoring` → `completed` with progress 75-100%
- Task 4.4: Build `GET /api/search/{task_id}/results` endpoint with filtering/sorting
- Task 4.5: Update LoadingState to poll `/status` endpoint and show real step progress
- Task 4.6: Update ResultsView to fetch leads from `/results` endpoint (TanStack React Query)
- Task 4.7: Connect LeadsTable to real data (replace MOCK_LEADS)
- Task 4.8: Connect LeadDetailPanel to real lead data on row click

### Phase 5: Caching & Performance
**Epic**: Avoid duplicate processing and improve response times
- Task 5.1: Add Redis caching for Search API results (key: query hash, TTL 24h)
- Task 5.2: Deduplicate tasks with identical inputs (return existing task_id if not expired)
- Task 5.3: Add database index on `leads(score DESC)` for fast sorting
- Task 5.4: Implement pagination for leads (if >200 leads, load in pages)

### Phase 6: Filtering & Sorting
**Epic**: Implement backend filtering to match FiltersPanel
- Task 6.1: Add backend filtering for `industries` (multi-select, IN clause)
- Task 6.2: Add backend filtering for `types` (multi-select, IN clause)
- Task 6.3: Add backend filtering for `min_score` (WHERE score >= :min_score)
- Task 6.4: Add backend filtering for `size` (exact match)
- Task 6.5: Add backend sorting for `score` (default DESC) and `name` (ASC/DESC)
- Task 6.6: Update FiltersPanel to fetch available industries/types from `/results` response
- Task 6.7: Connect sort dropdown to backend sort_by/order params

### Phase 7: Export / Download
**Epic**: Implement CSV export matching UI's Export CSV button
- Task 7.1: Build `GET /api/search/{task_id}/export` endpoint (generate CSV from leads)
- Task 7.2: Format CSV columns to match Lead model (score, company, website, industry, type, size, location, fitReason, evidence URLs, risks)
- Task 7.3: Connect Export CSV button in ResultsView header to download endpoint
- Task 7.4: Add GDPR compliance note in CSV header (no personal data included)

### Phase 8: Observability & Reliability
**Epic**: Add logging, error handling, and retry logic
- Task 8.1: Add structured logging for all agent steps (input/output, duration, errors)
- Task 8.2: Implement retry logic for Search API calls (exponential backoff, max 3 retries)
- Task 8.3: Add error handling for failed tasks (store error_message, set status to `failed`)
- Task 8.4: Add Sentry or Prometheus metrics for task success/failure rates
- Task 8.5: Implement file cleanup: delete uploaded files after 24h

### Phase 9: Authentication & User Management (LAST)
**Epic**: Add user accounts for project saving (currently "Save project" button is a no-op)
- Task 9.1: Add JWT-based authentication (FastAPI + python-jose)
- Task 9.2: Build login/signup pages (new React components)
- Task 9.3: Associate tasks with user_id (add `user_id` to `tasks` table)
- Task 9.4: Implement "Save project" functionality (save search params + results to user account)
- Task 9.5: Add "Save lead" button functionality (save individual lead to user's favorites)

---

## 7. Risks and Assumptions

### Risks
| Risk | Mitigation |
|------|------------|
| Search APIs may return low-quality/irrelevant results | Use multiple search providers; agent-based query optimization; confidence scoring |
| OpenAI Agents SDK may have higher latency | Cache agent responses; use streaming for long-running steps |
| File uploads may contain sensitive data | Validate file types; auto-delete after 24h; no persistent storage of uploads |
| GDPR compliance for German market | Only company-level data; generic contact info only; Privacy Policy + Impressum |
| UI expects 4 loading steps, but AI workflow may have variable steps | Map agent workflow to fixed 4 steps; report progress as percentage |

### Assumptions
- Search API providers (SerpAPI, Google CSE) have sufficient coverage for German/Austrian/Swiss/Netherlands companies
- OpenAI Agents SDK supports the 5-agent workflow (Parser → Mapper → Search → Enricher → Scorer)
- PostgreSQL JSONB is sufficient for flexible fields (evidence, risks, breakdown)
- Celery workers can handle 10+ concurrent tasks (MVP target)
- File uploads are temporary and can be stored locally (no S3 required for MVP)

---

## 8. Performance Considerations

| Area | Optimization |
|------|--------------|
| **Search API calls** | Cache results in Redis (TTL 24h); parallelize multiple queries per task |
| **Lead filtering** | Database indexes on `score`, `industry`, `type`; filter at DB level, not application level |
| **Frontend polling** | TanStack React Query with 5s polling interval; auto-stop when status is `completed`/`failed` |
| **Large lead sets** | Support pagination in `/results` endpoint (limit/offset); UI loads 20 leads at a time |
| **CSV export** | Stream CSV generation (FastAPI `StreamingResponse`); don't load all leads into memory |
| **File uploads** | Stream file to disk; validate MIME type after upload (not just extension) |

---

## 9. GDPR Compliance Requirements (Germany-Specific)

### Mandatory Requirements
- `CR-1`: Publish a Privacy Policy in English and German stating: no personal data processed, what company data is collected, retention periods, and user rights
- `CR-2`: Include a German Impressum (required for commercial websites in Germany) with operator contact details
- `CR-3`: Do not use tracking cookies or analytics without explicit user consent
- `CR-4`: All uploaded files and task data deleted within 30 days of creation, or on user request
- `CR-5`: Use TLS for all data in transit; encrypt sensitive fields at rest in PostgreSQL
- `CR-6`: Only use GDPR-compliant Search API providers with signed Data Processing Agreements (DPAs)
- `CR-7`: No personal data transferred outside the EU for MVP (all infrastructure hosted in EU, or providers with EU data residency)

---

## Appendix: File Locations

### UI Source (Lovable-generated)
```
C:/Users/Pradeep/Desktop/Wed Script/market-matcher-x/market-matcher-x-main/
  ├── src/pages/Index.tsx           — Main page with view routing
  ├── src/components/SearchCard.tsx  — Product input form
  ├── src/components/LoadingState.tsx — 4-step progress animation
  ├── src/components/ResultsView.tsx — Results page
  ├── src/components/LeadsTable.tsx  — Leads data table
  ├── src/components/LeadDetailPanel.tsx — Lead detail slide-in panel
  ├── src/components/FiltersPanel.tsx — Sidebar filters
  ├── src/lib/mockLeads.ts          — TypeScript Lead data model (API contract source of truth)
  └── package.json                   — Confirms Vite + React + TanStack Query stack
```

### Original Zip File
```
C:/Users/Pradeep/Desktop/Wed Script/market-matcher-x-main.zip
```
