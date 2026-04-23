-- Transcription sessions: server-side source of truth for live transcripts
CREATE TABLE public.transcription_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  interviewer_email TEXT,
  status TEXT NOT NULL DEFAULT 'recording',
  latest_transcript TEXT DEFAULT '',
  final_transcript TEXT,
  deepgram_request_id TEXT,
  close_code INTEGER,
  close_reason TEXT,
  audio_chunks INTEGER NOT NULL DEFAULT 0,
  audio_bytes BIGINT NOT NULL DEFAULT 0,
  assessment_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transcription_sessions_interviewer ON public.transcription_sessions(interviewer_email);
CREATE INDEX idx_transcription_sessions_assessment ON public.transcription_sessions(assessment_id);
CREATE INDEX idx_transcription_sessions_created ON public.transcription_sessions(created_at DESC);

ALTER TABLE public.transcription_sessions ENABLE ROW LEVEL SECURITY;

-- Interviewer can read their own sessions; super admins read all
CREATE POLICY "Scoped transcription session read"
ON public.transcription_sessions
FOR SELECT
TO authenticated
USING (
  (interviewer_email = (auth.jwt() ->> 'email'))
  OR public.is_super_admin((auth.jwt() ->> 'email'))
);

-- Authenticated users can create their own session rows (client bootstraps the id)
CREATE POLICY "Authenticated users can insert their own transcription sessions"
ON public.transcription_sessions
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND (
    interviewer_email IS NULL
    OR interviewer_email = (auth.jwt() ->> 'email')
  )
);

-- Authenticated users can update their own sessions (e.g. link assessment_id after save)
CREATE POLICY "Authenticated users can update their own transcription sessions"
ON public.transcription_sessions
FOR UPDATE
TO authenticated
USING (
  (interviewer_email = (auth.jwt() ->> 'email'))
  OR public.is_super_admin((auth.jwt() ->> 'email'))
)
WITH CHECK (
  (interviewer_email = (auth.jwt() ->> 'email'))
  OR public.is_super_admin((auth.jwt() ->> 'email'))
);

-- Service role full access (used by deepgram-proxy edge function)
CREATE POLICY "Service role full access to transcription sessions"
ON public.transcription_sessions
FOR ALL
TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Auto-update timestamp
CREATE TRIGGER update_transcription_sessions_updated_at
BEFORE UPDATE ON public.transcription_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();