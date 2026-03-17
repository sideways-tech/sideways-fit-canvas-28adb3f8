

## Plan: Rename section and add "Why Sideways?" sub-block

### Changes

**1. `SidewaysInterviewCanvas.tsx`** (line 407-408)
- Rename heading: `"I. Clear Reason for This Industry"` → `"I. Clear Reason for This Industry and Sideways"`
- Update sub-copy: `"Why creative problem-solving? What's their story?"` → `"Why this industry, and why Sideways specifically?"`
- Add two new form state fields: `sidewaysMotivationLevel` (radio) and `sidewaysMotivationReason` (textarea)

**2. `IndustryMotivationSection.tsx`**
- Add a new "Why Sideways?" sub-block (styled with `p-4 bg-muted/20 rounded-lg sketch-border-light` to match other sub-blocks) containing:
  - A radio group: "Culture Fit" / "Specific to Sideways" / "Generic — Could Be Any Agency" with appropriate icons
  - A textarea: "What specifically about Sideways appeals to them?"
- Accept new props: `sidewaysLevel`, `sidewaysReason`, `onSidewaysLevelChange`, `onSidewaysReasonChange`
- Keep existing industry motivation as-is (it becomes the first sub-block)

**3. `SidewaysInterviewCanvas.tsx` state**
- Add `sidewaysMotivationLevel` and `sidewaysMotivationReason` to the form state initializer and pass them to IndustryMotivationSection

### Structure of the updated section

```text
I. Clear Reason for This Industry and Sideways
├── Industry motivation radio (existing: Unclear / Practical / Deep Connection)
├── "Their Story" textarea (existing)
├── "Why Sideways?" sub-block (NEW)
│   ├── Radio: Generic / Culture Fit / Sideways-Specific
│   └── Textarea: What about Sideways specifically?
└── Passionate indicator (existing)
```

