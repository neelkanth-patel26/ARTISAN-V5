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
CREATE TABLE users (
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
CREATE TABLE categories (
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
CREATE TABLE artworks (
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
CREATE TABLE exhibitions (
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
  hours text,
  artist text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Follows table
CREATE TABLE follows (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Likes table
CREATE TABLE likes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  artwork_id uuid NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, artwork_id)
);

-- Notifications table
CREATE TABLE notifications (
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
CREATE TABLE reviews (
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
CREATE TABLE transactions (
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
CREATE TABLE visit_bookings (
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
CREATE INDEX idx_artworks_artist ON artworks(artist_id);
CREATE INDEX idx_artworks_category ON artworks(category_id);
CREATE INDEX idx_artworks_status ON artworks(status);
CREATE INDEX idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX idx_transactions_artist ON transactions(artist_id);
CREATE INDEX idx_likes_user ON likes(user_id);
CREATE INDEX idx_likes_artwork ON likes(artwork_id);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);

-- Disable RLS (allow all access)
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

-- Function to delete artwork (drop first if return type changed)
DROP FUNCTION IF EXISTS delete_artwork(uuid);

CREATE OR REPLACE FUNCTION delete_artwork(artwork_id uuid)
RETURNS boolean AS $$
BEGIN
  DELETE FROM artworks WHERE id = artwork_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- Get all artworks with artist info and likes_count
CREATE OR REPLACE FUNCTION get_all_artworks(filter_status text DEFAULT NULL)
RETURNS TABLE(
  id uuid, title text, price numeric, status text, image_url text,
  artist_name text, artist_id uuid, likes_count bigint, created_at timestamptz
) AS $$
BEGIN
  IF filter_status IS NULL OR filter_status = 'all' THEN
    RETURN QUERY
    SELECT a.id, a.title, a.price, a.status, a.image_url, u.full_name, a.artist_id,
           COALESCE((SELECT COUNT(*)::bigint FROM likes l WHERE l.artwork_id = a.id), 0),
           a.created_at
    FROM artworks a
    JOIN users u ON a.artist_id = u.id
    ORDER BY a.created_at DESC;
  ELSE
    RETURN QUERY
    SELECT a.id, a.title, a.price, a.status, a.image_url, u.full_name, a.artist_id,
           COALESCE((SELECT COUNT(*)::bigint FROM likes l WHERE l.artwork_id = a.id), 0),
           a.created_at
    FROM artworks a
    JOIN users u ON a.artist_id = u.id
    WHERE a.status = filter_status
    ORDER BY a.created_at DESC;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update artwork likes_count when likes change
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE artworks SET likes_count = likes_count + 1 WHERE id = NEW.artwork_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE artworks SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.artwork_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_artwork_likes_count
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION update_likes_count();

-- Exhibitions: get all (with hours, artist) — drop first if return type changed
DROP FUNCTION IF EXISTS get_all_exhibitions();

CREATE OR REPLACE FUNCTION get_all_exhibitions()
RETURNS TABLE(
  id uuid, title text, description text, location text, image_url text,
  start_date timestamptz, end_date timestamptz, status text, hours text, artist text, created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT e.id, e.title, e.description, e.location, e.image_url,
         e.start_date, e.end_date, e.status, e.hours, e.artist, e.created_at
  FROM exhibitions e
  ORDER BY e.start_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Exhibitions: create (with optional hours, artist)
CREATE OR REPLACE FUNCTION create_exhibition(
  p_title text, p_description text, p_location text, p_image_url text,
  p_start_date timestamptz, p_end_date timestamptz, p_status text, p_created_by uuid,
  p_hours text DEFAULT NULL, p_artist text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE new_id uuid;
BEGIN
  INSERT INTO exhibitions (title, description, location, image_url, start_date, end_date, status, created_by, hours, artist)
  VALUES (p_title, p_description, p_location, p_image_url, p_start_date, p_end_date, p_status, p_created_by, p_hours, p_artist)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Exhibitions: update (with optional hours, artist)
CREATE OR REPLACE FUNCTION update_exhibition(
  p_id uuid, p_title text, p_description text, p_location text, p_image_url text,
  p_start_date timestamptz, p_end_date timestamptz, p_status text,
  p_hours text DEFAULT NULL, p_artist text DEFAULT NULL
)
RETURNS boolean AS $$
BEGIN
  UPDATE exhibitions
  SET title = p_title, description = p_description, location = p_location, image_url = p_image_url,
      start_date = p_start_date, end_date = p_end_date, status = p_status, hours = p_hours, artist = p_artist,
      updated_at = now()
  WHERE id = p_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Exhibitions: delete
CREATE OR REPLACE FUNCTION delete_exhibition(exhibition_id uuid)
RETURNS boolean AS $$
BEGIN
  DELETE FROM exhibitions WHERE id = exhibition_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create transaction (fake payment completion)
CREATE OR REPLACE FUNCTION create_transaction(
  p_buyer_id uuid, p_artwork_id uuid, p_amount numeric, p_payment_method text DEFAULT 'credit_card'
)
RETURNS uuid AS $$
DECLARE
  v_artist_id uuid;
  v_platform_fee numeric(10, 2);
  v_artist_earnings numeric(10, 2);
  v_transaction_code text;
  new_id uuid;
BEGIN
  SELECT artist_id INTO v_artist_id FROM artworks WHERE id = p_artwork_id;
  IF v_artist_id IS NULL THEN
    RAISE EXCEPTION 'Artwork not found';
  END IF;
  v_platform_fee := ROUND(p_amount * 0.10, 2);
  v_artist_earnings := ROUND(p_amount - v_platform_fee, 2);
  v_transaction_code := 'TXN' || TO_CHAR(now(), 'YYYYMMDDHH24MISS') || SUBSTR(md5(random()::text), 1, 6);
  INSERT INTO transactions (transaction_code, buyer_id, artwork_id, artist_id, amount, platform_fee, artist_earnings, payment_method, status, completed_at)
  VALUES (v_transaction_code, p_buyer_id, p_artwork_id, v_artist_id, p_amount, v_platform_fee, v_artist_earnings, p_payment_method, 'completed', now())
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
