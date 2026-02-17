# Quick Start Guide

## 🚀 Setup in 3 Steps

### 1. Run Database Setup
Open Supabase SQL Editor and run:
```
database-setup.sql
```

### 2. Test Login
Go to `/login` and use:
- **Admin**: admin@test.com / admin123
- **Artist**: artist@test.com / artist123  
- **Collector**: collector@test.com / collector123

### 3. Start Coding
Use the API functions in `lib/api.ts` for all dashboard operations.

## 📁 Files Created

- `database-setup.sql` - Complete database schema with test data
- `lib/api.ts` - All API functions for dashboard
- `lib/auth.ts` - Updated authentication (already in place)
- `BACKEND-SETUP.md` - Detailed documentation

## ✅ What's Working

✓ User authentication (login/signup)
✓ Role-based redirects (admin/artist/collector)
✓ Dashboard layouts
✓ Profile loading
✓ All database tables created
✓ Test users inserted
✓ API functions ready to use

## 🎯 Next Steps

1. Run `database-setup.sql` in Supabase
2. Test login with provided credentials
3. Build dashboard features using `lib/api.ts` functions
4. Add artwork upload, user management, etc.

## 🔑 Test Credentials

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| Admin | admin@test.com | admin123 | /dashboard/admin |
| Artist | artist@test.com | artist123 | /dashboard/artist |
| Collector | collector@test.com | collector123 | /dashboard/collector |
