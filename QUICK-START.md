# Quick Start Guide

## 1. Supabase Setup (5 minutes)

### Create Project
1. Go to https://supabase.com
2. Click "New Project"
3. Fill in project details
4. Wait for project to be ready

### Run SQL Schema
1. Click "SQL Editor" in left sidebar
2. Click "New Query"
3. Open `supabase-schema.sql` from project root
4. Copy entire contents
5. Paste into SQL Editor
6. Click "Run" button
7. Wait for success message

### Create Storage Bucket
1. Click "Storage" in left sidebar
2. Click "Create bucket"
3. Name: `artworks`
4. Make it public: Toggle ON
5. Click "Create bucket"

### Get API Credentials
1. Click "Settings" (gear icon)
2. Click "API" in left menu
3. Copy "Project URL"
4. Copy "anon public" key

## 2. Local Setup (2 minutes)

### Configure Environment
```bash
# Copy example file
cp .env.example .env.local

# Edit .env.local and paste your credentials
NEXT_PUBLIC_SUPABASE_URL=paste_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste_anon_key_here
```

### Install & Run
```bash
npm install
npm run dev
```

## 3. Create Admin Account (2 minutes)

### Sign Up
1. Go to http://localhost:3000/signup
2. Select "Collector" role (we'll change it)
3. Fill in details
4. Click "Create Account"

### Make Admin
1. Go to Supabase Dashboard
2. Click "Authentication" > "Users"
3. Find your user, copy the UUID
4. Click "SQL Editor"
5. Run this query (replace UUID):
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'your-user-uuid-here';
```

### Login as Admin
1. Go to http://localhost:3000/login
2. Login with your credentials
3. You'll be redirected to admin dashboard

## 4. Test the System

### As Admin
1. Go to Exhibitions page
2. Create a test exhibition
3. Go to Users page to see all users

### As Artist
1. Logout
2. Sign up new account as "Artist"
3. Go to Upload page
4. Upload a test artwork
5. Go to Settings
6. Add UPI ID and generate QR code

### As Admin (Approve Artwork)
1. Logout and login as admin
2. Dashboard shows pending artworks
3. Click "Approve" on the artwork

### As Collector
1. Logout
2. Sign up new account as "Collector"
3. Browse approved artworks
4. View purchases, favorites, comments

## Common Issues

### "Invalid API key"
- Check .env.local has correct credentials
- Restart dev server after changing .env.local

### "Row Level Security policy violation"
- Make sure SQL schema ran completely
- Check user is authenticated

### "Storage bucket not found"
- Create "artworks" bucket in Supabase Storage
- Make sure it's public

### Images not uploading
- Check storage bucket exists
- Check bucket is public
- Check file size (max 50MB by default)

## File Structure Reference

```
Key Files:
├── supabase-schema.sql          # Database schema
├── .env.local                   # Your credentials (create this)
├── SETUP-GUIDE.md              # Full documentation
├── app/
│   ├── login/page.tsx          # Login page
│   ├── signup/page.tsx         # Signup page
│   └── dashboard/
│       ├── artist/             # Artist dashboard
│       ├── collector/          # Collector dashboard
│       └── admin/              # Admin dashboard
└── lib/
    ├── auth.ts                 # Auth functions
    ├── supabase.ts             # Supabase client
    └── types.ts                # TypeScript types
```

## URLs

- **Homepage**: http://localhost:3000
- **Login**: http://localhost:3000/login
- **Signup**: http://localhost:3000/signup
- **Artist Dashboard**: http://localhost:3000/dashboard/artist
- **Collector Dashboard**: http://localhost:3000/dashboard/collector
- **Admin Dashboard**: http://localhost:3000/dashboard/admin

## Default Credentials

You create your own during signup. There are no default credentials.

## Need Help?

1. Check SETUP-GUIDE.md for detailed instructions
2. Check Supabase logs in Dashboard > Logs
3. Check browser console for errors (F12)
4. Check terminal for server errors
