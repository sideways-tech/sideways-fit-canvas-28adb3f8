DROP POLICY IF EXISTS "Scoped candidate read access" ON public.candidates;

CREATE POLICY "Authenticated users can view candidates"
ON public.candidates
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);