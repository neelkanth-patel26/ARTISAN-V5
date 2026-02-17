-- Drop existing function so we can change return type (add likes_count)
DROP FUNCTION IF EXISTS get_all_artworks(text);

-- Get all artworks with artist info and likes_count
CREATE OR REPLACE FUNCTION get_all_artworks(filter_status TEXT DEFAULT NULL)
RETURNS TABLE(
  id UUID,
  title TEXT,
  price NUMERIC,
  status TEXT,
  image_url TEXT,
  artist_name TEXT,
  artist_id UUID,
  likes_count BIGINT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  IF filter_status IS NULL OR filter_status = 'all' THEN
    RETURN QUERY
    SELECT a.id, a.title, a.price, a.status, a.image_url, u.full_name, a.artist_id,
           COALESCE((SELECT COUNT(*)::BIGINT FROM likes l WHERE l.artwork_id = a.id), 0),
           a.created_at
    FROM artworks a
    JOIN users u ON a.artist_id = u.id
    ORDER BY a.created_at DESC;
  ELSE
    RETURN QUERY
    SELECT a.id, a.title, a.price, a.status, a.image_url, u.full_name, a.artist_id,
           COALESCE((SELECT COUNT(*)::BIGINT FROM likes l WHERE l.artwork_id = a.id), 0),
           a.created_at
    FROM artworks a
    JOIN users u ON a.artist_id = u.id
    WHERE a.status = filter_status
    ORDER BY a.created_at DESC;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Approve artwork
CREATE OR REPLACE FUNCTION approve_artwork(artwork_id UUID, admin_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE artworks 
  SET status = 'approved', 
      approved_at = NOW(), 
      approved_by = admin_id 
  WHERE id = artwork_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reject artwork
CREATE OR REPLACE FUNCTION reject_artwork(artwork_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE artworks SET status = 'rejected' WHERE id = artwork_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Delete artwork (drop first if return type changed)
DROP FUNCTION IF EXISTS delete_artwork(uuid);

CREATE OR REPLACE FUNCTION delete_artwork(artwork_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM artworks WHERE id = artwork_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add hours and artist columns to exhibitions if not exists
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS hours TEXT;
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS artist TEXT;

-- Get all exhibitions (includes hours, artist)
CREATE OR REPLACE FUNCTION get_all_exhibitions()
RETURNS TABLE(
  id UUID,
  title TEXT,
  description TEXT,
  location TEXT,
  image_url TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status TEXT,
  hours TEXT,
  artist TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT e.id, e.title, e.description, e.location, e.image_url,
         e.start_date, e.end_date, e.status, e.hours, e.artist, e.created_at
  FROM exhibitions e
  ORDER BY e.start_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create exhibition (with optional hours, artist)
CREATE OR REPLACE FUNCTION create_exhibition(
  p_title TEXT,
  p_description TEXT,
  p_location TEXT,
  p_image_url TEXT,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_status TEXT,
  p_created_by UUID,
  p_hours TEXT DEFAULT NULL,
  p_artist TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO exhibitions (title, description, location, image_url, start_date, end_date, status, created_by, hours, artist)
  VALUES (p_title, p_description, p_location, p_image_url, p_start_date, p_end_date, p_status, p_created_by, p_hours, p_artist)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update exhibition (with optional hours, artist)
CREATE OR REPLACE FUNCTION update_exhibition(
  p_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_location TEXT,
  p_image_url TEXT,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_status TEXT,
  p_hours TEXT DEFAULT NULL,
  p_artist TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE exhibitions
  SET title = p_title,
      description = p_description,
      location = p_location,
      image_url = p_image_url,
      start_date = p_start_date,
      end_date = p_end_date,
      status = p_status,
      hours = p_hours,
      artist = p_artist,
      updated_at = NOW()
  WHERE id = p_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Delete exhibition
CREATE OR REPLACE FUNCTION delete_exhibition(exhibition_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM exhibitions WHERE id = exhibition_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create transaction (fake payment completion)
CREATE OR REPLACE FUNCTION create_transaction(
  p_buyer_id UUID,
  p_artwork_id UUID,
  p_amount DECIMAL,
  p_payment_method TEXT DEFAULT 'credit_card'
)
RETURNS UUID AS $$
DECLARE
  v_artist_id UUID;
  v_platform_fee DECIMAL(10, 2);
  v_artist_earnings DECIMAL(10, 2);
  v_transaction_code TEXT;
  new_id UUID;
BEGIN
  SELECT artist_id INTO v_artist_id FROM artworks WHERE id = p_artwork_id;
  IF v_artist_id IS NULL THEN
    RAISE EXCEPTION 'Artwork not found';
  END IF;
  v_platform_fee := ROUND(p_amount * 0.10, 2);
  v_artist_earnings := ROUND(p_amount - v_platform_fee, 2);
  v_transaction_code := 'TXN' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISS') || SUBSTR(MD5(RANDOM()::TEXT), 1, 6);
  INSERT INTO transactions (transaction_code, buyer_id, artwork_id, artist_id, amount, platform_fee, artist_earnings, payment_method, status, completed_at)
  VALUES (v_transaction_code, p_buyer_id, p_artwork_id, v_artist_id, p_amount, v_platform_fee, v_artist_earnings, p_payment_method, 'completed', NOW())
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update user profile by admin
CREATE OR REPLACE FUNCTION admin_update_user(
  p_user_id UUID,
  p_full_name TEXT,
  p_phone TEXT,
  p_location TEXT,
  p_bio TEXT,
  p_role TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE users
  SET full_name = p_full_name,
      phone = p_phone,
      location = p_location,
      bio = p_bio,
      role = p_role,
      updated_at = NOW()
  WHERE id = p_user_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Change user password
CREATE OR REPLACE FUNCTION change_user_password(
  p_user_id UUID,
  p_new_password TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE users
  SET password_hash = crypt(p_new_password, gen_salt('bf')),
      updated_at = NOW()
  WHERE id = p_user_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new user (signup)
CREATE OR REPLACE FUNCTION create_user(
  user_email TEXT,
  user_password TEXT,
  user_full_name TEXT,
  user_role TEXT
)
RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM users WHERE email = user_email) THEN
    RAISE EXCEPTION 'Email already exists';
  END IF;

  INSERT INTO users (email, password_hash, full_name, role, status)
  VALUES (user_email, crypt(user_password, gen_salt('bf')), user_full_name, user_role, 'active')
  RETURNING id INTO new_user_id;
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create artwork
CREATE OR REPLACE FUNCTION create_artwork(
  p_artist_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_price NUMERIC,
  p_medium TEXT,
  p_dimensions TEXT,
  p_year_created INTEGER,
  p_tags TEXT[],
  p_image_url TEXT
)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO artworks (artist_id, title, description, price, medium, dimensions, year_created, tags, image_url, status)
  VALUES (p_artist_id, p_title, p_description, p_price, p_medium, p_dimensions, p_year_created, p_tags, p_image_url, 'pending')
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get artist stats
CREATE OR REPLACE FUNCTION get_artist_stats(p_artist_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'totalArtworks', (SELECT COUNT(*) FROM artworks WHERE artist_id = p_artist_id),
    'approvedArtworks', (SELECT COUNT(*) FROM artworks WHERE artist_id = p_artist_id AND status = 'approved'),
    'pendingArtworks', (SELECT COUNT(*) FROM artworks WHERE artist_id = p_artist_id AND status = 'pending'),
    'totalViews', (SELECT COALESCE(SUM(views), 0) FROM artworks WHERE artist_id = p_artist_id),
    'totalLikes', (SELECT COUNT(*) FROM likes l JOIN artworks a ON l.artwork_id = a.id WHERE a.artist_id = p_artist_id),
    'totalRevenue', (SELECT COALESCE(SUM(amount), 0) FROM transactions t JOIN artworks a ON t.artwork_id = a.id WHERE a.artist_id = p_artist_id AND t.status = 'completed')
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get artist artworks
CREATE OR REPLACE FUNCTION get_artist_artworks(p_artist_id UUID)
RETURNS TABLE(
  id UUID,
  title TEXT,
  price NUMERIC,
  status TEXT,
  image_url TEXT,
  views INTEGER,
  likes_count BIGINT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id, 
    a.title, 
    a.price, 
    a.status, 
    a.image_url, 
    a.views,
    (SELECT COUNT(*) FROM likes WHERE artwork_id = a.id) as likes_count,
    a.created_at
  FROM artworks a
  WHERE a.artist_id = p_artist_id
  ORDER BY a.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update artwork
CREATE OR REPLACE FUNCTION update_artwork(
  p_artwork_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_price NUMERIC,
  p_medium TEXT,
  p_dimensions TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE artworks
  SET title = p_title,
      description = p_description,
      price = p_price,
      medium = p_medium,
      dimensions = p_dimensions,
      updated_at = NOW()
  WHERE id = p_artwork_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify user password for login
CREATE OR REPLACE FUNCTION verify_user_password(
  user_email TEXT,
  user_password TEXT
)
RETURNS TABLE(
  user_id UUID,
  user_role TEXT,
  user_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT id, role, full_name
  FROM users
  WHERE email = user_email
    AND password_hash = crypt(user_password, password_hash)
    AND status = 'active'
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
