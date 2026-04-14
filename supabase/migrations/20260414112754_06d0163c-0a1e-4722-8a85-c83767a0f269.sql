CREATE POLICY "Super admins can read super_admins"
ON public.super_admins
FOR SELECT
TO authenticated
USING (public.is_super_admin((auth.jwt() ->> 'email'::text)));