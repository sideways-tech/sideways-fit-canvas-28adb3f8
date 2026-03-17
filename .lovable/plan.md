

## Restructuring the C & E Block

### Current state
The "C & E" section is one large block containing: Interested in Others (slider), Reads Widely (slider + input), Underestimated Trend (textarea), Idea Shared Often (textarea), plus a combined score. The "D. Honest POV" block sits separately after the T-Shape section.

### New structure

The C & E block gets split into **three distinct sub-blocks**, each its own SketchCard:

```text
┌─────────────────────────────────────────────┐
│  C. Interested in Other People's Lives      │  ← pulled out as standalone
│  Slider: Self-focused ↔ Asks everyone's     │
│  story                                      │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  D. Interests & Passions                    │
│  (Let them speak for ~5 minutes)            │
│                                             │
│  Sub-block: Reads Widely                    │
│    Slider + recent read input (kept as-is)  │
│                                             │
│  Textarea: General interests/passions notes │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  E. Sideways & Our Work                     │
│  "Have they explored sideways.co.in?"       │
│                                             │
│  Textarea: What they liked, disliked,       │
│  critiques about our work                   │
│                                             │
│  Existing HonestyMeter integrated here:     │
│    Visual meter bar + Flattery / Diplomatic │
│    / Constructive Critique radio cards      │
│    + Birbal badge                           │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  F. Professional Deep Dive                  │
│  "Time to see the craft up close"           │
│                                             │
│  1. Depth of Craft — slider                 │
│     (How deep is domain mastery?)           │
│  2. Articulation & Presentation — slider    │
│     (Merged storytelling + presentation)    │
│  3. Portfolio / Demo Quality — slider       │
│     (Quality of work shown)                 │
│  4. Problem-Solving Approach — slider       │
│     (Process vs just final output)          │
│                                             │
│  Textarea: Interviewer notes on the demo    │
└─────────────────────────────────────────────┘
```

### What changes

**Removals:**
- Delete the two trend/idea textarea questions (sub-blocks 3 & 4 in ReadingBreadthSection)
- Remove the standalone "D. Honest POV" SketchCard — it merges into the new "E" block
- Remove `underestimatedTrend` and `ideaSharedOften` from FormState and props

**New fields in FormState:**
- `interestsPassionsNotes` (string) — general notes on passions
- `sidewaysWebsiteFeedback` (string) — what they said about our work
- `depthOfCraft` (number, 0–100) — slider
- `articulationSkill` (number, 0–100) — merged storytelling + presentation slider
- `portfolioQuality` (number, 0–100) — slider
- `problemSolvingApproach` (number, 0–100) — slider
- `professionalDiveNotes` (string) — interviewer notes on demo/portfolio

**Re-lettering:**
Sections become A (Background), B (Diagnostic), C (Interested in Others), D (Interests & Passions), E (Sideways & Our Work), F (Professional Deep Dive), then existing G (T-Shape Depth), H (Iterate), I (Art & Aesthetics), J (Industry Motivation).

**Components affected:**
- `ReadingBreadthSection.tsx` — stripped down to just "Reads Widely" sub-block (slider + input). Remove trend/idea questions and the "Interested in Others" slider.
- `SidewaysInterviewCanvas.tsx` — restructure SketchCards, add new state fields, remove old "D. Honest POV" standalone card, wire new sub-blocks.
- New component: `ProfessionalDeepDiveSection.tsx` — four sliders + textarea, consistent with existing slider/widget style.
- `HonestyMeter.tsx` — no changes, just re-parented inside the new "E" block.
- `ScoresSummary.tsx` and `VerdictFooter.tsx` / archetype logic — updated to account for new fields and removed fields.

### Scoring updates
- The `calculateArchetype` function will replace references to removed fields and incorporate the new professional scores where relevant.
- The ScoresSummary will show the new dimensions.

