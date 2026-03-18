

## Redesign Assessment Summary Score Cards

### Problems identified

1. **Red XCircle icons look like close/delete buttons** — users instinctively want to click them. Need non-interactive status indicators instead.
2. **"30%" values are confusing** — they're slider positions on a 0–100 scale, but "%" implies they should sum to 100. Need clearer labeling.
3. **Overall layout feels cluttered** — 14 items in a flat grid with no grouping by section.

### Design changes in `src/components/ScoresSummary.tsx`

**1. Replace status icons with small colored dots/bars instead of XCircle/CheckCircle2**
- Excellent: green filled dot
- Good: yellow filled dot  
- Needs Work: red filled dot
- Not Assessed: grey outlined dot

This removes the "clickable button" affordance entirely.

**2. Replace "%" with a 5-point descriptive scale for slider-based scores**
- Slider values (0–100) displayed as: Low / Fair / Good / Strong / Excellent
- Thresholds: 0–20 Low, 21–40 Fair, 41–60 Good, 61–80 Strong, 81–100 Excellent
- Add a small horizontal progress bar to visualize the position instead of a raw number
- Keep non-slider items (resilience, diagnostic, honesty, motivation) as their existing descriptive labels

**3. Group scores by section with headers**
- Add section group headers: "B. Interests & Aesthetics", "C. Experience Deep Dive", "D. Motivation & Honesty", "E. Diagnostic Mindset"
- Each group is a mini-card with its items listed inside, rather than a flat grid

**4. Simplify the legend** to match new dot indicators

### No other files need changes — this is purely a visual/layout redesign of the scores grid within `ScoresSummary.tsx`.

