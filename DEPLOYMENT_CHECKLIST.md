# 🚀 Quick Deployment Checklist

## ✅ What Was Fixed
Your artwork upload system now uses **Supabase Storage** instead of local filesystem, making it work on Vercel production.

## 📋 Steps to Deploy

### 1. Create Supabase Storage Bucket (5 minutes)

1. Visit: https://supabase.com/dashboard/project/xdkoakjnnzfndgeauvbv/storage/buckets
2. Click **"New bucket"**
3. Settings:
   - Name: `artworks`
   - ✅ Check "Public bucket"
   - Click **Create**

### 2. Set Storage Policies

Click on `artworks` bucket → **Policies** tab → **New Policy** → Use these:

**Policy 1: Public Read**
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'artworks');
```

**Policy 2: Authenticated Upload**
```sql
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'artworks' AND auth.role() = 'authenticated');
```

### 3. Add Environment Variables to Vercel

Go to: https://vercel.com/your-project/settings/environment-variables

Add these 3 variables (copy from your `.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=https://xdkoakjnnzfndgeauvbv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important:** Select all environments (Production, Preview, Development)

### 4. Deploy

```bash
git add .
git commit -m "Fix artwork upload for production"
git push origin main
```

Vercel will auto-deploy in ~2 minutes.

## 🧪 Test It

1. Go to your production site
2. Login as artist
3. Dashboard → Upload Artwork
4. Upload an image
5. Check it appears in Gallery

## 📊 Monitor Storage

View uploaded files: https://supabase.com/dashboard/project/xdkoakjnnzfndgeauvbv/storage/buckets/artworks

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Upload failed" | Check bucket exists and is public |
| Images not showing | Verify storage policies are set |
| "Not authenticated" | Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel |

## 📝 Files Changed

- ✅ `app/api/upload/route.ts` - Now uses Supabase Storage
- ✅ `SUPABASE_STORAGE_SETUP.md` - Full documentation
- ✅ `DEPLOYMENT_CHECKLIST.md` - This file

## 💾 Storage Limits

**Free Tier:** 1 GB storage, 2 GB bandwidth/month
**Upgrade:** $25/month for 100 GB if needed

---

**Need help?** Check `SUPABASE_STORAGE_SETUP.md` for detailed instructions.
