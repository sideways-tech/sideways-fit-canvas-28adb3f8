

## Rewrite Resilience & Verdict Text

### What's changing

Replace all "Circus" references and rewrite the resilience star descriptions with warm-but-professional language that actually describes iterative resilience in a creative context.

### Proposed new copy

**Resilience star descriptions:**

| Stars | New text |
|---|---|
| 1 | "Got defensive — struggled to separate self from work" |
| 2 | "Took it hard, but eventually found a way forward" |
| 3 | "Handled it professionally — no drama, moved on" |
| 4 | "Embraced the feedback and came back stronger" |
| 5 | "Thrives on iteration — treats every critique as fuel" |

**Summary banner (score 4–5):**
> "Built for iteration" (replaces "Ready for the Circus! 🎪")

**Verdict strong-yes description:**
> "Diagnostic mindset, T-shaped curiosity, and genuine alignment with Sideways culture. A natural fit."
(replaces "Ready for the Circus!")

### Files to update

1. **`src/components/ResilienceRating.tsx`** — star descriptions (lines 63–69), banner text (line 81)
2. **`src/pages/AssessmentReport.tsx`** — `resilienceDescriptions` (lines 32–38), strong-yes verdict description (line 9)
3. **`supabase/functions/send-assessment-report/index.ts`** — `resilienceDescs` (lines 62–68), strong-yes verdict description (line 106)
4. **`src/components/VerdictFooter.tsx`** — strong-yes description (line 58)

No database or structural changes needed — text-only updates across 4 files.

