
-- Allow anon to insert candidates
CREATE POLICY "Anon users can insert candidates"
ON public.candidates
FOR INSERT TO anon
WITH CHECK (true);

-- Allow anon to update candidates
CREATE POLICY "Anon users can update candidates"
ON public.candidates
FOR UPDATE TO anon
USING (true);

-- Allow anon to select candidates
CREATE POLICY "Anon users can view candidates"
ON public.candidates
FOR SELECT TO anon
USING (true);

-- Allow anon to insert assessments
CREATE POLICY "Anon users can insert assessments"
ON public.assessments
FOR INSERT TO anon
WITH CHECK (true);

-- Allow anon to select assessments
CREATE POLICY "Anon users can view assessments"
ON public.assessments
FOR SELECT TO anon
USING (true);

-- Allow anon to update assessments
CREATE POLICY "Anon users can update assessments"
ON public.assessments
FOR UPDATE TO anon
USING (true);
