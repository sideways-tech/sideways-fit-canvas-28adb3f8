-- Create candidates table (one row per unique candidate)
CREATE TABLE public.candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT,
  department TEXT,
  hiring_level TEXT,
  education TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assessments table (one row per interview round)
CREATE TABLE public.assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL DEFAULT 1,
  interviewer_name TEXT NOT NULL,
  cv_file_path TEXT,
  background_notes TEXT,
  interested_in_others INTEGER DEFAULT 30,
  reads_widely INTEGER DEFAULT 30,
  recent_read_example TEXT,
  interests_passions_notes TEXT,
  depth_topic TEXT,
  depth_score INTEGER DEFAULT 30,
  aesthetics_interest INTEGER DEFAULT 30,
  aesthetics_process_note TEXT,
  depth_of_craft INTEGER DEFAULT 30,
  articulation_skill INTEGER DEFAULT 30,
  portfolio_quality INTEGER DEFAULT 30,
  problem_solving_approach INTEGER DEFAULT 30,
  professional_breadth INTEGER DEFAULT 30,
  professional_dive_notes TEXT,
  resilience_score INTEGER DEFAULT 0,
  diagnostic_level TEXT,
  honesty_level TEXT,
  sideways_website_feedback TEXT,
  motivation_level TEXT,
  motivation_reason TEXT,
  sideways_motivation_level TEXT,
  sideways_motivation_reason TEXT,
  person_score INTEGER,
  professional_score INTEGER,
  mindset_score INTEGER,
  overall_score INTEGER,
  verdict TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(candidate_id, round_number)
);

-- Enable RLS
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- RLS policies (all authenticated users can CRUD - shared org data)
CREATE POLICY "Authenticated users can view candidates" ON public.candidates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert candidates" ON public.candidates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update candidates" ON public.candidates FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view assessments" ON public.assessments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert assessments" ON public.assessments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update assessments" ON public.assessments FOR UPDATE TO authenticated USING (true);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON public.candidates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON public.assessments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CV storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('cvs', 'cvs', false);

CREATE POLICY "Authenticated users can upload CVs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'cvs');
CREATE POLICY "Authenticated users can view CVs" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'cvs');