-- Migration script to add new features for follow system and artist support
-- Run this on existing database

-- Add unique constraint to follows table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'follows_unique'
  ) THEN
    ALTER TABLE follows ADD CONSTRAINT follows_unique UNIQUE (follower_id, following_id);
  END IF;
END $$;

-- Add self-follow check constraint if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'follows_no_self_follow'
  ) THEN
    ALTER TABLE follows ADD CONSTRAINT follows_no_self_follow CHECK (follower_id != following_id);
  END IF;
END $$;

-- Add unique constraint to likes table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'likes_unique'
  ) THEN
    ALTER TABLE likes ADD CONSTRAINT likes_unique UNIQUE (user_id, artwork_id);
  END IF;
END $$;

-- Add transaction_type column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'transaction_type'
  ) THEN
    ALTER TABLE transactions ADD COLUMN transaction_type text DEFAULT 'purchase'::text 
    CHECK (transaction_type = ANY (ARRAY['purchase'::text, 'support'::text]));
  END IF;
END $$;

-- Make artwork_id nullable in transactions for support payments
ALTER TABLE transactions ALTER COLUMN artwork_id DROP NOT NULL;

-- Create indexes if not exist
CREATE INDEX IF NOT EXISTS idx_artworks_artist_id ON artworks(artist_id);
CREATE INDEX IF NOT EXISTS idx_artworks_status ON artworks(status);
CREATE INDEX IF NOT EXISTS idx_artworks_views ON artworks(views_count DESC);
CREATE INDEX IF NOT EXISTS idx_artworks_likes ON artworks(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_artwork ON likes(artwork_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_artist ON transactions(artist_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create trigger function for artwork likes count
CREATE OR REPLACE FUNCTION update_artwork_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE artworks SET likes_count = likes_count + 1 WHERE id = NEW.artwork_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE artworks SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.artwork_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for artwork likes
DROP TRIGGER IF EXISTS trigger_update_artwork_likes ON likes;
CREATE TRIGGER trigger_update_artwork_likes
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION update_artwork_likes_count();

-- Create trigger function for user followers count
CREATE OR REPLACE FUNCTION update_user_followers_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    UPDATE users SET following_count = following_count + 1 WHERE id = NEW.follower_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE users SET followers_count = GREATEST(0, followers_count - 1) WHERE id = OLD.following_id;
    UPDATE users SET following_count = GREATEST(0, following_count - 1) WHERE id = OLD.follower_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user followers
DROP TRIGGER IF EXISTS trigger_update_user_followers ON follows;
CREATE TRIGGER trigger_update_user_followers
AFTER INSERT OR DELETE ON follows
FOR EACH ROW EXECUTE FUNCTION update_user_followers_count();
