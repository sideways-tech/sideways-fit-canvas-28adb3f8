

## Move Honesty Meter Inside the Website Exploration Block

Makes total sense — the Honesty Meter is specifically about how candid they were when discussing Sideways' website/work. It belongs *inside* that context, not as a separate standalone block below it.

### Change in `src/components/SidewaysWorkSection.tsx`

Move the "Their take on Sideways work" label + `<HonestyMeter />` from being a sibling block into the existing `"Have they explored our website"` card (the `div` with `bg-muted/20`), placing it after the `<Textarea>`. This consolidates the website feedback capture and honesty grading into one cohesive block.

