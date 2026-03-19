

## Candidate Consolidation via Email

### What changes
1. **Database**: Add a required `email` field to the `candidates` table (it already exists but is nullable — we'll keep it nullable at DB level but make it required in the form).

2. **Form**: Add a "Candidate's Email" input field to the candidate info section (Row 1, making it a 3-column layout or adding as a new row). Mark it as required with inline validation (email format check on blur, same pattern as interviewer email).

3. **Matching Logic**: Change the candidate deduplication in the submit handler from matching on `name + role` to matching on `email`. When a candidate with the same email exists:
   - Update their name/role/department/etc. with the latest values
   - Link the new assessment as a new round
   - When no match, create a new candidate record

4. **Dashboard**: The dashboard already groups by candidate — no changes needed there since it pulls assessments by `candidate_id`.

### Files to modify
- **`src/components/SidewaysInterviewCanvas.tsx`**:
  - Add `candidateEmail` to `FormState` interface
  - Add it to `requiredFields` array
  - Add email format validation (reuse existing pattern from interviewer email)
  - Add the input field in the candidate info grid
  - Change submit logic: match on `email` instead of `name + role`

### Technical details
- The `candidates` table already has an `email` column (text, nullable) — no migration needed
- Submit matching changes from:
  ```
  .eq("name", name).eq("role", role)
  ```
  to:
  ```
  .eq("email", candidateEmail)
  ```
- Email validation regex reused from interviewer email validation already in the component

