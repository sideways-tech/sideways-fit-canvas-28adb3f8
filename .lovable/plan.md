
## What the evidence shows

This is not an Archive UI bug.

- The latest saved assessment (`6ac85796-7b88-414d-91e8-a9a55e0d064c`) was inserted with `transcript: null`.
- The save request body itself already contained `transcript: null`.
- In the same window, the transcription proxy logged a full recording session with `4037` audio chunks and `4,472,996` bytes sent to Deepgram before a clean close.

So the failure is: audio reaches the provider, but the app still sends an empty transcript into the assessment insert.

## Implementation plan

### 1. Stop treating transcript text as browser-only state
The current flow is still too fragile because the only durable source is the page state/local draft. I will move transcript durability into the backend path.

Build a dedicated `transcription_sessions` table to store:
- session id
- interviewer identity
- latest draft transcript
- final transcript
- Deepgram request/session metadata
- status (`recording`, `reconnecting`, `completed`, `errored`)
- optional linked assessment id after save

This makes transcript recovery independent of whether the React state is stale at save time.

### 2. Make the proxy accumulate transcript text server-side
Update `deepgram-proxy` so it no longer acts as a dumb pass-through only.

The proxy will:
- generate/use a stable transcription session id
- parse Deepgram result messages
- maintain the latest combined transcript draft server-side
- persist draft/final transcript updates for that session
- log close reason + provider metadata against the same session

That gives a backend source of truth even when the browser reconnects, reloads, or submits with stale local state.

### 3. Pass a stable session id from the client
Update `useTranscription` and `TranscriptMic` so each recording session has a durable id.

The client will:
- create a session id when recording starts
- reconnect using the same session id
- expose that session id to the assessment form
- keep local draft as a secondary fallback, not the primary one

### 4. Make save recover from backend before inserting the assessment
Update `SidewaysInterviewCanvas` save logic so transcript resolution becomes:

1. finalized stop result  
2. mic draft in memory  
3. form draft / local persisted draft  
4. backend `transcription_sessions.latest_transcript` for the active session

If any of those contain text, `assessments.transcript` will be populated before insert.

### 5. Link saved assessments to their transcript session
After a successful insert:
- attach the new assessment id to the transcription session
- mark the session as completed
- clear only local client draft state
- keep backend transcript intact for audit/recovery

This prevents “successful save, missing transcript icon” even if the page had bad timing during stop/finalize.

### 6. Add targeted diagnostics so this doesn’t become guesswork again
Add lightweight end-to-end correlation fields/logs:
- client transcription session id
- proxy session id
- Deepgram request id / close metadata when available
- assessment id linked to that session

This will let future failures be traced from recording -> provider -> save -> archive row.

## Files / backend work

### Database
Create a new table, likely `transcription_sessions`, with RLS scoped to:
- authenticated users reading only their own sessions
- super admins reading all sessions
- service/backend writes allowed for proxy persistence

### App files
- `src/hooks/useTranscription.ts`
  - generate/preserve session id
  - expose session id + backend recovery hooks
  - keep local draft as secondary fallback

- `src/components/TranscriptMic.tsx`
  - expose session metadata through the ref
  - continue sending best-available draft upward

- `src/components/SidewaysInterviewCanvas.tsx`
  - fetch backend transcript fallback before assessment insert
  - link assessment id to transcript session after save

### Backend function
- `supabase/functions/deepgram-proxy/index.ts`
  - persist transcript state server-side
  - store structured close/finalize metadata
  - correlate each stream with one durable session id

## Validation

I will verify these exact cases:

1. Full interview, no interruption  
   - save succeeds  
   - archive shows the mic icon  
   - transcript opens correctly

2. Internet drop for a few seconds, then restore  
   - save still works  
   - transcript is recovered from session storage if browser state is empty

3. Disconnect during active speech  
   - partial transcript is still saved

4. Long interview with multiple reconnects  
   - transcript continues accumulating into one session  
   - final archive row is not null

5. Post-save archive check  
   - the inserted assessment row has non-null transcript text, not just the UI icon

## Technical details

- I am intentionally changing the architecture because the current browser-only recovery strategy has already failed in production data.
- No change is needed to the Archive icon logic itself; it already renders correctly when `assessments.transcript` is non-null.
- The critical fix is to introduce a backend transcript source of truth so the final assessment insert cannot silently go out with `transcript: null` after a real recording.
