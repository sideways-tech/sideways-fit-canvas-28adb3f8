DROP POLICY "Anyone can view KRA definitions" ON public.kra_definitions;

CREATE POLICY "Authenticated users can view KRA definitions"
  ON public.kra_definitions FOR SELECT
  TO authenticated
  USING (true);