
# Investigate and Fix Deepgram Disconnects + Missing Transcript Saves

## Diagnosis

The transcript loss is happening in the client state flow, not just the speech provider connection itself.

### What is breaking
1. **Only finalized transcript text is being passed up to the form.**
   - `TranscriptMic` only sends `transcript` upward.
   - `interimText` is shown in the floating preview, but not persisted to the parent form state.

2. **If the connection drops before Deepgram emits final chunks, the assessment save sees an empty transcript.**
   - On submit, the archive save uses `transcriptRef.current` / `formState.transcript`.
   - If the session dies while there is only interim text, the backend row is saved with `transcript = null`.
   - That is why the archive shows **no transcript icon**.

3. **Retrying after an error currently risks wiping already-captured text.**
   - `start()` resets transcript state every time.
   - So if the recorder hits error and the interviewer taps the mic again, the previous draft transcript can be cleared.

4. **The reconnect logic is present, but not durable enough.**
   - It retries the socket, but when retries are exhausted the draft transcript is not explicitly preserved for submit/recovery.
   - There is also no local draft persistence if the page refreshes or the recorder crashes.

5. **The disconnect path needs better observability.**
   - The current proxy forwards close/error signals, but there is not enough structured logging around close reasons and client recovery paths.

## Implementation Plan

### 1. Preserve the full visible transcript, not just finalized chunks
Update the transcription hook and mic component so the parent form always receives the **best available transcript draft**:

- Build a combined value:
  - `final transcript`
  - plus current `interimText`
- Expose that combined draft continuously to the parent.
- Make the save flow use the combined draft when recording is in error/closed state.

This ensures that if the connection dies mid-sentence, the text already visible on screen is still saved with the assessment.

### 2. Add an explicit “get current transcript draft” recovery path
Extend the mic handle so the submit flow can fetch the best transcript even if recording is no longer active:

- Add something like `getTranscriptDraft()`
- Use it in `handleSubmitAssessment()` before insert
- Fall back in this order:
  1. stopped/finalized transcript
  2. current draft from hook
  3. form state draft
  4. local draft cache

This fixes the case where `isRecording()` is false because the recorder errored, but useful transcript text still exists in memory.

### 3. Stop wiping transcript on retry after an error
Refactor `useTranscription.start()` so transcript reset only happens for a genuinely new session, not for reconnect/retry.

Planned behavior:
- **Fresh recording**: clear transcript
- **Retry after disconnect/error**: keep existing draft and continue appending
- Optional explicit “discard transcript and restart” can remain internal, but default retry should preserve text

This prevents interviewers from losing prior captured content just by tapping the mic again.

### 4. Persist transcript draft locally until assessment save succeeds
Add lightweight local persistence for the draft transcript during the interview session:

- Persist draft transcript in browser storage
- Keep it keyed to the in-progress assessment context (at minimum candidate email + interviewer email + round)
- Restore it if the recorder disconnects or the page reloads
- Clear it only after successful assessment save

This adds a second safety net beyond in-memory state.

### 5. Harden the Deepgram disconnect path
Update the proxy and client error handling so disconnects are treated more gracefully:

#### Client (`useTranscription.ts`)
- Preserve draft transcript before switching to `error`
- Differentiate:
  - temporary socket drop
  - provider close
  - auth/config failure
  - service busy / throttling
- Keep retries silent, but surface a clearer final message when retries are exhausted

#### Proxy (`deepgram-proxy`)
- Forward more structured close info to the client
- Improve logging around:
  - Deepgram open failure
  - close code / close reason
  - client close vs provider close
- Keep responses/WS events graceful so the UI can recover instead of dropping state

### 6. Make archive save deterministic
Update `SidewaysInterviewCanvas.tsx` submission logic so transcript saving does not depend on the recorder still being “healthy” at submit time.

Specifically:
- If mic is active, stop and finalize as today
- If mic is errored/disconnected, do **not** skip transcript save
- Save the recovered draft transcript into `assessments.transcript`
- Preserve existing archive icon behavior automatically once transcript is non-null

## Files to Update

1. `src/hooks/useTranscription.ts`
   - preserve combined draft
   - add recovery getter
   - avoid reset-on-retry
   - improve disconnect/error behavior
   - add local draft persistence

2. `src/components/TranscriptMic.tsx`
   - expose draft transcript through ref
   - pass combined transcript upward instead of finalized-only text

3. `src/components/SidewaysInterviewCanvas.tsx`
   - use recovered transcript draft during submit
   - clear local draft after successful save

4. `supabase/functions/deepgram-proxy/index.ts`
   - improve close/error forwarding and logging for disconnect diagnosis

## Validation / QA

After implementation, verify these exact cases:

1. **Normal recording**
   - speak, stop, save
   - transcript icon appears in archive

2. **Disconnect mid-sentence**
   - speak enough to generate visible interim text
   - force disconnect
   - save assessment
   - transcript still appears in archive

3. **Disconnect → retry**
   - speak, disconnect, retry recording
   - confirm earlier text is preserved and new text appends

4. **Disconnect with no manual retry**
   - let recorder fail
   - save immediately
   - confirm recovered draft still persists

5. **Page refresh during in-progress transcript**
   - confirm local draft restores
   - save succeeds with transcript

## Technical Notes

- No database migration is required.
- The core bug is not that transcript storage is missing; it is that the app only stores finalized chunks and loses interim/draft text during failure states.
- The missing archive mic icon is a downstream symptom of `assessments.transcript` being saved as `null`.
