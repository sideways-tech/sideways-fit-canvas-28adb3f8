
-- Create super_admins table
CREATE TABLE public.super_admins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read (needed for the client-side check)
CREATE POLICY "Authenticated users can read super_admins"
  ON public.super_admins FOR SELECT
  TO authenticated
  USING (true);

-- Only service_role can modify
CREATE POLICY "Service role can insert super_admins"
  ON public.super_admins FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update super_admins"
  ON public.super_admins FOR UPDATE
  TO service_role
  USING (true);

CREATE POLICY "Service role can delete super_admins"
  ON public.super_admins FOR DELETE
  TO service_role
  USING (true);

-- Security definer function to check super admin status
CREATE OR REPLACE FUNCTION public.is_super_admin(check_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.super_admins WHERE email = lower(check_email)
  );
$$;
