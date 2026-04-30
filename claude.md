# AI Product-to-Buyer Finder: Development Guide

**Goal**: B2B lead intelligence platform that identifies and ranks potential buyers for products using AI agents. Users input a product name + target country (DE/AT/CH/NL), and the system returns ranked leads with confidence scores, evidence, and CSV export.

**MVP**: Germany market, auto-complete within 60s, min 10 qualified leads.

---

## Tech Stack

| Layer | Tech | Version |
|-------|------|---------|
| **Frontend** | React 18 + TypeScript + Vite | Latest |
| **Data Fetching** | TanStack React Query | v5 |
| **Styling** | Tailwind CSS + shadcn/ui | Latest |
| **Backend** | FastAPI + Python | 3.11+ |
| **Async Tasks** | Celery + Redis | Latest |
| **Database** | PostgreSQL | 16 |
| **AI Agent** | OpenAI Agents SDK | Latest |
| **Search APIs** | SerpAPI, Google CSE | - |

---

## Folder Structure

```
Web-Scraping/
├── market-matcher-x-main/              # Frontend (React + TypeScript)
│   └── market-matcher-x-main/
│       ├── src/
│       │   ├── pages/                  # Page components (Index.tsx = home)
│       │   ├── components/             # UI components (SearchCard, LoadingState, ResultsView, etc.)
│       │   ├── lib/                    # Utilities (API client, hooks, types)
│       │   ├── hooks/                  # Custom React hooks
│       │   ├── App.tsx                 # Root component
│       │   └── main.tsx                # Entry point
│       ├── package.json                # Bun/npm dependencies
│       ├── vite.config.ts              # Vite config
│       └── tailwind.config.ts          # Tailwind config
├── api/                                 # Backend (FastAPI + Python)
│   ├── app/
│   │   ├── main.py                     # FastAPI app + routes
│   │   ├── agents/                     # AI agents (parser, mapper, search, scorer)
│   │   ├── models/                     # SQLAlchemy models (Task, Lead, ProductInput)
│   │   ├── schemas/                    # Pydantic schemas (request/response)
│   │   └── services/                   # Business logic (search, enrichment, export)
│   ├── requirements.txt                # Python dependencies
│   ├── .env.example                    # Environment variables template
│   └── celery_worker.py                # Celery worker entry point
├── Tech_plan.md                        # Technical specifications
├── PRD_AI_Product_to_Buyer_finder.md   # Product requirements document
└── CLAUDE.md                           # This file
```

---

## Quick Start

### Frontend Setup

```bash
cd market-matcher-x-main/market-matcher-x-main

# Install dependencies (uses Bun or npm)
bun install
# or
npm install

# Run dev server (Vite)
bun dev
# or
npm run dev

# Build for production
bun run build
npm run build
```

**Access**: http://localhost:5173

### Backend Setup

```bash
cd api

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys (OpenAI, SerpAPI, Google CSE, etc.)

# Run FastAPI dev server (with auto-reload)
uvicorn app.main:app --reload --port 8000

# In another terminal, run Celery worker
celery -A app.celery_app worker --loglevel=info

# Optional: Celery Flower (task monitoring)
celery -A app.celery_app flower --port=5555
```

**API Docs**: http://localhost:8000/docs (Swagger UI)  
**Flower UI**: http://localhost:5555

---

## API Endpoints

### Core Endpoints (Phase 1-4 Focus)

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| POST | `/api/upload` | Upload product file (image/PDF) | Queued |
| POST | `/api/search` | Submit new search → returns task_id | Queued |
| GET | `/api/search/{task_id}/status` | Poll progress (for LoadingState) | Queued |
| GET | `/api/search/{task_id}/results` | Get leads with filtering/sorting | Queued |
| GET | `/api/search/{task_id}/export` | Download CSV export | Queued |

### Request/Response Examples

**POST /api/search** (from SearchCard)
```json
{
  "product": "Industrial pressure sensor",
  "manufacturer": "SensorCorp (optional)",
  "file_key": "uuid (optional)",
  "country": "Germany",
  "leads_count": 50
}
→ { "task_id": "abc123", "status": "pending" }
```

**GET /api/search/{id}/status** (polled every 5s)
```json
{
  "task_id": "abc123",
  "status": "processing",
  "step": "mapping",
  "progress": 45,
  "error": null
}
```

**GET /api/search/{id}/results?min_score=50&sort_by=score**
```json
{
  "leads": [{
    "id": "lead-1",
    "score": 92,
    "company": "Siemens AG",
    "website": "siemens.com",
    "industry": "Industrial Automation",
    "type": "Manufacturer",
    "size": "10,000+",
    "location": "München, DE",
    "fitReason": "Uses sensors in automation...",
    "evidence": [{"title": "...", "url": "...", "snippet": "..."}],
    "breakdown": [{"label": "Industry match", "value": 98}],
    "risks": []
  }],
  "stats": { "total": 45, "high": 12, "avg": 78 }
}
```

---

## Database Schema (Core Tables)

```sql
-- Core tables (create with Alembic migrations in production)
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  status VARCHAR(50),  -- pending|analyzing|mapping|searching|scoring|completed|failed
  progress INT DEFAULT 0,
  current_step VARCHAR(50),
  product_input_id UUID,
  leads_count INT DEFAULT 50,
  error_message TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE leads (
  id UUID PRIMARY KEY,
  task_id UUID,
  score INT,
  company VARCHAR(200),
  website VARCHAR(500),
  industry VARCHAR(100),
  type VARCHAR(50),
  size VARCHAR(50),
  fit_reason TEXT,
  evidence JSONB,    -- [{title, url, snippet}]
  risks JSONB,
  breakdown JSONB,   -- [{label, value}]
  location VARCHAR(100),
  created_at TIMESTAMP
);
```

---

## Frontend-Backend Integration

### Frontend → Backend Flow

**SearchCard** (input) → **POST /api/search** (create task) → **LoadingState** (poll status) → **ResultsView** (fetch results) → **CSV Export**

```typescript
// Frontend example flow (React)
1. SearchCard captures product + country
2. POST /api/search → receives task_id
3. LoadingState polls GET /api/search/{id}/status every 5s
4. When status==="completed", fetch GET /api/search/{id}/results
5. ResultsView displays leads with filters
6. Export button downloads CSV from GET /api/search/{id}/export
```

```python
# Backend example flow (FastAPI)
1. POST /api/search creates Task + ProductInput in DB
2. Celery task queues the search workflow
3. 5 AI agents run sequentially: Parser → Mapper → Search → Enricher → Scorer
4. Results stored in Leads table
5. GET endpoints fetch from DB with filters/sorting
```

---

## Phase Breakdown (Build Order)

| Phase | Focus | Deliverable |
|-------|-------|-------------|
| **1** | Backend search form + file upload | `POST /api/upload`, `POST /api/search` endpoints |
| **2** | Frontend SearchCard integration | SearchCard calls backend, stores task_id |
| **3** | AI agents (parsing + mapping) | Parser + Mapper agents working in Celery |
| **4** | Search agents + scrapers | Search + Enricher agents finding companies |
| **5** | Scoring + results | Scorer agent calculating confidence scores |
| **6** | Results API + filtering | `GET /api/search/{id}/results` with filters |
| **7** | Frontend LoadingState + ResultsView | Real data flowing end-to-end |
| **8** | CSV export | `GET /api/search/{id}/export` |
| **9** | Caching + performance | Redis caching, task deduplication |
| **10** | Auth + user management | JWT, user_id tracking (optional for MVP) |

---

## Best Practices

### Frontend (React)
- **Use TypeScript strict mode** - Define interfaces for all API responses
- **React Query for async** - Let TanStack handle polling, caching, retries
- **Component composition** - Split SearchCard, LoadingState, ResultsView, LeadDetailPanel
- **Error handling** - Show user-friendly errors when API fails
- **No hardcoded URLs** - Use env vars for API base URL (e.g., `VITE_API_URL`)

### Backend (FastAPI)
- **Type hints everywhere** - Pydantic schemas for request/response validation
- **Async/await for I/O** - Don't block on DB or API calls
- **Celery for long tasks** - Put AI agent workflows in Celery, return task_id immediately
- **Structured logging** - Log in JSON format with context (task_id, step, duration)
- **Error handling** - Return 400/422 for client errors, 500 for server errors
- **Pagination** - Return leads in pages if >200 results

### AI Agents
- **Use OpenAI Agents SDK** - Don't roll custom agent logic
- **Log agent actions** - Track what each agent does for debugging
- **Graceful fallbacks** - If search API fails, return cached results
- **Rate limiting** - Respect API limits, queue excess requests

### Database
- **Migrations first** - Use Alembic for schema changes, never raw SQL
- **Indexes for queries** - Index on `task_id`, `score`, `industry`, `type`
- **JSONB for flexibility** - Store evidence, breakdown, risks as JSONB
- **Data cleanup** - Delete old tasks/leads after 30 days (GDPR)

### Deployment
- **Environment vars** - `.env` for secrets (API keys, DB URL, Redis URL)
- **Docker** - Containerize FastAPI + workers for easy scaling
- **Celery monitoring** - Use Flower to watch task queues
- **Error tracking** - Integrate Sentry for production errors

---

## Environment Variables (.env template)

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost/product_finder
REDIS_URL=redis://localhost:6379

# OpenAI
OPENAI_API_KEY=sk-...

# Search APIs
SERPAPI_API_KEY=...
GOOGLE_CSE_API_KEY=...
GOOGLE_CSE_ID=...

# Frontend
VITE_API_URL=http://localhost:8000

# Celery
CELERY_BROKER_URL=redis://localhost:6379
CELERY_RESULT_BACKEND=redis://localhost:6379
```

---

## Common Tasks

### Add a new API endpoint
1. Define Pydantic schema in `app/schemas/`
2. Add route in `app/main.py`
3. Implement logic in `app/services/`
4. Update frontend to call the endpoint
5. Test with Swagger UI at `/docs`

### Add a new AI agent
1. Create agent class in `app/agents/`
2. Implement `run()` method
3. Add to Celery task workflow
4. Update task status in DB
5. Test with Celery worker logs

### Update frontend component
1. Edit component in `src/components/`
2. Call API endpoints via React Query
3. Update TypeScript interfaces in `src/lib/`
4. Test in dev server (`bun dev`)
5. Check Swagger UI for latest API schema

---

## Useful Commands

```bash
# Frontend
cd market-matcher-x-main/market-matcher-x-main
bun dev              # Start Vite dev server
bun run build        # Build for production
bun run test         # Run tests

# Backend
cd api
uvicorn app.main:app --reload  # Start FastAPI with auto-reload
celery -A app.celery_app worker --loglevel=info  # Start Celery worker
celery -A app.celery_app flower  # Monitor tasks at :5555

# Database
alembic revision --autogenerate -m "message"  # Create migration
alembic upgrade head  # Apply migrations
psql -U user product_finder  # Connect to DB

# Testing
pytest app/tests/  # Run all tests
pytest -v app/tests/test_search.py  # Run specific test
curl http://localhost:8000/docs  # Swagger UI
```

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2026-04-30 | Optimized: tech stack, folder structure, setup guide, integration points |
| 1.0 | 2026-04-30 | Initial MVP CLAUDE.md |
