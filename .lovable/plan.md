# Personal T-Shape: persist & feed into downstream scoring

We already capture every input needed for a Personal T-Shape — we just don't derive, persist, or use it. This plan adds a Personal T alongside the Professional T, stores its components on the assessment row, and threads both Ts through the scoring and verdict logic.

## Rubric

Both Ts use the same 0–100 scale and the same status thresholds (≥60 strong, ≥40 emerging) so they read consistently.

**Professional T** (unchanged values):
- Depth = `depth_of_craft`
- Breadth = `professional_breadth`

**Personal T** (derived from Section B inputs we already capture):
- Personal Depth = `depth_score` (Non-Work Obsession Level). If `depth_topic` is blank, treat as 0 — mirrors current Scores Summary gating.
- Personal Breadth = rounded average of `reads_widely`, `interested_in_others`, `aesthetics_interest`. These three already represent breadth-of-life signals (range of curiosity, empathy for others, aesthetic range).

These are deterministic from existing fields, so no new interviewer inputs are required.

## Backend changes (single migration)

Add two stored columns on `public.assessments` so the Personal T travels with the record and can be queried/reported on:

- `personal_depth_score integer` — copy of `depth_score` at save time (kept as its own column for symmetry with `depth_of_craft` and to avoid joining logic elsewhere).
- `personal_breadth_score integer` — computed average of the three Section B sliders at save time.

Both default to 0, nullable false. Backfill existing rows in the same migration:

```sql
UPDATE public.assessments
SET personal_depth_score = COALESCE(depth_score, 0),
    personal_breadth_score = ROUND(
      (COALESCE(reads_widely,0) + COALESCE(interested_in_others,0) + COALESCE(aesthetics_interest,0)) / 3.0
    );
```

No new tables, no RLS/GRANT changes (existing assessment policies cover the new columns).

## Frontend / scoring changes

1. **`TShapeVisualizer.tsx`** — add an optional `title` prop ("Professional" / "Personal") shown as a small label above the T. Same bars/status.

2. **`ScoresSummary.tsx`** — compute personal depth/breadth from props and render the two Ts in a side-by-side grid (`grid-cols-1 md:grid-cols-2 gap-4`, stack on mobile). Container shrunk so both fit.

3. **`SidewaysInterviewCanvas.tsx`**
   - Derive `personalDepth` and `personalBreadth` in `calculateCategoryScores` and `calculateVerdict`.
   - **Score change**: today `person` is the simple average of 4 Section B fields. Replace it with `round((personalDepth + personalBreadth) / 2)` so the Person score and the Personal T agree by construction. (Same inputs, just grouped through the T rubric — overall weighting stays 25/40/35.)
   - **Verdict floors** — add Personal T floors mirroring the existing Professional T floors so both Ts gate positive verdicts:
     - `personalDepth < 15` → `strong-no`
     - `personalDepth < 30` → `lean-no`
     - `personalBreadth < 20` → `lean-no`
   - On save, write `personal_depth_score` and `personal_breadth_score` alongside the existing fields.

4. **`AssessmentReport.tsx`** — render the Personal T next to the Professional T using the stored columns, and add a "Personal T-Shape" status line so reports reflect both.

## Downstream consistency

Because personal scores are derived from already-captured inputs and stored on the row, every downstream surface (verdict, reporting, future analytics/exports) reads the same numbers the interviewer saw at save time. No data migration risk: backfill formula matches the live derivation.

## Out of scope

- No new interviewer inputs or sliders.
- No changes to email templates or KRA logic.
- No change to the Mindset act or its weights.
