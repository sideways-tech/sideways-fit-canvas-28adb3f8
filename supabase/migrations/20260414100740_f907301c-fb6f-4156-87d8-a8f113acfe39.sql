
-- Drop anon policies on candidates
DROP POLICY IF EXISTS "Anon users can view candidates" ON public.candidates;
DROP POLICY IF EXISTS "Anon users can insert candidates" ON public.candidates;
DROP POLICY IF EXISTS "Anon users can update candidates" ON public.candidates;
DROP POLICY IF EXISTS "Anon users can delete candidates" ON public.candidates;

-- Drop anon policies on assessments
DROP POLICY IF EXISTS "Anon users can view assessments" ON public.assessments;
DROP POLICY IF EXISTS "Anon users can insert assessments" ON public.assessments;
DROP POLICY IF EXISTS "Anon users can update assessments" ON public.assessments;
DROP POLICY IF EXISTS "Anon users can delete assessments" ON public.assessments;

-- Fix super_admins: replace open authenticated SELECT with service_role only
DROP POLICY IF EXISTS "Authenticated users can read super_admins" ON public.super_admins;

CREATE POLICY "Service role can read super_admins"
ON public.super_admins FOR SELECT TO service_role
USING (true);

-- Scope assessments SELECT: interviewers see own, super admins see all
DROP POLICY IF EXISTS "Authenticated users can view assessments" ON public.assessments;

CREATE POLICY "Scoped assessment read access"
ON public.assessments FOR SELECT TO authenticated
USING (
  interviewer_email = (auth.jwt()->>'email')
  OR public.is_super_admin(auth.jwt()->>'email')
);
