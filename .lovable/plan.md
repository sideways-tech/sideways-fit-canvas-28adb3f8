

## Split Section D into Two Big Blocks + Reorder "Why Sideways"

### What we're doing
Taking the single "D. Why This Industry & Why Sideways" card and splitting it into two separate `SketchCard` blocks, while also reordering the "Why Sideways" content to follow the capture-then-grade pattern.

### Structure after the change

**Card D: Why This Industry?**
- Textarea — capture their reason
- MCQ — rate motivation level
- Celebration banner if "passionate"

**Card E: Why Sideways?**
- Textarea — General (explored sideways.co.in? appeals? critique?)
- Textarea — Indian campaign examples
- Textarea — International campaign examples
- Honesty Meter — how honest were they?
- MCQ — how Sideways-specific was their motivation?
- Celebration banner if "sideways-specific"

Current E (Diagnostic Mindset) becomes **F**, and subsequent sections shift accordingly.

### Files to change

1. **`src/components/IndustryMotivationSection.tsx`**
   - Split into two exported components: `IndustryMotivationBlock` and `SidewaysMotivationBlock`
   - Each gets only its relevant props
   - Remove the internal bounding-box wrappers (the cards themselves provide the visual container)
   - Reorder "Why Sideways" elements: all textareas first, then honesty meter, then MCQ

2. **`src/components/SidewaysInterviewCanvas.tsx`**
   - Replace single SketchCard D with two SketchCards (D + E)
   - Import both new components
   - Re-letter E → F for Diagnostic Mindset
   - Update `requiredSelections` section labels if they reference lettering

3. **`src/pages/AssessmentReport.tsx`**
   - Update any section headers that reference the old lettering (D, E → D, E, F)

No state, props, or data changes — same fields, same save logic, purely visual reorganization.

