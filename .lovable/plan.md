

## Redefining the T-Shape as a Professional T-Shape

### The concept shift

Currently, the T-Shape visualizer uses **non-work depth** (obsession topic from Section F) as the vertical bar and **societal breadth** (interested in others + reads widely) as the horizontal bar. 

The user wants the T-Shape to be **entirely professional**:
- **Vertical bar (Depth)** = Depth of Craft from the Experience Deep Dive (Section E)
- **Horizontal bar (Breadth)** = A new "Professional Breadth" slider added to the Experience Deep Dive section, measuring how curious they are about disciplines beyond their core role (e.g., a client servicing person who's into copy, art direction, typography, production, strategy)

### What changes

**1. Add a "Professional Breadth" slider to ProfessionalDeepDiveSection**
- New slider: "Breadth of Professional Interests"
- Description: "Beyond their core role, how curious are they about adjacent disciplines? A client servicing person interested in copy, art direction, typography. A designer who understands strategy, production, media."
- Low: "Stays in their lane" / High: "Cross-disciplinary curiosity"
- New field in FormState: `professionalBreadth` (number, 0–100)

**2. Rewire the TShapeVisualizer**
- Vertical bar (depth) now fed by `depthOfCraft` instead of `depthScore`
- Horizontal bar (breadth) now fed by `professionalBreadth` instead of the old `interestedInOthers + readsWidely` average
- Update labels: "Society →" becomes "Breadth →", "↓ Depth" stays
- Remove the non-work obsession topic input and slider from TShapeVisualizer — those stay in their own section (F. Depth in One Non-Work Topic) but no longer feed the T
- Remove the read-only "Breadth Score (from B & D)" display
- The T-Shape assessment status uses `depthOfCraft` and `professionalBreadth` for thresholds

**3. Update the T-Shape section header (currently "F. Depth in One Non-Work Topic")**
- This section keeps the non-work obsession topic/slider as-is, but it no longer drives the T-Shape. It becomes a standalone curiosity signal.
- Update sub-copy to clarify it's a bonus signal, not the T driver.

**4. Move the T-Shape visualizer into the Experience Deep Dive block (Section E)**
- Since both axes now come from professional data in this section, the animated T visualization fits naturally at the bottom of the Experience Deep Dive, showing the candidate's professional T-shape in real time as sliders are adjusted.

**5. Update scoring**
- `breadthScore` in canvas: change from `(interestedInOthers + readsWidely) / 2` to just `professionalBreadth`
- `calculateArchetype`: replace `depthScore >= 60 && breadthScore >= 60` with `depthOfCraft >= 60 && professionalBreadth >= 60`
- `ScoresSummary`: update T-Shape Profile to use `depthOfCraft` and `professionalBreadth`; update any references to old breadth calculation

### Files affected
- **`SidewaysInterviewCanvas.tsx`** — add `professionalBreadth` to FormState, update `breadthScore`, update archetype calc, move TShapeVisualizer into Section E, pass new props
- **`ProfessionalDeepDiveSection.tsx`** — add the 5th slider for professional breadth, accept new props
- **`TShapeVisualizer.tsx`** — strip out the obsession topic input and breadth-from-B&D display; just render the T visual + status using the two professional scores passed in; update labels
- **`ScoresSummary.tsx`** — update T-Shape Profile section to use professional depth/breadth; update breadthScore calculation

