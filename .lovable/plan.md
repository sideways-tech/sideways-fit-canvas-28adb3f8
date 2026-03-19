

# KRA Reference Block -- Architecture Discussion & Plan

## Understanding the Data

The uploaded Excel shows a structured KRA matrix for the **Servicing** discipline with:
- **8 KRA categories** (e.g., "Accurate Project Planning", "Brand & Business Understanding", "Team Management")
- Each KRA has **multiple Sub-KRAs**
- Each Sub-KRA has **level-specific descriptions** across L1-L6 (sometimes L7)
- A "Sideways Person" section with universal traits

You currently have 6 disciplines: Strategy, Creative, Copy, Tech/UX, Product Design, Servicing. Each will have its own KRA sheet. You plan to add 2-3 more disciplines next month.

---

## Approach: Excel Ingestion vs. Live Google Sheets

### Option A: Excel Ingestion into Database

| Aspect | Detail |
|---|---|
| **How it works** | Upload Excel via an admin page, parse it, store in a `kra_definitions` table. The interview form queries this table. |
| **Pros** | Fast queries, no external dependency, works offline, no API key needed, data is versioned via migrations, full control over schema |
| **Cons** | Requires re-upload when data changes (but you said ~once/year) |
| **Adding disciplines** | Upload a new Excel file for each new discipline via the admin page |

### Option B: Live Google Sheets

| Aspect | Detail |
|---|---|
| **How it works** | Store a Google Sheets URL per discipline. An edge function fetches and parses the sheet on demand (or caches it). |
| **Pros** | Edit data in Google Sheets without touching the app |
| **Cons** | Requires Google API connector or public sheet links, adds latency, fragile if sheet structure changes, cache invalidation complexity, external dependency for a core feature |
| **Adding disciplines** | Add a new sheet URL to config |

### Recommendation: **Option A (Excel Ingestion)**

Given that updates happen at most once a year and you're adding only 2-3 disciplines, the overhead of re-uploading is negligible. The reliability, speed, and simplicity of having the data in your own database far outweigh the convenience of live sheets. You already have an admin dashboard pattern in the app.

---

## Implementation Plan

### 1. Database: `kra_definitions` table

```text
kra_definitions
├── id (uuid, PK)
├── discipline (text) -- e.g. "servicing", "strategy"
├── kra_name (text) -- e.g. "Accurate Project Planning"
├── kra_order (int) -- display ordering
├── sub_kra_name (text) -- e.g. "Accurate scope determination"
├── sub_kra_order (int)
├── level (text) -- "L1" through "L7"
├── description (text) -- the cell content
├── created_at (timestamptz)
```

One row per discipline + KRA + Sub-KRA + level combination. "Sideways Person" traits stored as a special discipline value `"_sideways_person"` so they appear universally.

### 2. Edge Function: Parse Excel

An edge function (`parse-kra-excel`) that:
- Accepts an uploaded Excel file + discipline name
- Parses the standardized table structure (columns: KRA, Sub-KRA, L1-L6/L7)
- Upserts rows into `kra_definitions`, replacing old data for that discipline

### 3. Admin Page: KRA Upload (`/kra-admin`)

- Dropdown to select discipline (or add new)
- File upload for the Excel
- Shows current KRA data per discipline in a table
- "Replace" button that calls the edge function

### 4. KRA Reference Block (new UI component)

Positioned between the header card and "Block A" in the interview form:
- Only shows when both **Department** and **Hiring Level** are selected
- Queries `kra_definitions` for the selected discipline + level
- Displays an accordion or collapsible card per KRA category
- Each KRA expands to show its Sub-KRAs with the level-specific description
- "Sideways Person" traits always appended at the bottom
- Read-only reference panel with a distinct visual style (e.g., light background, reference icon)

### 5. Files to Create/Modify

| File | Action |
|---|---|
| `supabase/migrations/xxx_create_kra_definitions.sql` | New table + RLS |
| `supabase/functions/parse-kra-excel/index.ts` | Excel parser edge function |
| `src/components/KraReferenceBlock.tsx` | New accordion-based reference UI |
| `src/pages/KraAdmin.tsx` | Admin upload page |
| `src/components/SidewaysInterviewCanvas.tsx` | Insert KRA block between header and Block A |
| `src/App.tsx` | Add `/kra-admin` route |

