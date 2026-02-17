# Database Migrations

This folder contains SQL migration scripts to update your Supabase database.

## How to Apply Migrations

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of each migration file in order:
   - First: `enable-realtime.sql`
   - Second: `create-triggers.sql`
5. Click **Run** to execute each script

### Option 2: Using Supabase CLI

```bash
# Make sure you're in the project directory
cd museum-landing-page

# Run migrations
supabase db push
```

## What These Migrations Do

### 1. enable-realtime.sql
- Enables real-time subscriptions for artworks, likes, reviews, transactions, and users tables
- Sets up Row Level Security (RLS) policies for secure data access
- Creates database indexes for better query performance
- Allows:
  - Public viewing of approved artworks and reviews
  - Users to manage their own likes, reviews, and view their transactions
  - Artists to manage their own artworks

### 2. create-triggers.sql
- Automatically updates `likes_count` on artworks when likes are added/removed
- Automatically updates `updated_at` timestamp when records are modified
- Ensures data consistency without manual updates

## Verification

After running migrations, verify they worked:

1. Check real-time is enabled:
   - Go to **Database** → **Replication** in Supabase dashboard
   - Ensure tables are listed under publications

2. Check policies:
   - Go to **Authentication** → **Policies**
   - You should see policies for artworks, likes, reviews, and transactions

3. Test in your app:
   - Add a comment on an artwork
   - It should appear immediately without refreshing
   - Like an artwork and see the count update in real-time

## Troubleshooting

If real-time updates don't work:
1. Ensure your Supabase project has real-time enabled (check project settings)
2. Verify the tables are added to the `supabase_realtime` publication
3. Check browser console for any subscription errors
4. Ensure RLS policies allow the operations you're trying to perform
