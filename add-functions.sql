-- Enable extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing functions first
DROP FUNCTION IF EXISTS get_artist_artworks(uuid);
DROP FUNCTION IF EXISTS update_artwork(uuid, text, text, numeric, text, text);
DROP FUNCTION IF EXISTS delete_artwork(uuid);
DROP FUNCTION IF EXISTS create_artwork(uuid, text, text, numeric, text, text, integer, text[], text);

-- Create index on email for faster login
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Function to hash password
CREATE OR REPLACE FUNCTION hash_password(password text)
RETURNS text AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf', 8));
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
