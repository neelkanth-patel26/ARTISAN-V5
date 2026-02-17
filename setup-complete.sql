-- Drop all existing tables and policies
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS visit_bookings CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS follows CASCADE;
DROP TABLE IF EXISTS artworks CASCADE;
DROP TABLE IF EXISTS exhibitions CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  phone text,
  location text,
  avatar_url text,
  role text NOT NULL CHECK (role IN ('admin', 'artist', 'collector')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
  bio text,
  website text,
  upi_id text,
  upi_qr_code text,
  followers_count integer DEFAULT 0,
  following_count integer DEFAULT 0,
  total_views integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_active_at timestamptz DEFAULT now()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image_url text,
  artwork_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Artworks table
CREATE TABLE IF NOT EXISTS artworks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  thumbnail_url text,
  price numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_featured boolean DEFAULT false,
  is_sold boolean DEFAULT false,
  views_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  dimensions text,
  medium text,
  year_created integer,
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  approved_by uuid REFERENCES users(id)
);

-- Exhibitions table
CREATE TABLE IF NOT EXISTS exhibitions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  location text NOT NULL,
  image_url text,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  visitors_count integer DEFAULT 0,
  artworks_count integer DEFAULT 0,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Follows table
CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Likes table
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  artwork_id uuid NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, artwork_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  link text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  artwork_id uuid REFERENCES artworks(id) ON DELETE CASCADE,
  artist_id uuid REFERENCES users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_code text UNIQUE NOT NULL,
  buyer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  artwork_id uuid NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  artist_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  platform_fee numeric NOT NULL,
  artist_earnings numeric NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('credit_card', 'debit_card', 'upi', 'net_banking', 'wallet')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_gateway_id text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Visit bookings table
CREATE TABLE IF NOT EXISTS visit_bookings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  visitor_name text NOT NULL,
  visitor_email text NOT NULL,
  visitor_phone text NOT NULL,
  visit_date date NOT NULL,
  visit_time time NOT NULL,
  number_of_visitors integer NOT NULL CHECK (number_of_visitors > 0),
  special_requirements text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_artworks_artist ON artworks(artist_id);
CREATE INDEX IF NOT EXISTS idx_artworks_category ON artworks(category_id);
CREATE INDEX IF NOT EXISTS idx_artworks_status ON artworks(status);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_artist ON transactions(artist_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_artwork ON likes(artwork_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- Disable RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE artworks DISABLE ROW LEVEL SECURITY;
ALTER TABLE exhibitions DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE follows DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE visit_bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Function to hash password
CREATE OR REPLACE FUNCTION hash_password(password text)
RETURNS text AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf', 10));
END;
$$ LANGUAGE plpgsql;

-- Function to verify password
CREATE OR REPLACE FUNCTION verify_password(email_input text, password_input text)
RETURNS TABLE(user_id uuid, user_email text, user_name text, user_role text, user_status text) AS $$
BEGIN
  RETURN QUERY
  SELECT id, email, full_name, role, status
  FROM users
  WHERE email = email_input
    AND password_hash = crypt(password_input, password_hash)
    AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Function to get artist stats
CREATE OR REPLACE FUNCTION get_artist_stats(p_artist_id uuid)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'totalArtworks', COUNT(*),
    'approvedArtworks', COUNT(*) FILTER (WHERE status = 'approved'),
    'pendingArtworks', COUNT(*) FILTER (WHERE status = 'pending'),
    'totalRevenue', COALESCE(SUM(price) FILTER (WHERE is_sold = true), 0)
  ) INTO result
  FROM artworks
  WHERE artist_id = p_artist_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get artist artworks
CREATE OR REPLACE FUNCTION get_artist_artworks(p_artist_id uuid)
RETURNS TABLE(
  id uuid, title text, description text, image_url text, price numeric,
  status text, views integer, likes_count integer, medium text, dimensions text, created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, a.title, a.description, a.image_url, a.price, a.status,
         a.views_count, a.likes_count, a.medium, a.dimensions, a.created_at
  FROM artworks a
  WHERE a.artist_id = p_artist_id
  ORDER BY a.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to update artwork
CREATE OR REPLACE FUNCTION update_artwork(
  p_artwork_id uuid, p_title text, p_description text,
  p_price numeric, p_medium text, p_dimensions text
)
RETURNS void AS $$
BEGIN
  UPDATE artworks
  SET title = p_title, description = p_description, price = p_price,
      medium = p_medium, dimensions = p_dimensions, updated_at = now()
  WHERE id = p_artwork_id;
END;
$$ LANGUAGE plpgsql;

-- Function to delete artwork
CREATE OR REPLACE FUNCTION delete_artwork(artwork_id uuid)
RETURNS void AS $$
BEGIN
  DELETE FROM artworks WHERE id = artwork_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create artwork
CREATE OR REPLACE FUNCTION create_artwork(
  p_artist_id uuid, p_title text, p_description text, p_price numeric,
  p_medium text, p_dimensions text, p_year_created integer, p_tags text[], p_image_url text
)
RETURNS uuid AS $$
DECLARE
  new_artwork_id uuid;
BEGIN
  INSERT INTO artworks (artist_id, title, description, price, medium, dimensions, year_created, tags, image_url)
  VALUES (p_artist_id, p_title, p_description, p_price, p_medium, p_dimensions, p_year_created, p_tags, p_image_url)
  RETURNING id INTO new_artwork_id;
  
  RETURN new_artwork_id;
END;
$$ LANGUAGE plpgsql;

-- Insert test users (only if not exists)
INSERT INTO users (email, password_hash, full_name, role, status)
SELECT 'admin@test.com', hash_password('admin123'), 'Admin User', 'admin', 'active'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@test.com');

INSERT INTO users (email, password_hash, full_name, role, status)
SELECT 'artist@test.com', hash_password('artist123'), 'Artist User', 'artist', 'active'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'artist@test.com');

INSERT INTO users (email, password_hash, full_name, role, status)
SELECT 'collector@test.com', hash_password('collector123'), 'Collector User', 'collector', 'active'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'collector@test.com');

-- Insert sample categories (only if not exists)
INSERT INTO categories (name, slug, description)
SELECT 'Paintings', 'paintings', 'Traditional and modern paintings'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'paintings');

INSERT INTO categories (name, slug, description)
SELECT 'Sculptures', 'sculptures', 'Three-dimensional artworks'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'sculptures');

INSERT INTO categories (name, slug, description)
SELECT 'Photography', 'photography', 'Photographic art'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'photography');

INSERT INTO categories (name, slug, description)
SELECT 'Digital Art', 'digital-art', 'Computer-generated artwork'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'digital-art');
RETURNS uuid AS $$
DECLARE
  new_artwork_id uuid;
BEGIN
  INSERT INTO artworks (artist_id, title, description, price, medium, dimensions, year_created, tags, image_url)
  VALUES (p_artist_id, p_title, p_description, p_price, p_medium, p_dimensions, p_year_created, p_tags, p_image_url)
  RETURNING id INTO new_artwork_id;
  
  RETURN new_artwork_id;
END;
$$ LANGUAGE plpgsql;

-- Insert test users with encrypted passwords
INSERT INTO users (email, password_hash, full_name, role, status)
VALUES 
  ('admin@test.com', hash_password('admin123'), 'Admin User', 'admin', 'active'),
  ('artist@test.com', hash_password('artist123'), 'Artist User', 'artist', 'active'),
  ('collector@test.com', hash_password('collector123'), 'Collector User', 'collector', 'active');

-- Insert sample categories
INSERT INTO categories (name, slug, description)
VALUES 
  ('Paintings', 'paintings', 'Traditional and modern paintings'),
  ('Sculptures', 'sculptures', 'Three-dimensional artworks'),
  ('Photography', 'photography', 'Photographic art'),
  ('Digital Art', 'digital-art', 'Computer-generated artwork');
