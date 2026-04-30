# Product Requirements Document (PRD)
## AI Product-to-Buyer Finder MVP

**Version:** 1.0  
**Date:** April 28, 2026  
**Status:** MVP Definition  
**Product Manager:** [Your Name]

---

## Executive Summary

**AI Product-to-Buyer Finder** is a B2B lead intelligence platform that automatically identifies and ranks potential buyers, importers, distributors, and integrators for any product. Users input a product name, manufacturer details, and target country; the system uses AI-powered research agents to discover qualified leads with detailed intelligence and confidence scoring.

**MVP Focus:** Germany market entry for B2B manufacturers and sales teams seeking qualified buyer lists.

---

## 1. User Personas

### 1.1 Primary User: Sales Development Representative (SDR)
**Name:** Marcus, 28  
**Role:** B2B Sales Development Rep at mid-size machinery manufacturer  
**Goal:** Generate qualified lead lists for new markets (especially Germany)  
**Pain Point:** Manual LinkedIn/web searches take 6+ hours per product category; low confidence in lead quality  
**Tech Comfort:** High (SaaS proficient)  
**Usage Pattern:** 3-5 searches per week; batch exports for sales team

**Success Metric:** Finds 15-20 qualified leads per search with verified contact pages in <10 minutes

---

### 1.2 Secondary User: Business Development Manager
**Name:** Sarah, 42  
**Role:** BD Manager at export/import trading company  
**Goal:** Identify integration opportunities and supply chain partners  
**Pain Point:** Unreliable vendor data; difficulty qualifying companies by industry fit  
**Tech Comfort:** Medium (uses Excel, CRM systems)  
**Usage Pattern:** 2-3 searches per month; CSV exports for team review

**Success Metric:** Export contains actionable leads with industry/fit context; minimal false positives

---

### 1.3 Tertiary User: Product Manager (Internal)
**Name:** Chen, 35  
**Role:** PM at manufacturing platform expanding product integrations  
**Goal:** Find strategic partners for white-label/integration opportunities  
**Pain Point:** Need to validate market demand and potential partner ecosystem  
**Tech Comfort:** High (technical background)  
**Usage Pattern:** Ad-hoc searches; API integration for internal tools

**Success Metric:** Confidence scores correlate with real outreach responses

---

## 2. Core User Flows

### 2.1 Happy Path: Product Search & Lead Discovery

```
1. User logs in / accesses app
2. User selects "New Search"
3. Input form presented:
   - Product Name (required)
   - Manufacturer Name (optional)
   - Upload Image/PDF (optional)
   - Target Country (default: Germany)
   - Filters: Industry, Company Size, Lead Type (buyer/distributor/integrator)
4. User submits search
5. UI shows "Processing..." with status indicator
6. AI Agent begins research (async):
   - Parse product details + image/PDF via vision AI
   - Generate search queries
   - Scrape/API-query multiple sources
   - Qualify companies against fit criteria
   - Compile evidence URLs
   - Generate confidence scores
7. Results appear in real-time (as they complete)
8. User views ranked lead list:
   - Company name, country, website
   - Industry, fit reason
   - Confidence score (0-100%)
   - Evidence URLs (3-5 per lead)
   - Generic contact page URL
9. User filters/sorts results
10. User exports to CSV
11. User bookmarks/shares findings
```

### 2.2 Image/PDF Upload Path

```
1. User uploads manufacturer product sheet (PDF) or product image (PNG/JPG)
2. System extracts:
   - Product name
   - Technical specifications
   - Use cases
   - Industry category
3. UI pre-fills search form with extracted data
4. User refines and submits
5. Search proceeds as Happy Path (step 5+)
```

### 2.3 Saved Searches & History

```
1. User views "Recent Searches" dashboard
2. Previous searches displayed with:
   - Search query
   - Result count
   - Timestamp
   - Export status
3. User clicks search to view/re-run
4. User can modify filters and re-run with same product
5. Results are cached (expires after 30 days)
```

---

## 3. Functional Requirements

### 3.1 Core Features

#### FR-001: Product Input & Parsing
- **Description:** Accept product information via text, image, or PDF upload
- **Details:**
  - Text input: product name (required, 2-100 chars), manufacturer name (optional)
  - Image upload: JPEG/PNG, max 10MB, auto-extract text via Vision AI
  - PDF upload: max 20MB, extract first 5 pages, auto-detect product info
  - Validate inputs for reasonable length and format
- **Out of Scope:** Multi-product uploads in single search (future feature)

#### FR-002: AI Agent Research Pipeline
- **Description:** Multi-stage agent workflow to identify and qualify leads
- **Details:**
  - **Stage 1 - Query Generation:** Extract search terms, use keywords expansion (synonyms, related industries)
  - **Stage 2 - Source Aggregation:** Query Google Search API, LinkedIn Sales Navigator API, industry databases
  - **Stage 3 - Company Qualification:** LLM-based fit scoring against product category and use cases
  - **Stage 4 - Evidence Collection:** Gather URLs proving company relevance (product pages, certifications, case studies)
  - **Stage 5 - Confidence Scoring:** Calculate 0-100% confidence based on match strength + evidence quality
- **Async Processing:** All stages run via Celery; results streamed to frontend via WebSocket

#### FR-003: Lead Ranking & Deduplication
- **Description:** Deduplicate companies and rank by relevance
- **Details:**
  - Deduplicate by domain name + company registration number (if available)
  - Ranking factors: confidence score, company size, recent activity, industry match strength
  - Top 50 results returned (pagination available)
  - Each lead includes: company name, domain, country, industry, website, confidence %

#### FR-004: Lead Intelligence Display
- **Description:** Present comprehensive lead details
- **Details:**
  - **Mandatory fields:** Company name, website, country, industry, fit reason, confidence score
  - **Evidence URLs:** 3-5 most relevant URLs supporting the recommendation (with brief context)
  - **Generic contact:** Link to generic company contact page (not personal email scraping)
  - **Company info:** Employee count (if available), founding year, brief description
  - **Lead type tags:** Primary buyer, Distributor, Integrator, Reseller, Custom manufacturer

#### FR-005: Filters & Sorting
- **Description:** Allow users to refine and organize results
- **Details:**
  - Filter by: Lead type, company size (1-10, 11-50, 51-200, 200+), industry, confidence range
  - Sort by: Relevance (default), Confidence score, Company name, Employee count
  - Save filter presets for repeated queries

#### FR-006: CSV Export
- **Description:** Export lead list in standard B2B format
- **Details:**
  - Columns: Company Name, Website, Country, Industry, Fit Reason, Confidence Score, Evidence URL 1-5, Contact Page, Employee Count
  - Format: UTF-8 encoded, Excel-compatible
  - Timestamp and search query included as metadata in header comments
  - Max 1000 rows per export

#### FR-007: Search History & Caching
- **Description:** Maintain user search history and cache results
- **Details:**
  - Store search queries with results for 30 days
  - Display recent searches with result counts and timestamps
  - Re-run searches with option to refresh data
  - Allow users to delete historical searches

#### FR-008: Team Collaboration
- **Description:** Share searches and results within organization
- **Details:**
  - Generate shareable URLs with read-only access
  - Optional: CSV link generation for easy download sharing
  - View sharing logs (who viewed, when)

---

### 3.2 Backend Processing Requirements

#### FR-009: OpenAI Agent Orchestration
- **Description:** Coordinate multi-step AI research tasks
- **Details:**
  - Use OpenAI Agents SDK for autonomous research agents
  - Agents have access to search APIs and knowledge tools
  - Implement safety guardrails (rate limiting, cost controls)
  - Log all agent actions for transparency + debugging

#### FR-010: Multi-Source Data Integration
- **Description:** Query multiple data sources for lead identification
- **Details:**
  - Google Search API (structured results)
  - LinkedIn Sales Navigator API (company profiles)
  - Industry databases (country-specific business registries)
  - Optional: Crunchbase API for startup data
  - Implement fallback chain if primary source fails

#### FR-011: Vision AI for Document Processing
- **Description:** Extract product details from images and PDFs
- **Details:**
  - Use OpenAI Vision API to analyze product images
  - Extract: product name, technical specs, use cases, industry category
  - For PDFs: convert first 5 pages to images, extract text + analyze
  - Confidence score on extraction (flag low-confidence fields)

#### FR-012: Asynchronous Job Queue
- **Description:** Handle long-running research tasks without blocking UI
- **Details:**
  - Celery + Redis for task queuing
  - Job types: full research, incremental search, refresh, export generation
  - Retry logic (3 attempts) for failed tasks
  - Progress updates via WebSocket (% complete, current stage)

#### FR-013: Result Caching & Optimization
- **Description:** Reduce API calls and improve performance
- **Details:**
  - Cache research results by search query hash (30 days TTL)
  - Cache company data (weekly updates)
  - Cache qualification scores for repeated products
  - Implement cache invalidation on manual refresh

#### FR-014: Compliance & Privacy Filtering
- **Description:** Ensure GDPR-safe data collection and handling
- **Details:**
  - Never scrape personal contact data (names, emails of individuals)
  - Only collect public company-level data (domains, generic contact forms)
  - Implement PII detection to filter out personal data from results
  - Log all data collection for audit compliance
  - Provide data deletion on user request (with 30-day retention)

---

## 4. Non-Functional Requirements

### 4.1 Performance
- **Search Completion:** 95% of searches complete within 60 seconds (Germany market)
- **API Response Time:** <500ms for all synchronous endpoints (excluding research tasks)
- **Database Queries:** <200ms for all queries (with proper indexing)
- **Frontend Load:** Initial page load <3 seconds on 4G connection
- **Concurrent Users:** Support 100+ concurrent searches without degradation

### 4.2 Scalability
- **Horizontal Scaling:** Backend can scale to 10 concurrent research jobs via Celery workers
- **Database:** PostgreSQL with read replicas for reporting queries
- **Storage:** CSV exports up to 100MB (compressed); cleanup after 90 days
- **Future:** Support 50k+ searches/month without infrastructure changes

### 4.3 Reliability & Availability
- **Uptime SLA:** 99.5% availability (excluding scheduled maintenance)
- **Graceful Degradation:** If external API fails, show cached results or limited results
- **Data Backup:** Daily automated backups, 30-day retention
- **Disaster Recovery:** RTO 4 hours, RPO 1 hour

### 4.4 Security
- **Authentication:** OAuth2 (Google/Microsoft for MVP) + username/password fallback
- **Authorization:** Role-based access (user, team admin, super admin)
- **Data Encryption:** TLS 1.3 in transit; AES-256 at rest (sensitive fields)
- **GDPR Compliance:** Data processing agreements, DPA signed with OpenAI/Google
- **Rate Limiting:** 100 searches/user/month (MVP limit), 10 concurrent searches
- **Vulnerability Scanning:** Automated security scans (OWASP Top 10)

### 4.5 Usability
- **Responsive Design:** Mobile-friendly (not mobile-optimized for MVP)
- **Accessibility:** WCAG 2.1 AA compliance (core flows)
- **Onboarding:** <2 minute setup; contextual help for first search
- **Error Messaging:** User-friendly, actionable error messages
- **Localization:** English (de-DE language variant for Germany context in future)

### 4.6 Maintainability
- **Code Quality:** TypeScript strict mode, ESLint, Prettier; Python type hints
- **Test Coverage:** 70% unit tests, 40% integration tests for MVP
- **Logging:** Structured logging (JSON format) for all user actions + errors
- **Documentation:** API docs (OpenAPI/Swagger), deployment guides, troubleshooting runbook
- **Monitoring:** Application Performance Monitoring (APM) with error tracking (Sentry)

---

## 5. Data Model

### 5.1 Core Tables

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  oauth_provider VARCHAR(50), -- 'google', 'microsoft', NULL if password
  oauth_id VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  company_name VARCHAR(255),
  country VARCHAR(2), -- ISO 3166-1 alpha-2
  role VARCHAR(50), -- 'user', 'team_admin', 'super_admin'
  team_id UUID FOREIGN KEY,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMP -- soft delete
);
```

#### teams
```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner_id UUID FOREIGN KEY (users.id),
  max_searches_per_month INT DEFAULT 100,
  searches_used_this_month INT DEFAULT 0,
  country_focus VARCHAR(2) DEFAULT 'DE',
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);
```

#### searches
```sql
CREATE TABLE searches (
  id UUID PRIMARY KEY,
  user_id UUID FOREIGN KEY (users.id) NOT NULL,
  team_id UUID FOREIGN KEY (teams.id),
  product_name VARCHAR(500) NOT NULL,
  manufacturer_name VARCHAR(255),
  product_image_url VARCHAR(500), -- S3 path
  product_pdf_url VARCHAR(500), -- S3 path
  target_country VARCHAR(2) DEFAULT 'DE',
  filters JSONB, -- {lead_type: ['buyer', 'distributor'], company_size: '51-200'}
  status VARCHAR(50), -- 'pending', 'processing', 'completed', 'failed'
  result_count INT,
  query_hash VARCHAR(64), -- SHA256 for deduplication
  cached_from_search_id UUID, -- if result is cached
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  completed_at TIMESTAMP,
  expires_at TIMESTAMP, -- 30 days from creation
  error_message TEXT
);
```

#### leads
```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY,
  search_id UUID FOREIGN KEY (searches.id) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) NOT NULL,
  country VARCHAR(2),
  industry VARCHAR(100),
  industry_category VARCHAR(255), -- standardized taxonomy
  website VARCHAR(500),
  employee_count INT,
  founded_year INT,
  company_description TEXT,
  fit_reason TEXT NOT NULL, -- why this company matches
  confidence_score DECIMAL(5,2), -- 0-100
  lead_type_primary VARCHAR(50), -- 'buyer', 'distributor', 'integrator', 'reseller', 'custom_manufacturer'
  lead_type_secondary VARCHAR(255), -- comma-separated
  evidence_urls JSONB, -- [{url: "", context: ""}, ...]
  contact_page_url VARCHAR(500),
  social_profiles JSONB, -- {linkedin: "", twitter: ""}
  last_verified_at TIMESTAMP,
  data_source VARCHAR(100), -- 'google_search', 'linkedin', 'industry_db'
  raw_data JSONB, -- original enrichment data
  rank INT, -- within search results
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  INDEX (search_id, confidence_score DESC),
  INDEX (domain),
  UNIQUE (search_id, domain)
);
```

#### exports
```sql
CREATE TABLE exports (
  id UUID PRIMARY KEY,
  search_id UUID FOREIGN KEY (searches.id) NOT NULL,
  user_id UUID FOREIGN KEY (users.id),
  file_url VARCHAR(500), -- S3 path
  file_format VARCHAR(10), -- 'csv'
  row_count INT,
  file_size INT, -- bytes
  expires_at TIMESTAMP, -- 90 days
  created_at TIMESTAMP,
  downloaded_count INT DEFAULT 0
);
```

#### audit_logs
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID FOREIGN KEY (users.id),
  action VARCHAR(100), -- 'search_created', 'export_downloaded', 'data_deleted'
  resource_type VARCHAR(50), -- 'search', 'lead', 'export'
  resource_id UUID,
  ip_address VARCHAR(45),
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMP,
  INDEX (user_id, created_at DESC)
);
```

#### search_jobs (for async task tracking)
```sql
CREATE TABLE search_jobs (
  id UUID PRIMARY KEY,
  search_id UUID FOREIGN KEY (searches.id) NOT NULL,
  celery_task_id VARCHAR(255),
  stage VARCHAR(50), -- 'query_generation', 'source_aggregation', 'qualification', 'evidence_collection', 'scoring'
  status VARCHAR(50), -- 'pending', 'running', 'completed', 'failed'
  progress_percent INT,
  details JSONB,
  error_message TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  INDEX (search_id),
  INDEX (celery_task_id)
);
```

### 5.2 Relationships

```
users (1) --- (M) teams
users (1) --- (M) searches
teams (1) --- (M) searches
searches (1) --- (M) leads
searches (1) --- (M) exports
searches (1) --- (M) search_jobs
users (1) --- (M) audit_logs
```

### 5.3 Denormalized/Cache Tables

#### company_enrichment_cache
```sql
CREATE TABLE company_enrichment_cache (
  domain VARCHAR(255) PRIMARY KEY,
  company_name VARCHAR(255),
  country VARCHAR(2),
  employee_count INT,
  founded_year INT,
  industry VARCHAR(100),
  social_profiles JSONB,
  last_updated TIMESTAMP,
  expires_at TIMESTAMP, -- 7 days
  data_source VARCHAR(100)
);
```

---

## 6. API Endpoints

### 6.1 Authentication Endpoints

#### POST /api/v1/auth/register
**Description:** Register new user  
**Request:**
```json
{
  "email": "user@example.com",
  "password": "secure_password",
  "first_name": "John",
  "last_name": "Doe",
  "company_name": "ABC Corp",
  "country": "DE"
}
```
**Response:** 201 Created
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "token": "jwt_token",
  "team_id": "uuid"
}
```

#### POST /api/v1/auth/login
**Description:** Authenticate user  
**Request:** `{ "email": "...", "password": "..." }`  
**Response:** 200 OK `{ "token": "jwt_token", "user": {...}, "team": {...} }`

#### POST /api/v1/auth/oauth/callback
**Description:** OAuth callback handler  
**Query:** `?code=...&provider=google`  
**Response:** 302 Redirect to dashboard with token in URL

#### POST /api/v1/auth/logout
**Description:** Invalidate current session  
**Response:** 204 No Content

---

### 6.2 Search Endpoints

#### POST /api/v1/searches
**Description:** Create new search  
**Request:**
```json
{
  "product_name": "Industrial Temperature Sensor",
  "manufacturer_name": "SensorCorp",
  "target_country": "DE",
  "filters": {
    "lead_type": ["buyer", "distributor"],
    "company_size": "51-200",
    "industry": ["Manufacturing", "Automation"]
  },
  "image_file": null,
  "pdf_file": null
}
```
**Response:** 202 Accepted (async processing)
```json
{
  "search_id": "uuid",
  "status": "processing",
  "message": "Search initiated. Results will appear in real-time.",
  "polling_url": "/api/v1/searches/uuid/results"
}
```

#### GET /api/v1/searches/{search_id}
**Description:** Get search metadata and status  
**Response:** 200 OK
```json
{
  "id": "uuid",
  "product_name": "...",
  "status": "completed",
  "result_count": 42,
  "created_at": "2026-04-28T10:00:00Z",
  "completed_at": "2026-04-28T10:01:30Z",
  "expires_at": "2026-05-28T10:00:00Z"
}
```

#### GET /api/v1/searches/{search_id}/results
**Description:** Get paginated lead results (with real-time streaming via WebSocket alternative)  
**Query:** `?page=1&limit=20&sort=confidence&order=desc&filter_type=buyer`  
**Response:** 200 OK
```json
{
  "search_id": "uuid",
  "total_count": 42,
  "page": 1,
  "limit": 20,
  "results": [
    {
      "id": "uuid",
      "rank": 1,
      "company_name": "Buyer AG",
      "domain": "buyer-ag.de",
      "country": "DE",
      "website": "https://buyer-ag.de",
      "industry": "Manufacturing",
      "fit_reason": "Uses temperature sensors in automated assembly lines",
      "confidence_score": 92,
      "lead_type": "buyer",
      "evidence_urls": [
        { "url": "https://buyer-ag.de/products/assembly", "context": "Product page mentions sensor integration" },
        { "url": "https://buyer-ag.de/certifications", "context": "ISO 9001 certification (quality focus)" }
      ],
      "contact_page_url": "https://buyer-ag.de/contact",
      "employee_count": 150,
      "founded_year": 1995
    }
  ]
}
```

#### GET /api/v1/searches/history
**Description:** Get user's recent searches  
**Query:** `?limit=10`  
**Response:** 200 OK - array of search summaries with result counts

#### DELETE /api/v1/searches/{search_id}
**Description:** Delete search and associated data (for GDPR compliance)  
**Response:** 204 No Content

---

### 6.3 Lead Endpoints

#### GET /api/v1/leads/{lead_id}
**Description:** Get detailed lead information  
**Response:** 200 OK - full lead record with enriched data

#### POST /api/v1/leads/{lead_id}/feedback
**Description:** User provides feedback on lead quality (for model improvement)  
**Request:**
```json
{
  "feedback": "relevant",
  "notes": "Already working with this company"
}
```
**Response:** 200 OK `{ "recorded": true }`

---

### 6.4 Export Endpoints

#### POST /api/v1/searches/{search_id}/export
**Description:** Generate CSV export of search results  
**Request:**
```json
{
  "format": "csv",
  "include_fields": ["company_name", "website", "industry", "confidence_score", "fit_reason", "evidence_urls", "contact_page"]
}
```
**Response:** 202 Accepted
```json
{
  "export_id": "uuid",
  "status": "generating",
  "download_url": "/api/v1/exports/uuid/download"
}
```

#### GET /api/v1/exports/{export_id}/download
**Description:** Download generated CSV  
**Response:** 200 OK - CSV file download

#### GET /api/v1/exports/{export_id}/status
**Description:** Check export generation status  
**Response:** 200 OK `{ "status": "completed", "file_size": 102400 }`

---

### 6.5 Team Endpoints

#### POST /api/v1/teams
**Description:** Create new team (for organizations)  
**Request:** `{ "name": "Sales Team", "max_searches_per_month": 500 }`  
**Response:** 201 Created

#### GET /api/v1/teams/{team_id}/usage
**Description:** Get team usage statistics  
**Response:** 200 OK
```json
{
  "searches_used": 45,
  "searches_limit": 100,
  "searches_remaining": 55,
  "export_count": 12,
  "team_members": 3
}
```

---

### 6.6 Admin Endpoints

#### GET /api/v1/admin/analytics
**Description:** System-wide usage analytics (super_admin only)  
**Query:** `?period=month&metric=searches`  
**Response:** 200 OK - aggregated metrics

#### POST /api/v1/admin/data-deletion
**Description:** Trigger GDPR data deletion request  
**Request:** `{ "user_id": "uuid", "reason": "user_request" }`  
**Response:** 202 Accepted - async deletion job

---

## 7. Agent Workflow

### 7.1 Multi-Agent Architecture

```
User Search Request
        ↓
┌─────────────────────────────────────────┐
│  Product Parser Agent                   │
│  - Extract product name, specs          │
│  - Identify industry category           │
│  - Generate search keywords             │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  Query Expansion Agent                  │
│  - Generate synonyms & related terms    │
│  - Map to industry database terms       │
│  - Create multi-language queries (DE)   │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  Research Agent (Parallel Sources)      │
│  ├─ Google Search Agent                 │
│  ├─ LinkedIn Sales Navigator Agent      │
│  ├─ Industry Database Agent             │
│  └─ Competitor Analysis Agent           │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  Data Aggregation Agent                 │
│  - Deduplicate companies                │
│  - Merge data from sources              │
│  - Enrich with cached data              │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  Qualification Agent                    │
│  - Score fit (LLM-based analysis)       │
│  - Assess buyer likelihood              │
│  - Flag false positives                 │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  Evidence Collection Agent              │
│  - Gather supporting URLs               │
│  - Extract relevance context            │
│  - Verify company data freshness        │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  Ranking & Confidence Scoring Agent     │
│  - Calculate confidence (0-100%)        │
│  - Rank by relevance                    │
│  - Prepare final output                 │
└──────────────┬──────────────────────────┘
               ↓
         Final Lead List
```

### 7.2 Agent Specifications

#### Product Parser Agent
**Role:** Extract and normalize product information  
**Input:** product_name, manufacturer_name, image (optional), pdf (optional)  
**Output:** normalized_product_name, industry, use_cases, key_specs  
**Tools:**
- Vision API (image/PDF analysis)
- LLM (OCR and parsing)

**Constraints:**
- Timeout: 10 seconds
- Max image size: 10MB
- Output confidence threshold: >70%

---

#### Research Agent (Multi-Source)
**Role:** Discover potential buyer companies across multiple data sources  
**Input:** product_name, industry, search_keywords, target_country  
**Output:** list of companies with basic info (name, domain, country, source)  
**Tools:**
- Google Search API
- LinkedIn Sales Navigator API
- Industry-specific business registries
- Company databases (enrichment)

**Constraints:**
- Per-source API rate limits
- Max 5 concurrent source queries
- Deduplicate by domain
- Timeout per source: 15 seconds
- Max results per source: 100 companies

**Search Strategy (Germany):**
- German language queries: "Hersteller von [Produkt]", "Importeur [Produkt]", etc.
- Industry-specific searches: "Automatisierungslösung Integrator"
- Regulatory databases: Handelsregister, Chamber of Commerce listings

---

#### Qualification Agent
**Role:** Score companies for buyer/user likelihood  
**Input:** company_name, domain, industry, description, product_context  
**Output:** fit_score (0-100), lead_type, reasoning  
**Tools:**
- LLM-based text analysis
- Scoring rubric engine
- Rule-based filters

**Scoring Rubric:**
- Industry match (40%): Does their industry use this product type?
- Company size fit (20%): Are they large enough to be a real buyer?
- Geographic fit (15%): Are they in target country/region?
- Activity signals (15%): Recent web updates, hiring, expansion in space?
- Confidence signals (10%): How verified is the data?

**Confidence Thresholds:**
- ≥75% = High confidence (include)
- 50-74% = Medium confidence (include with disclaimer)
- <50% = Low confidence (exclude)

---

#### Evidence Collection Agent
**Role:** Find URLs proving company's relevance and buyer status  
**Input:** company_name, domain, product_context  
**Output:** evidence_urls (3-5), context for each URL  
**Tools:**
- Reverse web scraping (company website analysis)
- Google Site Search API
- LinkedIn company pages
- Press release aggregators
- Industry database searches

**Evidence Types (Priority Order):**
1. Product/solution pages matching product category
2. Customer case studies or testimonials mentioning product use
3. Certifications/compliance (e.g., ISO standards indicating quality focus)
4. Job postings for related roles (e.g., "Integration Engineer")
5. Recent press releases about new products/partnerships

**Constraints:**
- Only public, company-level pages (no PII)
- Verify URLs are live (404 check)
- Timeout: 20 seconds
- Min 1 evidence URL, max 5

---

#### Ranking & Confidence Agent
**Role:** Calculate final confidence scores and rank results  
**Input:** all lead data, qualification scores, evidence count, data sources  
**Output:** final_confidence (0-100), rank  
**Scoring Formula:**

```
confidence = (
  qualification_score × 0.5 +
  evidence_count_normalized × 0.2 +
  data_freshness_score × 0.15 +
  source_reliability_score × 0.15
)
```

**Freshness Score:**
- Data <1 week old: 100%
- 1-4 weeks: 80%
- 4-12 weeks: 60%
- >3 months: 40%

**Source Reliability (normalized to 0-100):**
- LinkedIn verified profile: 90%
- Industry registry (Handelsregister): 95%
- Google Business verified: 85%
- Web search: 70%

---

### 7.3 Error Handling & Fallbacks

```
Research Phase Errors:
- API timeout → Try next source
- Rate limit → Queue for retry after delay
- No results from primary source → Cascade to secondary
- All sources fail → Return cached data if available
- No cache available → Return partial results with error notice

Qualification Errors:
- LLM call fails → Use rule-based fallback
- Unclear industry match → Mark as requires_review, include with lower score
- Timeout → Skip qualification, include company at 50% default score

Evidence Collection Errors:
- No evidence found → Include company with confidence penalty
- All verification URLs fail → Use cached evidence if <7 days old
- PII detection triggered → Exclude URL, log incident

Export Errors:
- DB query fails → Return 500, retry job
- S3 upload fails → Retry, then notify user
```

### 7.4 Concurrency & Performance

**Default Settings:**
- Max concurrent searches: 10 per user, 100 per system
- Max concurrent research agents: 5 per search
- Search completion target: <60 seconds (Germany market)
- Real-time progress: WebSocket updates every 5 seconds

**Scaling Strategy:**
- Celery worker pool: Start with 4 workers, scale to 10 based on queue depth
- Queue monitoring: If queue depth >100 jobs, alert ops
- Rate limiting: Respect API provider limits; queue excess

---

## 8. Compliance Requirements

### 8.1 GDPR Compliance

#### Data Collection Principles
- **Lawful Basis:** Legitimate interest (B2B company lead generation)
- **Data minimization:** Collect only company-level, publicly available data
- **Purpose limitation:** Use data solely for lead identification; no personal profiling
- **Consent:** User consent required for processing (checkbox at signup)

#### User Rights
- **Right of access:** Users can download their data (Celery async job)
- **Right to delete:** 30-day retention, automatic deletion; on-demand deletion
- **Right to rectification:** Users can flag incorrect leads
- **Right to portability:** CSV export includes all user search history

#### Data Processing Agreement (DPA)
- Signed DPA with OpenAI (LLM API calls)
- Signed DPA with Google (Search + Vision APIs)
- Signed DPA with LinkedIn (Sales Navigator API)
- Data processor audit rights included

#### Technical Safeguards
- Encryption at rest (AES-256) for sensitive data
- TLS 1.3 for all data in transit
- Access controls: Role-based (RBAC)
- Audit logging: All user actions logged with timestamps
- Data isolation: Separate databases per tenant (future multi-tenancy)

---

### 8.2 Data Privacy (Country-Specific)

#### Germany (Initial Market)
- **Compliance:** GDPR + German BDSG (Federal Data Protection Act)
- **Personal Contact Scraping:** PROHIBITED — system designed to avoid this
- **Business Register Access:** Legal for publicly registered data (Handelsregister)
- **Localization:** Consider data residency in EU (Frankfurt region for AWS/Azure)

#### Future Markets
- **France:** CNIL approval if hosted/processing French data
- **Italy:** GDPA + local regulations
- **UK:** Post-Brexit GDPR equivalent

---

### 8.3 Anti-Spam Compliance

#### CAN-SPAM / GDPR Email Rules
- Users must obtain consent before emailing leads (not in scope for MVP)
- System only provides contact pages; does not send emails on user's behalf
- Future: Implement "confirm subscription" flow for lead contact

#### LinkedIn Terms
- Sales Navigator API usage restricted to lead generation (no data sale)
- No personal scraping from LinkedIn profiles
- Respect LinkedIn's restriction on commercial use of profile data

---

### 8.4 Regulatory Disclosure

#### Transparency Requirements
1. **Privacy Policy:** Disclose data collection, retention, usage
2. **Terms of Service:** Clarify user responsibilities (don't use for spam, etc.)
3. **API Source Disclosure:** Inform users which data sources were queried
4. **AI Disclosure:** Disclose AI-based ranking and decision-making
5. **Data Retention:** Clear 30-day retention and deletion timeline

#### Audit Requirements
- Quarterly data protection impact assessments (DPIA)
- Annual SOC 2 Type II compliance audit (future at scale)
- Incident response plan (data breach notification <72 hours)

---

## 9. MVP Acceptance Criteria

### 9.1 Core Functionality Criteria

**AC-001: Product Search Completion**
- User can submit search with product name + target country
- Search completes within 60 seconds
- Minimum 10 qualified leads returned
- ✅ MUST PASS for MVP release

**AC-002: Lead Data Quality**
- Each lead includes: company name, domain, country, industry, confidence score, fit reason, 3+ evidence URLs
- Confidence scores are reproducible (same search = same scores within ±5%)
- ✅ MUST PASS for MVP release

**AC-003: Deduplication**
- No duplicate companies in single search results
- Deduplication by domain + optional company registry number
- ✅ MUST PASS for MVP release

**AC-004: CSV Export**
- Export contains all required fields
- File is UTF-8 encoded and Excel-compatible
- ≤30 second generation time for 50-lead export
- ✅ MUST PASS for MVP release

**AC-005: Image/PDF Upload**
- User can upload JPEG/PNG/PDF files
- System extracts product name with ≥70% accuracy
- Extracted data pre-fills search form
- ✅ NICE TO HAVE for MVP (can defer if complex)

**AC-006: Authentication**
- User can register with email/password
- User can log in and access previous searches
- Session persists for 7 days
- ✅ MUST PASS for MVP release

**AC-007: Search History**
- User can view recent searches (last 10)
- Clicking previous search shows cached results
- Cache expires after 30 days
- ✅ NICE TO HAVE for MVP v1.0

**AC-008: Rate Limiting**
- System prevents abuse (max 100 searches/month/user)
- User receives clear message when limit reached
- ✅ MUST PASS for MVP release

---

### 9.2 Performance Criteria

**AC-009: API Response Time**
- Synchronous endpoints: <500ms (p95)
- Database queries: <200ms (p95)
- Frontend initial load: <3 seconds on 4G
- ✅ MUST PASS for MVP release

**AC-010: Concurrent Users**
- System handles 10 concurrent searches without errors
- No response time degradation at 10 concurrent users
- ✅ MUST PASS for MVP release

**AC-011: Search Result Delivery**
- First results appear within 10 seconds of search submission
- All results complete within 60 seconds
- 95% of searches meet this SLA
- ✅ MUST PASS for MVP release

---

### 9.3 Compliance Criteria

**AC-012: GDPR Compliance**
- System collects only public company data (no PII scraping)
- Privacy policy is published and accepted by users
- Data deletion works within 7 days of request
- Audit log records all user actions
- ✅ MUST PASS for MVP release

**AC-013: Data Security**
- All passwords are hashed with bcrypt (salt rounds ≥10)
- API uses HTTPS/TLS 1.3
- Sensitive data encrypted at rest (AES-256)
- ✅ MUST PASS for MVP release

**AC-014: Terms of Service**
- User must accept ToS before using system
- ToS explicitly prohibits using leads for spam
- ToS includes data retention and deletion terms
- ✅ MUST PASS for MVP release

---

### 9.4 User Experience Criteria

**AC-015: Onboarding**
- New user can complete first search in <5 minutes
- Contextual help is available for search form
- Error messages are clear and actionable
- ✅ MUST PASS for MVP release

**AC-016: Mobile Responsiveness**
- UI is usable on tablet (1024px width)
- Mobile (375px) is functional but not optimized
- ✅ NICE TO HAVE for MVP (mobile optimization future)

**AC-017: Export Usability**
- CSV is immediately usable in Excel without reformatting
- Column headers are descriptive
- Data is properly escaped (quotes, commas)
- ✅ MUST PASS for MVP release

---

### 9.5 Logging & Monitoring Criteria

**AC-018: Error Tracking**
- All errors are logged with stack traces
- User-facing errors are tracked in Sentry
- Critical errors trigger alerts to ops
- ✅ MUST PASS for MVP release

**AC-019: Performance Monitoring**
- API endpoint response times are tracked
- Search completion times are tracked
- Database query times are tracked
- ✅ MUST PASS for MVP release

**AC-020: Audit Logging**
- All search creations are logged
- All exports are logged
- All data deletions are logged
- All logins are logged
- ✅ MUST PASS for MVP release

---

## 10. Out-of-Scope Items

### 10.1 Explicitly Out of Scope (Post-MVP)

**Personal Contact Scraping**
- MVP does NOT scrape personal emails/phone numbers
- System provides generic company contact pages only
- Future feature: LinkedIn Sales Navigator integration for personal contacts (with compliance review)

**Multi-Product Searches**
- Single search per product name
- Batch uploads (10+ products) deferred to v1.5
- API bulk endpoint deferred to v2.0

**Advanced Filtering**
- Revenue range filtering (future)
- Credit score / company health filtering (future)
- Custom scoring rules (future)

**Localization Beyond Germany**
- MVP focused on German market only
- Language support: English only (German context in data)
- Multi-language support deferred to v1.2

**Mobile Optimization**
- Tablet support sufficient for MVP
- Native mobile apps (iOS/Android) deferred to v2.0

**Real-Time Notifications**
- Email alerts on search completion deferred to v1.1
- Slack/Teams webhook integration deferred to v1.5

**Team Management UI**
- API endpoints for team creation exist
- Admin dashboard for team management deferred to v1.3

**Custom Integrations**
- CRM integrations (Salesforce, HubSpot) deferred to v1.5
- Zapier/Make.com integration deferred to v1.5

**Advanced Analytics**
- Lead quality feedback loop deferred to v1.2
- Conversion tracking (which leads converted to customers) deferred to v2.0
- Search performance analytics deferred to v1.3

**Payment & Subscription**
- No payment processing in MVP (pre-launch deal or trial only)
- Subscription tiers deferred to v1.0 launch
- Usage-based billing deferred to v1.2

**White-Label / API Access**
- Public API restricted to internal use
- White-label offerings deferred to v2.0
- Reseller program deferred to v2.0

**Support Features**
- Live chat support not in MVP (email support only)
- Knowledge base deferred to v1.1
- Onboarding videos deferred to v1.1

---

### 10.2 Technical Out-of-Scope

**Multi-Tenancy**
- Single-tenant architecture for MVP
- Database-per-tenant isolation deferred to v2.0

**Internationalization (i18n)**
- English UI only
- German translations deferred to v1.2

**GraphQL API**
- REST API only for MVP
- GraphQL endpoint deferred to v2.0

**Advanced Caching (Redis beyond Celery)**
- Query result caching via database TTL
- Redis caching beyond Celery deferred to v1.5

**Machine Learning Model Fine-Tuning**
- Uses OpenAI GPT-4 / agents out-of-box
- Custom model training deferred to v2.0

**Data Export to External Warehouses**
- CSV export only
- BigQuery/Snowflake integration deferred to v2.0

---

## 11. Future Roadmap

### 11.1 Post-MVP Iterations (v1.0 - 1.5)

#### v1.0 (Public Launch - Q3 2026)
- **Payment Integration:** Stripe for subscription billing
- **Subscription Tiers:** Starter (50 searches/mo), Professional (500/mo), Enterprise (unlimited)
- **Advanced Filters:** By company size, revenue, employee count
- **Lead Quality Feedback:** Users rate lead relevance; data improves model
- **Email Export Notifications:** Automated email when export is ready
- **Search Refinement UI:** Edit search parameters and re-run

**Target:** 500+ active users, 10k+ searches/month, break-even on API costs

---

#### v1.1 (Q4 2026)
- **Market Expansion:** France, Italy, UK (GDPR-compliant localization)
- **Email Alerts:** Notify user when search completes
- **Saved Filters & Presets:** Users create reusable search templates
- **Knowledge Base:** Self-serve documentation and FAQ
- **Search Analytics Dashboard:** Conversion metrics, lead quality trends
- **Admin Dashboard (Basic):** Usage analytics, user management

**Target:** 2000+ active users, 50k+ searches/month

---

#### v1.2 (Q1 2027)
- **Personal Contact Integration:** Optional personal email/phone discovery (with compliance)
- **CRM Integration:** Salesforce, HubSpot lead sync
- **Bulk Search API:** Process 10-100 products in batch
- **Mobile App (iOS/Android):** Native apps for iOS/Android
- **Slack Bot:** Search and export directly from Slack
- **Internationalization:** German, French, Italian UI translations

**Target:** 5000+ active users, 200k+ searches/month

---

#### v1.5 (Q2 2027)
- **Custom Scoring Rules:** Users define scoring weights
- **AI Model Fine-Tuning:** Train on user feedback data
- **Advanced Webhooks:** Real-time lead notifications
- **Data Enrichment Marketplace:** Third-party data providers (credit scores, tech stacks, etc.)
- **White-Label API:** Agencies can resell platform under their brand
- **Advanced Admin Portal:** Team management, audit logs, usage controls

**Target:** 10,000+ active users, 500k+ searches/month, $100k+ MRR

---

### 11.2 Long-Term Vision (v2.0+)

#### v2.0 (2028) - Platform Expansion
- **Global Market Coverage:** 50+ countries with regional business databases
- **Proprietary ML Models:** Fine-tuned language models for lead scoring
- **Real-Time Data Sync:** Continuous monitoring of leads for relevance updates
- **Enterprise Features:** SSO (SAML/OIDC), advanced permissions, data residency options
- **GraphQL API:** Modern API for advanced clients
- **Custom Integrations:** Build marketplace for third-party extensions

#### Vision
- Become the market-leading B2B lead intelligence platform for manufacturers and distributors
- Serve 50,000+ enterprises globally
- $10M+ ARR by 2028

---

## 12. Success Metrics & KPIs

### 12.1 User Acquisition
- **Month 1 (MVP):** 50 active users (closed beta)
- **Month 3:** 500 active users
- **Month 6:** 2,000 active users
- **Year 1:** 10,000 active users

### 12.2 Engagement
- **Avg. searches/user/month:** 20 (Starter users)
- **Repeat usage rate:** 60% (users search >1x per month)
- **Export rate:** 70% of searches result in CSV export

### 12.3 Product Quality
- **Lead accuracy (surveyed):** 75%+ rated "high quality" or "very high quality"
- **Confidence score correlation:** User feedback matches predicted confidence (R² >0.7)
- **Search completion SLA:** 95% <60 seconds

### 12.4 Business Metrics
- **ARPU (avg revenue per user):** $50/mo (Starter), $400/mo (Professional)
- **Churn rate:** <5% monthly (goal)
- **NPS (Net Promoter Score):** >50 by Month 6
- **CAC (customer acquisition cost):** <$100 (goal)

---

## 13. Risk Mitigation

### 13.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| API rate limits (Google, LinkedIn) | High | Medium | Implement queue, fallback sources, cached results |
| LLM hallucinations (false leads) | High | Medium | Qualification threshold (≥50%), evidence requirement, user feedback loop |
| Data freshness issues | Medium | Medium | Weekly enrichment cache refresh, verify URLs live |
| Search performance >60s | Medium | High | Timeout graceful degradation, parallel source queries, caching |
| GDPR compliance violations | Low | Critical | Legal review, DPA signed, PII detection, audit logging |

### 13.2 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Low user adoption | Medium | High | Product validation, early user interviews, pricing flexibility |
| Competitor emerges | Medium | Medium | Differentiate on accuracy + multi-market support, build moat via data |
| API pricing increases | Medium | Medium | Negotiate volume discounts, evaluate alternative sources, build cached data |
| Regulatory changes (GDPR tightening) | Low | High | Monitor EU regulations, legal counsel retainer, flexible architecture |

---

## 14. Appendices

### A. Glossary

| Term | Definition |
|------|-----------|
| **B2B Lead** | A company that is a potential buyer, user, distributor, or integrator of a product |
| **Confidence Score** | 0-100% score indicating likelihood that a lead is a true buyer of the product |
| **Evidence URL** | Public web page supporting the lead's relevance (product page, case study, etc.) |
| **Fit Reason** | Human-readable explanation of why company matches product category |
| **Lead Type** | Category of relationship: Buyer, Distributor, Integrator, Reseller, Custom Manufacturer |
| **PII** | Personally Identifiable Information (names, personal emails, phone numbers) |
| **Qualification** | Process of scoring and filtering companies by buyer likelihood |
| **GDPR** | General Data Protection Regulation (EU privacy law) |
| **DPA** | Data Processing Agreement (legal contract for data handling) |

### B. Example Search Scenarios

#### Scenario 1: Industrial Temperature Sensors
**User:** Sales VP at SensorCorp  
**Input:** Product: "Temperature Transmitter 4-20mA", Manufacturer: "SensorCorp", Country: "Germany"  
**Expected Output:**
- 15-20 leads (automation companies, manufacturing plants, integrators)
- Confidence scores 70-95%
- Evidence URLs: Product integrations, certifications (ISO 9001), case studies
- Contact pages: Generic contact forms for outreach
- Export: CSV for sales team outreach campaign

---

#### Scenario 2: Software Integration (SaaS)
**User:** BD Manager at ERP Platform  
**Input:** Product: "ERP System Module API", Manufacturer: "ERPCorp", Country: "Germany"  
**Expected Output:**
- 10-15 leads (consulting firms, system integrators, mid-market companies)
- Confidence scores 60-85%
- Evidence URLs: Integration partner pages, blog posts about ERP, tech stacks
- Lead types: Integrator, Consultant, Custom Developer
- Export: For partnership outreach

---

### C. API Rate Limits & Quotas (MVP)

| Resource | Limit | Reasoning |
|----------|-------|-----------|
| Searches/user/month | 100 | Fair-use limit to control API costs |
| Concurrent searches | 10 per system | Prevent resource exhaustion |
| Search timeout | 60 seconds | Balance completeness vs. user experience |
| CSV export size | 1000 rows | Memory/storage efficiency |
| Image upload size | 10MB | Storage efficiency |
| PDF upload size | 20MB | Processing efficiency |
| Database retention | 30 days | Privacy + storage cost |
| Export retention | 90 days | Compliance + user convenience |

---

### D. Technology Stack Rationale

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Frontend | Next.js + TypeScript | Type safety, SSR for SEO, fast development, great DX |
| Backend | FastAPI + Python | Rapid prototyping, excellent AI/ML libraries, async by default |
| Database | PostgreSQL | ACID compliance, rich data types (JSONB), proven reliability |
| Queuing | Celery + Redis | Industry standard for Python async, horizontal scaling |
| LLM | OpenAI Agents SDK | Production-ready, no model fine-tuning needed for MVP |
| Search | Multi-source API abstraction | Flexibility to add/swap sources, reduce vendor lock-in |
| Deployment | Docker Compose (MVP) → Kubernetes | Fast MVP iteration, scales to production |
| Monitoring | Sentry + APM | Production-grade error tracking and performance insights |

---

## 15. Document Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-28 | Product Team | Initial MVP PRD |

---

**END OF DOCUMENT**

---

**Approval Sign-off:**

- [ ] Product Manager Approval
- [ ] Engineering Lead Approval
- [ ] Legal/Compliance Review
- [ ] CFO/Finance Approval (for budget)
- [ ] Executive Sponsor Approval

**Next Steps:**
1. Circulate PRD for stakeholder review (3 days)
2. Conduct engineering estimation session (planning poker)
3. Create Jira epics and stories from functional requirements
4. Set up development environment and CI/CD pipeline
5. Begin Phase 1: Core search and ranking (2-week sprint)
