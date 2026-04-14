

# Plan: Fix Build Errors + Live Interview Transcript (Updated)

## Part 1: Fix Build Errors in IndustryMotivationSection.tsx

The file still has stale references from the merge. Changes:

- **Lines 90-91**: Remove `honestyLevel` and `onHonestyChange` from destructured props (not in the interface)
- **Lines 229-235**: Remove the entire HonestyMeter block (component no longer exists/used)
- **Lines 237-295**: Replace old `sidewaysOptions` / `SidewaysMotivationLevel` references with the new `engagementOptions` / `SidewaysEngagement` that are already defined at the top of the file (lines ~53-75). Fix the celebration condition from `"sideways-specific"` to `"opinionated-engaged"`

## Part 2: Speech-to-Text Transcript Feature

### Architecture

```text
Browser Mic → MediaRecorder (WebSocket)
       ↓
Edge Function (deepgram-proxy) — holds API key securely
       ↓
Deepgram Live API (nova-2, diarize=true, language=en-IN)
       ↓
Transcript chunks → Browser (live display)
       ↓
On submit → saved to assessments.transcript column
```

### Updated based on your feedback

- **Language**: `en-IN` (Indian English) as primary, with Hindi code-switching handled by Deepgram's multilingual support
- **Mic position**: Fixed to **bottom-right corner** (not top-right), sticky, inspired by Granola's minimal floating action button
- **Design & animation**: Circular button with subtle pulse when recording, smooth state transitions using Framer Motion. Three states visualized with icon morphing (mic → pause → mic)

### Database change
- Add `transcript` column (type `text`, nullable) to the `assessments` table

### Secret required
- `DEEPGRAM_API_KEY` — will be requested via the secrets tool

### New files

1. **`supabase/functions/deepgram-proxy/index.ts`**
   - WebSocket proxy: browser streams audio in, Deepgram results come back out
   - Keeps `DEEPGRAM_API_KEY` server-side
   - Configures: `model=nova-2`, `diarize=true`, `language=en-IN`, `smart_format=true`

2. **`src/hooks/useTranscription.ts`**
   - Manages `getUserMedia`, `MediaRecorder`, WebSocket connection
   - Exposes: `start()`, `pause()`, `resume()`, `stop()`, `transcript`, `status`
   - Accumulates diarized transcript with speaker labels

3. **`src/components/TranscriptMic.tsx`**
   - Fixed bottom-right floating button (Granola-inspired)
   - Three states: idle (mic icon), recording (animated pulse + pause icon), paused (resume icon)
   - Expandable transcript panel that slides up from the button
   - Framer Motion animations: scale-in on mount, pulse ring while recording, smooth icon transitions

### Integration points
- **SidewaysInterviewCanvas**: Mount `TranscriptMic`, pass transcript into form state, save on submission
- **Dashboard**: Show transcript indicator on assessments; click opens modal with formatted transcript
- **AssessmentReport**: Include transcript section

### UX details
- Bottom-right position with `z-50`, offset from edge (~4rem)
- Recording state: subtle concentric pulse rings (like Granola's breathing animation)
- Collapsible live transcript panel: max-height ~40vh, auto-scrolls to bottom
- Speaker labels shown as "Speaker 1", "Speaker 2" with distinct styling

