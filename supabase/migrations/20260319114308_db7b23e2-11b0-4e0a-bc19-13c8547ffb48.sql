
CREATE POLICY "Anon users can delete assessments"
ON public.assessments
FOR DELETE
TO anon
USING (true);

CREATE POLICY "Authenticated users can delete assessments"
ON public.assessments
FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Anon users can delete candidates"
ON public.candidates
FOR DELETE
TO anon
USING (true);

CREATE POLICY "Authenticated users can delete candidates"
ON public.candidates
FOR DELETE
TO authenticated
USING (true);
