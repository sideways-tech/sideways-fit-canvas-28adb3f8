

## Consolidation Plan

### My recommendation on the Sideways questions

You're right to question the overlap. Currently there are two separate boxes in Section D:

1. **"Why Sideways?" textarea** — "What specifically about Sideways appeals to them? Any Indian / international examples they found inspirational?"
2. **"Sideways Work" textarea** — "What caught their eye? What would they change? What did they genuinely dislike?" + Honesty Meter

Both are asking "what do you think of Sideways?" — one framed as motivation, the other as website critique. **I recommend merging them into a single box.** Here's why:

- The interviewer naturally captures both in one conversation flow — "Have you seen our work? What did you think? Why do you want to be here?"
- The Honesty Meter (flattery/diplomatic/honest) is the grade for *how* they answered — it should sit right below the combined textarea
- The Sideways Motivation MCQ (generic/culture-fit/sideways-specific) grades *how specific* their knowledge is

So the consolidated "Why Sideways?" block becomes:
1. One textarea with prompt: "Have they explored sideways.co.in? What appeals to them about Sideways? What would they change or critique about our work? Any Indian/international examples they found inspirational?"
2. Honesty Meter — how honest were they about our work?
3. Sideways Motivation MCQ — how Sideways-specific was their motivation?

This eliminates the separate `SidewaysWorkSection` component entirely. The `sidewaysWebsiteFeedback` field merges into `sidewaysMotivationReason` (single combined textarea).

### Changes

**1. Merge SidewaysWorkSection into IndustryMotivationSection**

- Move the Honesty Meter into the "Why Sideways?" sub-block of `IndustryMotivationSection`, placed between the textarea and the MCQ radio group
- Update the textarea prompt to combine both sets of questions
- Remove `SidewaysWorkSection` component entirely

**2. Remove problemSolvingApproach slider from ProfessionalDeepDiveSection**

- Delete the `problemSolvingApproach` entry from the sliders array
- Remove the prop and handler from the component interface
- The Diagnostic Mindset MCQ in Section E already covers this

**3. Update SidewaysInterviewCanvas**

- Remove `SidewaysWorkSection` import and usage
- Pass `honestyLevel` and its handler into `IndustryMotivationSection` instead
- Stop passing `problemSolvingApproach` to `ProfessionalDeepDiveSection`
- Update `calculateCategoryScores`: redistribute Professional score weights across remaining 4 dimensions (remove 0.17 from problemSolving, spread to others)

**4. Update both reports (dashboard + email)**

- Remove `problemSolvingApproach` row from professional section
- Remove separate "Sideways Website Feedback" note block (now merged into Sideways Motivation Reason)
- Adjust Professional score average display (4 sliders + resilience instead of 5 + resilience)

**Files modified:**
- `src/components/IndustryMotivationSection.tsx` — absorb honesty meter + combined textarea
- `src/components/ProfessionalDeepDiveSection.tsx` — remove problemSolvingApproach slider
- `src/components/SidewaysInterviewCanvas.tsx` — rewire props, update scoring, remove SidewaysWorkSection
- `src/pages/AssessmentReport.tsx` — remove redundant rows
- `supabase/functions/send-assessment-report/index.ts` — remove redundant rows from email
- Delete `src/components/SidewaysWorkSection.tsx`

**No database migration needed** — columns remain in the table, new assessments simply won't populate the removed fields.

