-- ============================================
-- Supabase Storage - Additional Buckets Setup
-- Run this in: Supabase Dashboard → SQL Editor
-- Note: artworks bucket already exists
-- ============================================

-- Create profiles bucket (for profile pictures and QR codes)
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create exhibitions bucket (for exhibition images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('exhibitions', 'exhibitions', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ============================================
-- Storage Policies for profiles bucket
-- ============================================

DROP POLICY IF EXISTS "Public read profiles" ON storage.objects;
CREATE POLICY "Public read profiles"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profiles');

DROP POLICY IF EXISTS "Auth upload profiles" ON storage.objects;
CREATE POLICY "Auth upload profiles"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profiles');

DROP POLICY IF EXISTS "Auth update profiles" ON storage.objects;
CREATE POLICY "Auth update profiles"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profiles');

DROP POLICY IF EXISTS "Auth delete profiles" ON storage.objects;
CREATE POLICY "Auth delete profiles"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profiles');

-- ============================================
-- Storage Policies for exhibitions bucket
-- ============================================

DROP POLICY IF EXISTS "Public read exhibitions" ON storage.objects;
CREATE POLICY "Public read exhibitions"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'exhibitions');

DROP POLICY IF EXISTS "Auth upload exhibitions" ON storage.objects;
CREATE POLICY "Auth upload exhibitions"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'exhibitions');

DROP POLICY IF EXISTS "Auth update exhibitions" ON storage.objects;
CREATE POLICY "Auth update exhibitions"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'exhibitions');

DROP POLICY IF EXISTS "Auth delete exhibitions" ON storage.objects;
CREATE POLICY "Auth delete exhibitions"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'exhibitions');

-- ============================================
-- Verification
-- ============================================

SELECT id, name, public FROM storage.buckets 
WHERE name IN ('artworks', 'profiles', 'exhibitions');
