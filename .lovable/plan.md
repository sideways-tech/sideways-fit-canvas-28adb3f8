

## Auto-detect Round Number from Candidate Email

### Summary
When the interviewer enters a candidate's email, the system will automatically look up the database for existing assessment rounds. If prior rounds exist, the round dropdown auto-updates to the next round number (previous max + 1). If no prior rounds exist, it defaults to round 1.

### How it works
1. Add a `useEffect` (or debounced callback) in `SidewaysInterviewCanvas.tsx` that triggers when `formState.candidateEmail` changes and is a valid email.
2. Query the `assessments` table joined through `candidates` to find the max `round_number` for that email.
3. Auto-set `formState.interviewRound` to `(maxRound + 1).toString()`, or `"1"` if no prior rounds.
4. Show a subtle toast or inline note like "Previous round found — auto-set to Round 2" so the interviewer knows what happened.
5. The round dropdown remains editable in case the interviewer wants to override.

### Technical details
- **File**: `src/components/SidewaysInterviewCanvas.tsx`
- **Query**: First find candidate by email, then query assessments for max round_number:
  ```sql
  candidates.select("id").eq("email", email) → 
  assessments.select("round_number").eq("candidate_id", id).order("round_number", desc).limit(1)
  ```
- **Trigger**: `useEffect` watching `formState.candidateEmail`, debounced ~500ms, only fires when `isValidEmail()` returns true.
- **UX**: Auto-populates round field and shows a brief informational toast. Field stays editable.

