-- ============================================
-- Supabase Storage Buckets Setup
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================

-- Create profiles bucket (for profile pictures)
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

DROP POLICY IF EXISTS "Public read access for profiles" ON storage.objects;
CREATE POLICY "Public read access for profiles"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profiles');

DROP POLICY IF EXISTS "Authenticated users can upload profiles" ON storage.objects;
CREATE POLICY "Authenticated users can upload profiles"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profiles');

DROP POLICY IF EXISTS "Users can update own profiles" ON storage.objects;
CREATE POLICY "Users can update own profiles"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profiles');

DROP POLICY IF EXISTS "Users can delete own profiles" ON storage.objects;
CREATE POLICY "Users can delete own profiles"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profiles');

-- ============================================
-- Storage Policies for exhibitions bucket
-- ============================================

DROP POLICY IF EXISTS "Public read access for exhibitions" ON storage.objects;
CREATE POLICY "Public read access for exhibitions"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'exhibitions');

DROP POLICY IF EXISTS "Authenticated users can upload exhibitions" ON storage.objects;
CREATE POLICY "Authenticated users can upload exhibitions"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'exhibitions');

DROP POLICY IF EXISTS "Users can update exhibitions" ON storage.objects;
CREATE POLICY "Users can update exhibitions"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'exhibitions');

DROP POLICY IF EXISTS "Users can delete exhibitions" ON storage.objects;
CREATE POLICY "Users can delete exhibitions"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'exhibitions');

-- ============================================
-- Verification Query
-- ============================================

SELECT 
  id,
  name,
  public,
  created_at
FROM storage.buckets 
WHERE name IN ('artworks', 'profiles', 'exhibitions')
ORDER BY name;

-- ============================================
-- NOTES
-- ============================================

/*
✅ Buckets:
   - artworks: Already exists (for artwork images)
   - profiles: For profile pictures and QR codes  
   - exhibitions: For exhibition images

✅ All buckets are public (images accessible via URL)

✅ Policies allow:
   - Anyone to read/view images
   - Authenticated users to upload
   - Users to manage their uploads

🔧 Usage:
   - Upload endpoint: /api/upload
   - Add bucket parameter: formData.append('bucket', 'profiles')
   - Default bucket: 'artworks'

📝 Bucket URLs:
   - https://[project].supabase.co/storage/v1/object/public/artworks/[filename]
   - https://[project].supabase.co/storage/v1/object/public/profiles/[filename]
   - https://[project].supabase.co/storage/v1/object/public/exhibitions/[filename]
*/
