

## Analysis: Assessment Summary vs Interview Flow

### Current Interview Flow (sections in canvas)

| Section | Title | Scored Items |
|---------|-------|-------------|
| A | Background | None (textarea only) |
| B | Interests, Passions & Aesthetics | Depth (Non-Work), Reading Breadth, Interested in Others, Aesthetics |
| C | Experience Deep Dive | Depth of Craft, Prof. Breadth, Articulation, Portfolio, Problem-Solving, Willingness to Iterate |
| D | Why Industry & Why Sideways | Industry Motivation, Sideways Motivation, Honest POV |
| E | Diagnostic Mindset | Diagnostic Mindset |

### Problems Found

**1. Section letters are all stale** — they reference an old A–I scheme that no longer exists:

| Score Item | Currently Shows | Should Be |
|------------|----------------|-----------|
| Diagnostic Mindset | B | **E** |
| Interested in Others | C | **B** |
| Reads Widely | C | **B** |
| Honest POV | D | D ✓ |
| Depth of Craft | E | **C** |
| Professional Breadth | E | **C** |
| Articulation | E | **C** |
| Portfolio Quality | E | **C** |
| Problem-Solving | E | **C** |
| Depth (Non-Work) | F | **B** |
| Willingness to Iterate | G | **C** |
| Art & Aesthetics | H | **B** |
| Industry Motivation | I | **D** |

**2. Order doesn't match the interview flow** — Diagnostic Mindset is listed first but it's the last section (E). Section B items (Depth Non-Work, Aesthetics) are scattered at the bottom.

**3. Missing score: Sideways Motivation** — The form captures `sidewaysMotivationLevel` (Generic / Culture Fit / Sideways-Specific) but it's completely absent from the summary.

**4. No overlaps found** — each score maps to a unique form field.

### Proposed Fix in `ScoresSummary.tsx`

1. **Add** `sidewaysMotivationLevel` as a new prop and score item
2. **Reorder** the scores array to match the interview flow (B → C → D → E)
3. **Fix all section letters** to match current A–E scheme
4. Correct order:

```text
B. Depth (Non-Work)        ← first item in Section B
B. Reads Widely
B. Interested in Others
B. Art & Aesthetics
C. Depth of Craft          ← Section C items
C. Professional Breadth
C. Articulation & Presentation
C. Portfolio Quality
C. Problem-Solving
C. Willingness to Iterate
D. Industry Motivation     ← Section D items
D. Sideways Motivation     ← NEW (currently missing)
D. Honest POV
E. Diagnostic Mindset      ← Post-interview grading
```

### Files to change

- **`src/components/ScoresSummary.tsx`** — Add `sidewaysMotivationLevel` prop, reorder scores array, fix section letters
- **`src/components/SidewaysInterviewCanvas.tsx`** — Pass `sidewaysMotivationLevel` to `ScoresSummary`

