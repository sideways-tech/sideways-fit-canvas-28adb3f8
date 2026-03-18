

## Problem

You need to support **multiple interview rounds** for the same candidate — different interviewers filling out separate assessment sheets — while treating each candidate as a single entity in the system. This has both frontend and backend implications.

## Data Model Design

The core idea: **separate the candidate from the assessment**.

```text
┌─────────────┐       ┌──────────────────────┐
│  candidates │       │    assessments        │
├─────────────┤       ├──────────────────────┤
│ id (PK)     │──┐    │ id (PK)              │
│ name        │  │    │ candidate_id (FK)     │
│ email       │  └───>│ round_number (1,2,3…) │
│ role        │       │ interviewer_name      │
│ department  │       │ all scores & notes…   │
│ website     │       │ verdict               │
│ education   │       │ created_at            │
│ hiring_level│       └──────────────────────┘
│ created_at  │
└─────────────┘
```

- **One row per candidate** — deduplicated by name+role (or email if you add it later).
- **One row per assessment** — each interview round is a separate assessment linked to that candidate.
- `round_number` auto-increments per candidate (Round 1, Round 2, etc.).

## Frontend Changes

1. **Add a "Round" field** to the candidate info section — a read-only or manually selectable number (1, 2, 3, 4, 5) shown after the Interviewer Name field. Label: "Interview Round".

2. **Candidate lookup/autocomplete** (future, when backend exists): When the interviewer types a candidate name, if that candidate already exists, auto-populate their details (role, department, level, etc.) and auto-set the round number to the next available round. For now (no backend yet), this will just be a manual dropdown.

3. **Add `interviewRound`** to the `FormState` interface as a number field.

## What This Enables Later (Backend Phase)

When you add a backend (Lovable Cloud / Supabase / Google Sheets):
- The **dashboard** shows one row per candidate with expandable rounds underneath.
- Each round shows: interviewer, date, scores, verdict.
- You can compare how different interviewers scored the same candidate across rounds.
- The "overall" candidate decision aggregates across rounds.

## Implementation Scope (Frontend Only, For Now)

Since there's no backend yet, the immediate change is straightforward:
- Add `interviewRound: number` to `FormState` (default: `1`).
- Add a dropdown in the candidate info card (after Interviewer Name) with options Round 1 through Round 5.
- This field will be persisted to the database when the backend is built.

This is a small, clean change — one new field in the interface and one new `<Select>` in the form grid.

