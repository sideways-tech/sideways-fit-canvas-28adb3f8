
CREATE TABLE public.kra_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discipline text NOT NULL,
  kra_number integer NOT NULL,
  kra_name text NOT NULL,
  sub_kra_name text NOT NULL,
  level text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_kra_definitions_discipline_level ON public.kra_definitions (discipline, level);

ALTER TABLE public.kra_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view KRA definitions"
  ON public.kra_definitions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert KRA definitions"
  ON public.kra_definitions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete KRA definitions"
  ON public.kra_definitions FOR DELETE
  TO authenticated
  USING (true);
