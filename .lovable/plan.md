

## Changes to `src/components/IndustryMotivationSection.tsx`

Three changes:

1. **Wrap "Why This Industry" in its own sub-block** (matching the existing "Why Sideways?" sub-block styling with `p-4 bg-muted/20 rounded-lg sketch-border-light`)

2. **Reorder "Why This Industry"**: Move the textarea ("Their Industry Story") ABOVE the radio group MCQ, so the flow is: label → textarea → then the 3-option grading MCQ → passionate indicator

3. **Reorder "Why Sideways?"**: Move the textarea ABOVE the radio group MCQ, so the flow is: label → textarea → then the 3-option grading MCQ → homework badge

This makes both sub-blocks follow the same pattern: **capture their answer first, then grade it**.

