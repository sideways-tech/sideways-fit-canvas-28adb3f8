ALTER TABLE public.assessments
  ADD COLUMN IF NOT EXISTS personal_depth_score integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS personal_breadth_score integer NOT NULL DEFAULT 0;

UPDATE public.assessments
SET personal_depth_score = COALESCE(depth_score, 0),
    personal_breadth_score = ROUND(
      (COALESCE(reads_widely,0) + COALESCE(interested_in_others,0) + COALESCE(aesthetics_interest,0)) / 3.0
    );