

## Current Structure (9 sections + summary + verdict)

```text
A. Candidate's Background        — who they are
B. Ask Questions (Diagnostic)     — do they clarify before solving
C. Interests & Passions           — hobbies, reading, curiosity about others, obsession depth
D. Sideways & Our Work            — website feedback, honesty meter
E. Experience Deep Dive           — portfolio, craft, T-shape
F. (skipped letter)
G. Willingness to Iterate         — resilience, killing darlings
H. Interest in Art & Aesthetics   — creative sensibility
I. Industry & Sideways Motivation — why this field, why Sideways
```

## The Problem

The current order jumps between "who is this person" and "can they do the job" without a clear narrative arc. A few specific issues:

1. **Art & Aesthetics (H) and Interests & Passions (C) overlap** — both probe creative sensibility and non-work curiosity. Aesthetics is really a facet of their broader interests.
2. **Willingness to Iterate (G) sits alone** between the professional deep dive and aesthetics. It's really a professional trait that belongs with the work evaluation.
3. **Sideways & Our Work (D) and Industry Motivation (I) are split** — both ask "why are you here?" One tests honesty about the company's work, the other tests motivation for the industry and firm. They belong together.
4. **Diagnostic Mindset (B) is orphaned early** — it's a professional thinking skill that would feel more natural alongside or just before the Experience Deep Dive.

## Proposed New Flow

The narrative arc: **Warm up → Know the person → Test the professional → Test the fit → Decide.**

```text
ACT 1: THE PERSON
  A. Background
     (unchanged — ease in, get comfortable)

  B. Interests, Passions & Aesthetics        ← merge current C + H
     - Non-work obsession topic + depth slider
     - Reads widely
     - Interested in other people
     - Art & aesthetics interest + process note
     - General notes

ACT 2: THE PROFESSIONAL
  C. Diagnostic Mindset                      ← was B, moved here
     (do they ask "why" before "how")

  D. Experience Deep Dive + Resilience       ← merge current E + G
     - Portfolio, craft depth, articulation, problem-solving, breadth
     - T-Shape visualizer
     - Willingness to iterate / kill darlings

ACT 3: THE FIT
  E. Why This Industry & Why Sideways        ← merge current D + I
     - Industry motivation radio + story
     - Sideways website feedback + honesty meter
     - Why Sideways radio + specifics

CLOSING
  Assessment Summary
  The Verdict
```

### Why this works

- **Act 1** is a conversation starter. Background, then passions and aesthetics — all "tell me about you" territory. Grouping aesthetics here makes it feel like a natural extension of "what do you care about" rather than a standalone checkbox.
- **Act 2** shifts to work. The diagnostic question is a perfect bridge — it transitions from "who you are" to "how you think professionally." Then the deep dive and resilience together evaluate craft and grit as one block.
- **Act 3** is the closer. "Why this industry" and "why Sideways" are the same conversation. The honesty meter for website feedback fits naturally here too — it's all about their relationship with the company and field.

### Implementation

Only `SidewaysInterviewCanvas.tsx` needs changes — reorder the SketchCard blocks and re-letter A through E. Merge Aesthetics sub-components into the Interests block. Merge Resilience into the Experience Deep Dive block. Merge Sideways Work into the Industry Motivation block. No component internals need to change, just the composition in the parent.

