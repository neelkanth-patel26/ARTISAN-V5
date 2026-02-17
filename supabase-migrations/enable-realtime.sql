-- Enable real-time for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE artworks;
ALTER PUBLICATION supabase_realtime ADD TABLE likes;
ALTER PUBLICATION supabase_realtime ADD TABLE reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE users;

-- Disable RLS for reviews table since we use custom auth
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON reviews;
DROP POLICY IF EXISTS "Users can insert their own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can view their own reviews" ON reviews;

-- Disable RLS for likes table
ALTER TABLE likes DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view likes" ON likes;
DROP POLICY IF EXISTS "Users can insert their own likes" ON likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON likes;

-- Disable RLS for artworks table
ALTER TABLE artworks DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view approved artworks" ON artworks;
DROP POLICY IF EXISTS "Artists can insert their own artworks" ON artworks;
DROP POLICY IF EXISTS "Artists can update their own artworks" ON artworks;

-- Disable RLS for transactions table
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own purchases" ON transactions;
DROP POLICY IF EXISTS "Artists can view their sales" ON transactions;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_artworks_status ON artworks(status);
CREATE INDEX IF NOT EXISTS idx_artworks_artist_id ON artworks(artist_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_artwork_id ON likes(artwork_id);
CREATE INDEX IF NOT EXISTS idx_reviews_artwork_id ON reviews(artwork_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_artist_id ON transactions(artist_id);
