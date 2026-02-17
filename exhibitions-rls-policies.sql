-- Keep RLS disabled since we're using custom auth with RPC functions
-- RPC functions with SECURITY DEFINER bypass RLS securely
ALTER TABLE artworks DISABLE ROW LEVEL SECURITY;
ALTER TABLE exhibitions DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE follows DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE visit_bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Security is handled by:
-- 1. RPC functions with SECURITY DEFINER that validate user permissions
-- 2. Application-level checks in the RPC function logic
-- 3. Custom authentication system storing user sessions
