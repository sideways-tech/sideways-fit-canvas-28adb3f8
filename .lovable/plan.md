

## Plan: Role-Based Access & Auto-Fill Interviewer Email

### What changes

1. **Auto-fill interviewer email from login session**
   - On the interview form, automatically populate the "Interviewer Email" field with the logged-in user's email from the auth session.
   - Make the field read-only/disabled so it cannot be manually edited.

2. **Create a `super_admins` table in the database**
   - Table with columns: `id`, `email` (unique), `created_at`.
   - RLS: only authenticated users can read; only service_role can insert/update/delete.
   - Seed it with the email addresses you provide.
   - Create a `is_super_admin` security-definer function that checks if a given email is in this table.

3. **Dashboard: filter by interviewer email for non-admins**
   - Add a hook/utility that checks if the current user is a super admin (calls `is_super_admin` or queries the table).
   - In `Dashboard.tsx`, if the user is NOT a super admin, filter assessments to only show those where `interviewer_email` matches the logged-in user's email.
   - Super admins see everything (current behavior).

4. **KRA Admin: restrict access to super admins only**
   - Update the `/kra-admin` route to check super admin status.
   - Non-admins navigating to `/kra-admin` get redirected to `/` or shown an "access denied" message.
   - Hide the KRA Admin link (if any) from the UI for non-admins.

5. **Conditionally show Dashboard link in footer**
   - The "Dashboard" link stays visible for everyone (they can see their own interviews).
   - Add a "KRA Admin" link in the footer only for super admins.

### Technical details

- **Database migration**: Create `super_admins` table + `is_super_admin()` function.
- **New hook**: `useSuperAdmin()` — queries the super_admins table once per session, caches result.
- **Files modified**: `SidewaysInterviewCanvas.tsx` (auto-fill email, conditional footer links), `Dashboard.tsx` (filtered queries), `App.tsx` (protected KRA admin route), new `hooks/useSuperAdmin.ts`.

### What I need from you
- The list of super admin email addresses to seed the table.

