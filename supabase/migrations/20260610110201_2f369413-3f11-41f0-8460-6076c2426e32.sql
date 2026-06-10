DROP POLICY IF EXISTS "Authenticated users can view candidates" ON public.candidates;

CREATE POLICY "Scoped candidate read access"
ON public.candidates
FOR SELECT
TO authenticated
USING (
  public.is_super_admin(auth.jwt() ->> 'email')
  OR EXISTS (
    SELECT 1 FROM public.assessments a
    WHERE a.candidate_id = candidates.id
      AND a.interviewer_email = (auth.jwt() ->> 'email')
  )
);

UPDATE public.super_admins SET email = lower(email) WHERE email <> lower(email);

CREATE OR REPLACE FUNCTION public.is_super_admin(check_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.super_admins
    WHERE lower(email) = lower(check_email)
  );
$$;

REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_super_admin(text) TO authenticated, service_role;

CREATE POLICY "Super admins can update CVs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'cvs' AND public.is_super_admin(auth.jwt() ->> 'email'))
WITH CHECK (bucket_id = 'cvs' AND public.is_super_admin(auth.jwt() ->> 'email'));

CREATE POLICY "Super admins can delete CVs"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'cvs' AND public.is_super_admin(auth.jwt() ->> 'email'));