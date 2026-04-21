

# Reframe Block E — From "Appeal vs. Critique" to "Their POV on Sideways"

Shift the framing of Block E away from whether the candidate likes or dislikes Sideways' work, and toward whether they have a sharp, articulated point of view on it. The grading scale already supports this (Surface → Informed → Genuine → Opinionated), so this is primarily a copy + framing refresh, plus a couple of small label tweaks for consistency.

## What changes (user-facing copy)

**Card header (in `SidewaysInterviewCanvas.tsx`, Block E section)**
- Title stays: `E. Why Sideways`
- Subtitle: from *"Do they know who we are — and can they be honest about it?"*
  → **"What's their point of view on us — and on the work we do?"**

**Block heading (in `SidewaysMotivationBlock.tsx`)**
- Section label: from *"Why Sideways?"* → **"Their POV on Sideways"**
- Helper line: from *"Do they know who we are and why they want to be here specifically?"*
  → **"Do they just know about us, or do they have a clear point of view on us?"**

**Capture textarea**
- Label: from *"Have they explored our website sideways.co.in? What appeals to them about Sideways? What would they change or critique about our work?"*
  → **"What is their perspective on the work we do at Sideways?"**
- Helper hint (new small line under label): **"Have they explored sideways.co.in? Listen for a sharp POV on our approach, specific projects, or where we sit in the industry — engagement over flattery."**
- Placeholder: from *"E.g., 'Loved the XYZ campaign', 'Would redesign the portfolio section'..."*
  → **"E.g., 'Thinks our XYZ campaign nailed the insight but felt safe in execution', 'Sees us as the anti-template agency'..."**

**Grading scale (radio options)** — keep the 4 tiers, refine descriptions to reinforce POV (not praise/critique):
- Surface-Level / Generic — *"No real take. Vague comments that could apply to any agency."*
- Informed but Safe — *"Knows our work, can name projects — but withholds any real opinion."*
- Genuine Admiration — *"Specific and authentic engagement with our work — clearly thought about it, even if mostly positive."*
- Opinionated & Engaged — *"Has a sharp POV — willing to dissect, push back, or offer a strong read on where we're headed."*

**Grading helper line**
- From *"This isn't about whether they praised or critiqued — it's about how deeply they engaged with who we are and what we do."*
  → **"This isn't about praise or critique — it's about whether they have a real point of view on Sideways and the work we do."**

**Reporting label (in `AssessmentReport.tsx`)**
- Section title: *"Why Sideways / Work Critique"* → **"POV on Sideways"**

## Files to edit
1. `src/components/SidewaysMotivationBlock.tsx` — heading, helper, textarea label/placeholder, radio descriptions, grading helper line.
2. `src/components/SidewaysInterviewCanvas.tsx` — Block E card subtitle (line ~784).
3. `src/pages/AssessmentReport.tsx` — `NoteBlock` title for the Sideways section (line 294).

## Out of scope
- No data model / column changes — `sideways_motivation_reason`, `sidewaysMotivationLevel`, and the 4 enum values stay as-is, so no migration and no impact on stored assessments.
- The duplicate `IndustryMotivationSection.tsx` (no longer wired into the canvas) is left untouched to avoid scope creep; can be cleaned up separately if desired.

