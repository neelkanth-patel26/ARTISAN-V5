-- ============================================
-- Supabase Storage Policies for Artworks Bucket
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================

-- Policy 1: Allow public read access to all artworks
CREATE POLICY "Public Access - Anyone can view artworks"
ON storage.objects FOR SELECT
USING (bucket_id = 'artworks');

-- Policy 2: Allow authenticated users to upload artworks
CREATE POLICY "Authenticated Upload - Artists can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'artworks' 
  AND auth.role() = 'authenticated'
);

-- Policy 3: Allow users to update their own uploads
CREATE POLICY "Update Own Files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'artworks' AND auth.role() = 'authenticated')
WITH CHECK (bucket_id = 'artworks' AND auth.role() = 'authenticated');

-- Policy 4: Allow users to delete their own uploads
CREATE POLICY "Delete Own Files"
ON storage.objects FOR DELETE
USING (bucket_id = 'artworks' AND auth.role() = 'authenticated');

-- ============================================
-- Verification Query
-- Run this to check if policies were created
-- ============================================
SELECT 
  policyname, 
  cmd as operation,
  qual as using_expression
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage';
