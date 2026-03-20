

## Three Changes

### 1. Default all sliders to 0

In `src/components/SidewaysInterviewCanvas.tsx`, change the initial `FormState` values from `30` to `0` for these fields (lines 165–180):
- `interestedInOthers`: 30 → 0
- `readsWidely`: 30 → 0
- `depthOfCraft`: 30 → 0
- `articulationSkill`: 30 → 0
- `portfolioQuality`: 30 → 0
- `problemSolvingApproach`: 30 → 0
- `professionalBreadth`: 30 → 0
- `depthScore`: 30 → 0
- `aestheticsInterest`: 30 → 0

`resilienceScore` is already 0 — no change needed.

### 2. Add bounding box around Aesthetics section

In `src/components/AestheticsSection.tsx`, wrap the outer `<div>` with the same styling used by `InterestedInOthersSection` — add `p-4 bg-muted/20 rounded-lg sketch-border-light` to the container, and add a header row with a `Palette` icon and label, matching the pattern of the other bounded sections.

### 3. Rename "Interest in Art & Aesthetics" → "Interest in Art, Aesthetics & Design"

Update the label text in `src/components/AestheticsSection.tsx` (line 27). Also search for and update any matching references in `AssessmentReport.tsx` and the email edge function.

### Files to update
1. `src/components/SidewaysInterviewCanvas.tsx` — default values to 0
2. `src/components/AestheticsSection.tsx` — bounding box + rename label
3. `src/pages/AssessmentReport.tsx` — rename label if referenced
4. `supabase/functions/send-assessment-report/index.ts` — rename label if referenced

