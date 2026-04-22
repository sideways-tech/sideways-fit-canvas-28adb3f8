

# Performance Cleanup — Stop the Browser Energy Warning

The browser is flagging this page because **every keystroke in the form re-renders the whole canvas** (FormState lives at the top), which re-runs Framer Motion animations on dozens of children, on top of two compounding paint costs (a fractal-noise SVG on `body` + a striped `paper-texture` background on the main wrapper). Combined with two **infinite-loop** mic ripple animations and a 12-particle confetti burst on a watched value, this is exactly the workload Chromium throttles as "high energy use."

Fixes are **surgical** — no visual identity change, no behaviour change. Just stop animating things that don't need to animate, and stop re-animating things on every keystroke.

## Fixes (in priority order)

### 1. Stop ScoresSummary bars from re-animating on every keystroke
`ScoresSummary` is rendered live in the right column and receives `formState.*` values. Each of the ~10 score bars uses `<motion.div animate={{ width: ... }}>`. Every input change → React re-render → every bar re-runs its width transition. Replace with a plain `<div>` whose width is set via `style={{ width: '${val}%' }}` plus a CSS `transition: width 300ms ease-out`. Same visual, ~zero JS animation cost.

### 2. Stop TShapeVisualizer from spring-animating on every keystroke
Same problem — `motion.div` with spring transitions on `width`/`height` re-fires constantly. Switch to plain divs with `transition-[width,height] duration-300 ease-out` Tailwind classes.

### 3. Kill the infinite mic ripple animations
`TranscriptMic.tsx` runs **two** `repeat: Infinity` ripple animations the entire time recording is active (often the whole interview). This alone keeps the GPU busy for 30–60 minutes. Replace with a single CSS `animate-ping`-style pulse OR remove ripples entirely and rely on the green background colour to indicate "recording." (Recommend: keep one subtle CSS pulse, remove the second ripple.)

### 4. Replace the body's fractal-noise SVG texture with a static, lighter one
`src/index.css` line 100 sets a `feTurbulence` SVG as the body background with `background-blend-mode: soft-light`. SVG filter blending forces the compositor to re-paint a large surface on every scroll/resize. Replace with either (a) a one-time generated PNG noise data-URI (cheap to paint, no filter), or (b) just remove the noise blend and rely on the `paper-texture` lines on the canvas wrapper. Recommend (b) — the line-grid already gives the paper feel.

### 5. Memoize ScoresSummary + TShapeVisualizer
Wrap both in `React.memo` so they only re-render when their actual props change (not on every parent re-render from typing in unrelated text fields). Pair with a tiny refactor: pull `ScoresSummary`'s prop list into a `useMemo` in the parent so its identity is stable.

### 6. Debounce the candidate-email auto-round-detect Supabase query
Already debounced (500ms) — leave as-is. ✅

### 7. Tone down the confetti burst
`DiagnosticSection`'s `<Confetti />` mounts 12 motion divs every time the user picks "Diagnostician." It's brief (0.8s) so low-impact, but combined with everything else it adds up. Reduce to 6 particles. (Optional, low priority.)

### 8. Remove `whileHover={{ x: 4 }}` / `whileTap={{ scale: 0.98 }}` on radio cards
Three sections (`DiagnosticSection`, `IndustryMotivationBlock`, `SidewaysMotivationBlock`) wrap each radio option in a `motion.div` with hover+tap micro-animations. These mount Framer's gesture listeners on ~10 elements. Replace with Tailwind `hover:translate-x-1 active:scale-[0.98] transition-transform` — same effect, near-zero JS cost.

## Files I'll edit

1. `src/components/ScoresSummary.tsx` — replace `motion.div` width bars with plain CSS transitions; wrap in `React.memo`.
2. `src/components/TShapeVisualizer.tsx` — replace spring `motion.div` with CSS-transitioned divs; wrap in `React.memo`.
3. `src/components/TranscriptMic.tsx` — remove second ripple, convert remaining one to CSS animation.
4. `src/index.css` — remove the `feTurbulence` body background + blend mode (keep `paper-texture` on the canvas).
5. `src/components/DiagnosticSection.tsx` — drop confetti to 6 particles; swap radio-card `motion.div` for Tailwind hover/active classes.
6. `src/components/IndustryMotivationBlock.tsx` — same radio-card swap.
7. `src/components/SidewaysMotivationBlock.tsx` — same radio-card swap.

## What stays exactly the same

- All copy, all field logic, all validation, all submission flow.
- The "digital sketchpad" aesthetic — sketch borders, handwritten font, yellow highlighter, paper feel.
- Card entry animations (`SketchCard` fade-in on mount runs **once** — fine).
- Header fade-in, footer fade-in, KRA reference accordion expand — all one-shot, fine.
- The confetti celebration still fires, just lighter.

## Expected impact

- ~10× drop in continuous JS animation work during typing.
- No more infinite GPU work during long recording sessions.
- Body paint surface drops from "filter blend across viewport" to "static colour."
- Browser energy/responsiveness warning should disappear.

Want me to proceed with all 7 file edits, or would you like to drop any of them (e.g. keep both mic ripples, keep the body noise)?

