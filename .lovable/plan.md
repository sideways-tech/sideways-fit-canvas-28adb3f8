## Goal
Produce a single downloadable `backup.zip` containing a full snapshot of your Lovable Cloud backend — database and storage files — without modifying or deleting anything.

## What the backup will include

1. **Database dump** (`database/`)
   - `schema.sql` — full schema (tables, functions, policies, triggers, enums) for the `public` schema
   - `data/<table>.csv` — one CSV per public table (assessments, candidates, super_admins, kra_definitions, etc.)
   - `data/<table>.json` — same data as JSON for easier re-import
   - `manifest.json` — table list, row counts, timestamp

2. **Storage files** (`storage/`)
   - `cvs/` — every object in the `cvs` bucket, preserving folder structure and original filenames
   - `manifest.json` — list of objects with sizes, content-types, and original paths

3. **Top-level**
   - `README.md` — what's inside, how to restore, timestamp, project ref
   - `backup.zip` delivered as a downloadable artifact

## How it will run (read-only)

- Use `psql` via the existing `PG*` env vars to `\copy` each public table to CSV — no writes, no locks beyond a read transaction.
- List tables via `information_schema` and iterate; skip `auth`, `storage`, `pgmq`, and other managed schemas.
- For storage, list objects in the `cvs` bucket via the Supabase storage API using the anon/service context already available to the sandbox, then download each via signed URLs. No deletes, no uploads.
- Zip everything into `/mnt/documents/backup-YYYYMMDD-HHMM.zip` and surface it with a `presentation-artifact` tag.

## Out of scope

- Auth users (`auth.users`) — managed schema, not exportable from the app side. If you need these, do it from the Cloud dashboard.
- Edge function source code — already in your repo under `supabase/functions/`.
- Secrets — never exported.

## Notes

- Backup is a point-in-time snapshot; long-running writes during export may not be captured.
- For very large `cvs` buckets, the zip may be sizable; I'll report the final size.
- Re-running creates a new timestamped zip, never overwriting prior ones.

Approve and I'll generate it.