

## Move Diagnostic Mindset to End (Post-Interview Grading)

Only **Diagnostic Mindset** is a holistic post-interview reflection. All other sliders/MCQs stay in-context for rate-as-you-go.

### Changes in `src/components/SidewaysInterviewCanvas.tsx`:

1. **Move** the Diagnostic Mindset `SketchCard` block from its current position (between B and D) to **after** the "Why Industry & Sideways" section and **before** the Assessment Summary
2. **Re-letter** the sections:
   - C. Diagnostic Mindset → becomes **E. Diagnostic Mindset**
   - D. Experience Deep Dive → becomes **C. Experience Deep Dive**
   - E. Why Industry & Sideways → becomes **D. Why Industry & Sideways**
3. **Update sub-copy** for Diagnostic Mindset to: *"Looking back at the full conversation — did they ask 'Why' before 'How'?"*

### Final flow:
A. Background → B. Interests & Aesthetics → C. Experience Deep Dive → D. Why Industry & Sideways → **E. Diagnostic Mindset** → Assessment Summary → Verdict

