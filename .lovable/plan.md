

## Problem

The current verdict algorithm only checks aggregate category scores against thresholds. A candidate with near-zero **Depth of Craft** (the vertical bar of the T) can still receive a "Lean Yes" because the other professional dimensions compensate for it in the weighted average.

This undermines the T-shape philosophy — a person without meaningful depth shouldn't clear the bar.

## Proposed Solution: T-Shape Floor Checks

Add explicit minimum thresholds for the T-shape dimensions before a positive verdict can be issued:

**New rules added to `calculateVerdict`:**

1. **Depth of Craft floor** — If `depthOfCraft < 30`, force at minimum a "Lean No" (regardless of aggregate scores). If `depthOfCraft < 15`, force "Strong No".

2. **Professional Breadth floor** (optional but recommended) — If `professionalBreadth < 20`, force at minimum "Lean No". This ensures the horizontal bar of the T also has substance.

These checks would be inserted **before** the existing "Lean Yes" / "Strong Yes" logic, so they act as hard gates.

### Concrete code change

In `src/components/SidewaysInterviewCanvas.tsx`, inside `calculateVerdict`, after the existing "Lean No" check and before the "Strong Yes" check:

```typescript
// T-Shape floor: Depth of Craft must meet minimum for positive verdicts
if (state.depthOfCraft < 15) {
  return { verdict: "strong-no", scores };
}
if (state.depthOfCraft < 30) {
  return { verdict: "lean-no", scores };
}

// T-Shape floor: Professional Breadth minimum
if (state.professionalBreadth < 20) {
  return { verdict: "lean-no", scores };
}
```

### Suggested thresholds (adjustable)

| Dimension | Strong No if below | Lean No if below |
|---|---|---|
| Depth of Craft | 15 | 30 |
| Professional Breadth | — | 20 |

These are on a 0–100 scale. Happy to adjust the exact numbers based on your judgment.

### Files changed
- `src/components/SidewaysInterviewCanvas.tsx` — add T-shape floor checks in `calculateVerdict`

