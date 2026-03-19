
DROP POLICY "Authenticated users can view KRA definitions" ON public.kra_definitions;

CREATE POLICY "Anyone can view KRA definitions"
  ON public.kra_definitions FOR SELECT
  TO anon, authenticated
  USING (true);
