

## Add Floating Hints to Slider Sections

### What changes

Add contextual floating hints to two slider sections to guide interviewers on what to look for or ask:

1. **Interested in Other People's Lives** (`InterestedInOthersSection.tsx`)
   - Hint text (example): *"Look for: Do they ask about your life unprompted? Do they remember details about colleagues? Do they show genuine curiosity about the interviewer's background, not just polite small talk?"*

2. **Interest in Art, Aesthetics & Design** (`AestheticsSection.tsx` — the interest slider specifically)
   - Hint text will come from `disciplineConfig` (already discipline-aware), added as a new config field `aestheticsSensibility.hint`

### How it works

- Wrap each slider in a `relative overflow-visible` container
- Add `FloatingHint` component triggered on **hover** over the slider area (using `onMouseEnter`/`onMouseLeave`), so interviewers see guidance as they're about to adjust the slider
- Position hints to the **right** or **top** to avoid clipping against left margins
- Reuses the existing `FloatingHint` component — no new UI components needed

### Files changed

- `src/components/InterestedInOthersSection.tsx` — add hover state + FloatingHint to the slider area
- `src/components/AestheticsSection.tsx` — add hover state + FloatingHint to the interest slider area
- `src/lib/disciplineConfig.ts` — add `aestheticsSensibility.hint` field per department with discipline-specific guidance text

### Hint content (editable — happy to adjust wording)

**Interested in Others:**
> "Look for: Do they ask about your life unprompted? Remember details about others? Show curiosity about the interviewer's background — not just polite small talk?"

**Aesthetics (creative departments):**
> "Look for: Do they notice the office design? Reference visual references naturally? Have opinions on fonts, colors, or layouts without being prompted?"

**Aesthetics (strategy):**
> "Look for: Do they reference visual culture, design trends, or brand aesthetics in conversation? Do they notice details in campaign craft?"

**Aesthetics (tech-ux):**
> "Look for: Do they have opinions on UI details, micro-interactions, or design systems? Do they reference apps or products for their design quality?"

