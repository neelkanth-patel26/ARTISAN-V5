-- ============================================
-- Supabase Storage Verification Script
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================

-- Check if artworks bucket exists
SELECT 
  id,
  name,
  public,
  created_at
FROM storage.buckets 
WHERE name = 'artworks';

-- Expected result: 1 row with name='artworks' and public=true
-- If no results: Create the bucket first!

-- ============================================

-- Check storage policies
SELECT 
  policyname as "Policy Name",
  cmd as "Operation",
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as "Using",
  CASE 
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
    ELSE 'No WITH CHECK clause'
  END as "With Check"
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
ORDER BY policyname;

-- Expected result: At least 2-4 policies
-- Should see: SELECT, INSERT, UPDATE, DELETE policies
-- If no results: Run the policies from supabase-storage-policies.sql

-- ============================================

-- Check if any artworks have been uploaded
SELECT 
  COUNT(*) as total_artworks,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
  COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
FROM artworks;

-- ============================================

-- Check storage usage
SELECT 
  bucket_id,
  COUNT(*) as file_count,
  pg_size_pretty(SUM(metadata->>'size')::bigint) as total_size
FROM storage.objects
WHERE bucket_id = 'artworks'
GROUP BY bucket_id;

-- Shows how many files and total storage used

-- ============================================

-- List recent uploads (last 10)
SELECT 
  name as filename,
  created_at,
  pg_size_pretty((metadata->>'size')::bigint) as file_size,
  metadata->>'mimetype' as mime_type
FROM storage.objects
WHERE bucket_id = 'artworks'
ORDER BY created_at DESC
LIMIT 10;

-- ============================================

-- Verify artworks table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'artworks'
  AND column_name IN ('id', 'artist_id', 'title', 'image_url', 'status', 'price')
ORDER BY ordinal_position;

-- Expected: All these columns should exist

-- ============================================
-- VERIFICATION CHECKLIST
-- ============================================

/*
✅ Bucket exists and is public
✅ Storage policies are set (at least 2)
✅ Artworks table has image_url column
✅ Can see uploaded files (if any)

If all checks pass, your setup is complete! 🎉

If any check fails:
1. Bucket missing → Create 'artworks' bucket
2. Not public → Edit bucket settings
3. No policies → Run supabase-storage-policies.sql
4. No image_url column → Check database migration
*/
