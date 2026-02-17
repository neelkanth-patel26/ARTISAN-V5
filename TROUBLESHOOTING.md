# Troubleshooting Guide

## Common Issues and Solutions

### 1. "Invalid API key" or "Failed to fetch"

**Problem**: Supabase credentials not configured correctly

**Solutions**:
```bash
# Check .env.local exists
ls -la .env.local

# Verify it has both variables
cat .env.local

# Should show:
# NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Restart dev server after changes
npm run dev
```

### 2. "Row Level Security policy violation"

**Problem**: RLS policies not set up or user not authenticated

**Solutions**:
1. Verify SQL schema ran completely in Supabase
2. Check user is logged in
3. Verify user role matches the dashboard they're accessing
4. Check Supabase Dashboard > Authentication > Policies

### 3. Login redirects to wrong dashboard

**Problem**: User role not set correctly

**Solution**:
```sql
-- Check user role in Supabase SQL Editor
SELECT id, email, role FROM profiles WHERE email = 'user@example.com';

-- Update role if needed
UPDATE profiles SET role = 'artist' WHERE email = 'user@example.com';
-- Options: 'artist', 'collector', 'admin'
```

### 4. Images not uploading

**Problem**: Storage bucket not configured

**Solutions**:
1. Go to Supabase Dashboard > Storage
2. Create bucket named `artworks` (exact name)
3. Make it public:
   - Click bucket
   - Click "Policies"
   - Add policy: "Allow public read access"
   - Add policy: "Allow authenticated uploads"

### 5. "Cannot read properties of null"

**Problem**: User not authenticated or profile not loaded

**Solutions**:
1. Check if user is logged in
2. Verify profile exists in database
3. Check browser console for specific error
4. Clear browser cache and cookies

### 6. Dashboard shows "Loading..." forever

**Problem**: Database query failing or infinite loop

**Solutions**:
1. Check browser console for errors
2. Check Supabase Dashboard > Logs
3. Verify RLS policies allow the query
4. Check network tab for failed requests

### 7. Signup succeeds but can't login

**Problem**: Email verification required

**Solutions**:
1. Check email for verification link
2. Or disable email verification in Supabase:
   - Dashboard > Authentication > Settings
   - Disable "Enable email confirmations"

### 8. "Failed to create profile"

**Problem**: Trigger or constraint issue

**Solutions**:
```sql
-- Check if profile was created
SELECT * FROM profiles WHERE email = 'user@example.com';

-- If not, create manually
INSERT INTO profiles (id, email, full_name, role, status)
VALUES (
  'user-uuid-from-auth-users',
  'user@example.com',
  'User Name',
  'collector',
  'active'
);
```

### 9. QR Code not generating

**Problem**: qrcode library issue or UPI ID format

**Solutions**:
1. Verify UPI ID format: `username@bank`
2. Check browser console for errors
3. Verify qrcode package installed:
```bash
npm list qrcode
# If not found:
npm install qrcode
```

### 10. Mobile bottom bar not showing

**Problem**: CSS or responsive breakpoint issue

**Solutions**:
1. Check screen width is < 1024px
2. Inspect element to verify classes
3. Clear browser cache
4. Check if `lg:` classes are working

### 11. "Module not found" errors

**Problem**: Missing dependencies

**Solutions**:
```bash
# Reinstall all dependencies
rm -rf node_modules package-lock.json
npm install

# Or install specific missing package
npm install @supabase/supabase-js
npm install qrcode
npm install sonner
```

### 12. TypeScript errors

**Problem**: Type mismatches or missing types

**Solutions**:
```bash
# Install type definitions
npm install --save-dev @types/qrcode

# Restart TypeScript server in VS Code
# Cmd/Ctrl + Shift + P > "TypeScript: Restart TS Server"
```

### 13. Artwork approval not working

**Problem**: Admin permissions or RLS policy

**Solutions**:
```sql
-- Verify user is admin
SELECT role FROM profiles WHERE id = 'your-user-id';

-- Check artwork status
SELECT id, title, status FROM artworks WHERE status = 'pending';

-- Manually approve if needed
UPDATE artworks SET status = 'approved', approved_at = NOW() WHERE id = 'artwork-id';
```

### 14. Earnings not showing

**Problem**: No completed transactions

**Solutions**:
```sql
-- Check transactions
SELECT * FROM transactions WHERE artist_id = 'your-user-id';

-- Create test transaction
INSERT INTO transactions (
  transaction_code,
  buyer_id,
  artwork_id,
  artist_id,
  amount,
  platform_fee,
  artist_earnings,
  payment_method,
  status
) VALUES (
  'TEST-' || gen_random_uuid(),
  'buyer-user-id',
  'artwork-id',
  'artist-user-id',
  1000.00,
  100.00,
  900.00,
  'upi',
  'completed'
);
```

### 15. Navigation not updating after login

**Problem**: State not refreshing

**Solutions**:
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Check if router.push() is being called
4. Verify authentication state is updating

## Debugging Tips

### Check Supabase Logs
1. Go to Supabase Dashboard
2. Click "Logs" in sidebar
3. Filter by error level
4. Look for recent errors

### Check Browser Console
```javascript
// Open browser console (F12)
// Check for errors (red text)
// Check network tab for failed requests
// Check application tab for stored data
```

### Check Database Directly
```sql
-- Count records
SELECT COUNT(*) FROM profiles;
SELECT COUNT(*) FROM artworks;
SELECT COUNT(*) FROM transactions;

-- Check recent records
SELECT * FROM profiles ORDER BY created_at DESC LIMIT 5;
SELECT * FROM artworks ORDER BY created_at DESC LIMIT 5;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'artworks';
```

### Test Authentication
```javascript
// In browser console
const { data: { user } } = await supabase.auth.getUser()
console.log(user)

// Should show user object if logged in
// null if not logged in
```

### Verify Environment Variables
```javascript
// In browser console
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

// Should show your Supabase credentials
// If undefined, .env.local not loaded
```

## Performance Issues

### Slow Page Load
1. Check image sizes (optimize large images)
2. Check number of database queries
3. Add pagination for large datasets
4. Enable caching

### Slow Image Upload
1. Compress images before upload
2. Check internet connection
3. Check Supabase Storage limits
4. Verify bucket region

## Security Concerns

### Exposed API Keys
- NEXT_PUBLIC_* variables are safe to expose
- They're meant for client-side use
- RLS policies protect your data

### User Can Access Other User's Data
1. Check RLS policies are enabled
2. Verify policies use auth.uid()
3. Test with different users

## Database Issues

### Table Not Found
```sql
-- List all tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- If missing, re-run schema
-- Copy supabase-schema.sql and run in SQL Editor
```

### Constraint Violation
```sql
-- Check constraints
SELECT conname, contype FROM pg_constraint WHERE conrelid = 'artworks'::regclass;

-- Common issues:
-- - Foreign key doesn't exist
-- - Unique constraint violated
-- - Check constraint failed
```

## Getting Help

### Information to Provide
1. Error message (full text)
2. Browser console screenshot
3. Supabase logs screenshot
4. Steps to reproduce
5. Expected vs actual behavior

### Useful Commands
```bash
# Check Node version
node --version

# Check npm version
npm --version

# Check Next.js version
npm list next

# Check all dependencies
npm list

# Clear Next.js cache
rm -rf .next

# Restart everything
rm -rf .next node_modules
npm install
npm run dev
```

### Reset Everything
```bash
# Nuclear option - start fresh
rm -rf .next node_modules package-lock.json
npm install
npm run dev

# In Supabase, drop and recreate tables
# (WARNING: Deletes all data)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
-- Then re-run supabase-schema.sql
```

## Still Having Issues?

1. Check SETUP-GUIDE.md for detailed setup
2. Check QUICK-START.md for basic setup
3. Check CHECKLIST.md for testing steps
4. Review supabase-schema.sql for database structure
5. Check Supabase documentation
6. Check Next.js documentation

## Quick Fixes

```bash
# Fix 1: Restart everything
npm run dev

# Fix 2: Clear cache
rm -rf .next

# Fix 3: Reinstall dependencies
rm -rf node_modules
npm install

# Fix 4: Check environment
cat .env.local

# Fix 5: Check Supabase connection
# Go to Supabase Dashboard > Settings > API
# Verify URL and key match .env.local
```

## Prevention

1. Always run SQL schema completely
2. Create storage bucket before uploading
3. Set environment variables before starting
4. Create admin user before testing admin features
5. Test authentication before testing features
6. Check browser console regularly
7. Monitor Supabase logs
8. Keep dependencies updated

---

**Remember**: Most issues are configuration-related. Double-check:
1. ✅ SQL schema ran completely
2. ✅ Storage bucket created
3. ✅ Environment variables set
4. ✅ Dependencies installed
5. ✅ Dev server restarted after changes
