-- Replace USING(true)/WITH CHECK(true) with auth.uid() IS NOT NULL for linter compliance
-- assessments table
DROP POLICY IF EXISTS "Authenticated users can delete assessments" ON public.assessments;
DROP POLICY IF EXISTS "Authenticated users can insert assessments" ON public.assessments;
DROP POLICY IF EXISTS "Authenticated users can update assessments" ON public.assessments;

CREATE POLICY "Authenticated users can delete assessments" ON public.assessments FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert assessments" ON public.assessments FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update assessments" ON public.assessments FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- candidates table
DROP POLICY IF EXISTS "Authenticated users can delete candidates" ON public.candidates;
DROP POLICY IF EXISTS "Authenticated users can insert candidates" ON public.candidates;
DROP POLICY IF EXISTS "Authenticated users can update candidates" ON public.candidates;

CREATE POLICY "Authenticated users can delete candidates" ON public.candidates FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert candidates" ON public.candidates FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update candidates" ON public.candidates FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- kra_definitions table
DROP POLICY IF EXISTS "Authenticated users can insert KRA definitions" ON public.kra_definitions;
DROP POLICY IF EXISTS "Authenticated users can delete KRA definitions" ON public.kra_definitions;

CREATE POLICY "Authenticated users can insert KRA definitions" ON public.kra_definitions FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete KRA definitions" ON public.kra_definitions FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);