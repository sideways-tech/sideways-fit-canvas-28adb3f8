

## Plan: Add "Admin" link to footer (left of Dashboard)

Rename the existing "KRA Admin" link to "Admin" and move it to the **left** of the "Dashboard" link in the footer. It remains visible only to super admins. Update the route path from `/kra-admin` to `/admin` to match the broader scope planned.

### Changes

1. **`src/components/SidewaysInterviewCanvas.tsx`** (lines ~835-848)
   - Move the super-admin-only link before the Dashboard link
   - Rename "KRA Admin" → "Admin"
   - Update href from `/kra-admin` to `/admin`

2. **`src/App.tsx`**
   - Update route path from `/kra-admin` to `/admin`

3. **`src/pages/KraAdmin.tsx`**
   - Update page title from "KRA Admin" to "Admin"
   - Update Back button link from `/` to `/`  (no change needed)

