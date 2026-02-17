-- RPC function to get all users
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE(
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  status TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.full_name, u.role, u.status, u.created_at
  FROM users u
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to get users by role
CREATE OR REPLACE FUNCTION get_users_by_role(user_role TEXT)
RETURNS TABLE(
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  status TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.full_name, u.role, u.status, u.created_at
  FROM users u
  WHERE u.role = user_role
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to get dashboard stats
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'totalUsers', (SELECT COUNT(*) FROM users),
    'totalArtists', (SELECT COUNT(*) FROM users WHERE role = 'artist'),
    'totalCollectors', (SELECT COUNT(*) FROM users WHERE role = 'collector'),
    'totalArtworks', (SELECT COUNT(*) FROM artworks),
    'pendingArtworks', (SELECT COUNT(*) FROM artworks WHERE status = 'pending'),
    'totalExhibitions', (SELECT COUNT(*) FROM exhibitions),
    'totalRevenue', (SELECT COALESCE(SUM(platform_fee), 0) FROM transactions WHERE status = 'completed')
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to update user status
CREATE OR REPLACE FUNCTION update_user_status(user_id UUID, new_status TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE users SET status = new_status WHERE id = user_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to get pending artworks
CREATE OR REPLACE FUNCTION get_pending_artworks()
RETURNS TABLE(
  id UUID,
  title TEXT,
  price NUMERIC,
  image_url TEXT,
  artist_name TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, a.title, a.price, a.image_url, u.full_name as artist_name, a.created_at
  FROM artworks a
  JOIN users u ON a.artist_id = u.id
  WHERE a.status = 'pending'
  ORDER BY a.created_at DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
