# Supabase Storage Setup - Deployment Guide

## ✅ What's Already Done

All upload functionality now uses **Supabase Storage** instead of local filesystem:

### Updated Files:
- ✅ `/app/api/upload/route.ts` - Supports multiple buckets (artworks, profiles, exhibitions)
- ✅ `/app/dashboard/artist/upload/page.tsx` - Artwork uploads → artworks bucket
- ✅ `/app/dashboard/artist/settings/page.tsx` - Profile & QR uploads → profiles bucket
- ✅ `/app/dashboard/admin/exhibitions/page.tsx` - Exhibition images → exhibitions bucket
- ✅ `/components/bulk-upload.tsx` - Bulk artwork uploads → artworks bucket

## 🚀 Deployment Steps

### Step 1: Run SQL Script

1. Go to Supabase Dashboard → SQL Editor
2. Run the script: `supabase-new-buckets.sql`
3. This creates:
   - `profiles` bucket (for avatars, QR codes)
   - `exhibitions` bucket (for exhibition images)
   - Storage policies for both buckets

**Note:** The `artworks` bucket already exists from previous setup.

### Step 2: Verify Buckets

Run this query to verify all buckets exist:

```sql
SELECT id, name, public FROM storage.buckets 
WHERE name IN ('artworks', 'profiles', 'exhibitions');
```

Expected: 3 rows showing all buckets with `public = true`

### Step 3: Deploy to Vercel

Your environment variables are already set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Just push to GitHub and Vercel will auto-deploy.

## 📦 Bucket Usage

| Bucket | Used For | Upload Location |
|--------|----------|----------------|
| `artworks` | Artwork images | Artist Dashboard → Upload Artwork |
| `profiles` | Profile pictures, QR codes | All Dashboards → Settings |
| `exhibitions` | Exhibition images | Admin Dashboard → Exhibitions |

## 🔧 How It Works

### Upload Flow:
1. User selects file in dashboard
2. File sent to `/api/upload` with optional bucket parameter
3. API uploads to Supabase Storage
4. Returns public URL
5. URL saved to database

### Example Upload Code:
```javascript
const formData = new FormData()
formData.append('file', file)
formData.append('bucket', 'profiles') // Optional, defaults to 'artworks'

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
})

const { url } = await response.json()
```

## ✨ Features

- ✅ Works on Vercel (no filesystem needed)
- ✅ Public URLs for all images
- ✅ Automatic file naming (timestamp-based)
- ✅ Multiple bucket support
- ✅ Proper content-type handling
- ✅ Error handling with toast notifications

## 🧪 Testing

1. **Artist Upload**: Login as artist → Upload artwork
2. **Profile Picture**: Any dashboard → Settings → Upload avatar
3. **Exhibition**: Admin dashboard → Exhibitions → Add exhibition with image
4. **Bulk Upload**: Artist dashboard → Upload → Bulk upload tab

All uploads should return URLs like:
`https://[project].supabase.co/storage/v1/object/public/[bucket]/[filename]`

## 🔒 Security

- All buckets are public (images accessible via URL)
- Only authenticated users can upload
- Policies prevent unauthorized modifications
- Service role key used server-side only

## 📝 Notes

- Old local uploads in `/public/uploads/` won't be migrated automatically
- New uploads go to Supabase Storage
- No file size limits configured (uses Supabase defaults)
- Files are never deleted automatically (manual cleanup needed)

---

**Ready to deploy!** Just run the SQL script and push to GitHub.
