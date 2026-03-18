

## Reordering the Experience Deep Dive Sliders

**Current order:**
1. Depth of Craft
2. Breadth of Professional Interests
3. Articulation & Presentation
4. Portfolio Quality
5. Problem-Solving Approach

**The natural interview flow:** The candidate walks in and presents their work. So the interviewer first observes *how* they present (articulation, presence), then evaluates *what* they showed (portfolio quality), then assesses *how they think* (problem-solving), and finally rates the deeper attributes that emerge over the conversation — mastery depth and cross-disciplinary breadth.

**Proposed order:**
1. **Articulation & Presentation** — First impression: how do they walk you through their work?
2. **Portfolio Quality** — What did they actually show? How strong is the work itself?
3. **Problem-Solving Approach** — Did they reveal thinking behind the work, not just outputs?
4. **Depth of Craft** — How deep does their mastery go in their core domain?
5. **Breadth of Professional Interests** — Do they look beyond their lane?

**Implementation:** Reorder the `sliders` array in `src/components/ProfessionalDeepDiveSection.tsx` (lines 24–62). No other changes needed — the rendering loop and all handlers are key-based.

