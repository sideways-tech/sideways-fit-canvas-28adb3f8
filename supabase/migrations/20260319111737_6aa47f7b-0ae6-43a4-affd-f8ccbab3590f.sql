
-- Allow anon to upload files to the cvs bucket
CREATE POLICY "Anon users can upload CVs"
ON storage.objects
FOR INSERT TO anon
WITH CHECK (bucket_id = 'cvs');

-- Allow anon to read files from the cvs bucket
CREATE POLICY "Anon users can read CVs"
ON storage.objects
FOR SELECT TO anon
USING (bucket_id = 'cvs');
