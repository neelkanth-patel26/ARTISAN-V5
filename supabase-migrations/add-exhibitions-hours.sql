-- Add hours (opening hours) and artist (By) columns to exhibitions
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS hours TEXT;
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS artist TEXT;

-- Update get_all_exhibitions to return hours and artist
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

-- Update create_exhibition to accept hours and artist
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

-- Update update_exhibition to accept hours and artist
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
