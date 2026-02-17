-- ============================================
-- COMPREHENSIVE DATABASE UPDATE SCRIPT
-- ============================================

-- 1. Add categories if not exists
INSERT INTO categories (name, slug, description, is_active) VALUES
('Painting', 'painting', 'Traditional and contemporary paintings', true),
('Sculpture', 'sculpture', 'Three-dimensional artworks', true),
('Photography', 'photography', 'Photographic artworks', true),
('Digital Art', 'digital-art', 'Digital and computer-generated art', true),
('Mixed Media', 'mixed-media', 'Artworks combining multiple mediums', true),
('Drawing', 'drawing', 'Sketches and drawings', true),
('Abstract', 'abstract', 'Abstract and non-representational art', true),
('Landscape', 'landscape', 'Landscape and nature scenes', true),
('Portrait', 'portrait', 'Portrait and figurative art', true),
('Contemporary', 'contemporary', 'Contemporary art', true),
('Modern', 'modern', 'Modern art movements', true),
('Traditional', 'traditional', 'Traditional and classical art', true)
ON CONFLICT (slug) DO NOTHING;

-- 2. Update visit_bookings table
ALTER TABLE visit_bookings ADD COLUMN IF NOT EXISTS exhibition_id uuid REFERENCES exhibitions(id);
ALTER TABLE visit_bookings ADD COLUMN IF NOT EXISTS payment_amount numeric DEFAULT 0;
ALTER TABLE visit_bookings ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending' CHECK (payment_status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text]));
ALTER TABLE visit_bookings ADD COLUMN IF NOT EXISTS payment_id text;

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_visit_bookings_exhibition_id ON visit_bookings(exhibition_id);
CREATE INDEX IF NOT EXISTS idx_visit_bookings_user_id ON visit_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_visit_bookings_status ON visit_bookings(status);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_artist_id ON transactions(artist_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_artworks_category_id ON artworks(category_id);
CREATE INDEX IF NOT EXISTS idx_artworks_artist_id ON artworks(artist_id);
CREATE INDEX IF NOT EXISTS idx_artworks_status ON artworks(status);

-- 4. Add unique constraint to prevent duplicate likes
CREATE UNIQUE INDEX IF NOT EXISTS idx_likes_user_artwork ON likes(user_id, artwork_id);

-- 5. Update transactions table to ensure all required fields exist
ALTER TABLE transactions ALTER COLUMN transaction_type SET DEFAULT 'purchase';
ALTER TABLE transactions ALTER COLUMN status SET DEFAULT 'pending';

-- 6. Create view for dashboard analytics
CREATE OR REPLACE VIEW dashboard_analytics AS
SELECT 
  u.id as user_id,
  u.role,
  COUNT(DISTINCT CASE WHEN t.transaction_type = 'purchase' THEN t.id END) as total_purchases,
  COUNT(DISTINCT CASE WHEN t.transaction_type = 'support' THEN t.id END) as total_supports,
  COALESCE(SUM(CASE WHEN t.status = 'completed' AND t.artist_id = u.id THEN t.artist_earnings ELSE 0 END), 0) as total_earnings,
  COALESCE(SUM(CASE WHEN t.status = 'completed' AND t.buyer_id = u.id THEN t.amount ELSE 0 END), 0) as total_spent,
  COUNT(DISTINCT CASE WHEN a.artist_id = u.id THEN a.id END) as total_artworks,
  COUNT(DISTINCT CASE WHEN vb.user_id = u.id THEN vb.id END) as total_bookings
FROM users u
LEFT JOIN transactions t ON (t.artist_id = u.id OR t.buyer_id = u.id)
LEFT JOIN artworks a ON a.artist_id = u.id
LEFT JOIN visit_bookings vb ON vb.user_id = u.id
GROUP BY u.id, u.role;

-- 7. Create function to get user bookings
CREATE OR REPLACE FUNCTION get_user_bookings(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  exhibition_id uuid,
  exhibition_title text,
  visitor_name text,
  visitor_email text,
  visitor_phone text,
  visit_date date,
  visit_time time,
  number_of_visitors integer,
  status text,
  payment_amount numeric,
  payment_status text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vb.id,
    vb.exhibition_id,
    e.title as exhibition_title,
    vb.visitor_name,
    vb.visitor_email,
    vb.visitor_phone,
    vb.visit_date,
    vb.visit_time,
    vb.number_of_visitors,
    vb.status,
    vb.payment_amount,
    vb.payment_status,
    vb.created_at
  FROM visit_bookings vb
  LEFT JOIN exhibitions e ON e.id = vb.exhibition_id
  WHERE vb.user_id = p_user_id
  ORDER BY vb.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger to update exhibition visitors_count
CREATE OR REPLACE FUNCTION update_exhibition_visitors()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'confirmed' THEN
    UPDATE exhibitions 
    SET visitors_count = visitors_count + NEW.number_of_visitors
    WHERE id = NEW.exhibition_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != 'confirmed' AND NEW.status = 'confirmed' THEN
      UPDATE exhibitions 
      SET visitors_count = visitors_count + NEW.number_of_visitors
      WHERE id = NEW.exhibition_id;
    ELSIF OLD.status = 'confirmed' AND NEW.status != 'confirmed' THEN
      UPDATE exhibitions 
      SET visitors_count = GREATEST(0, visitors_count - OLD.number_of_visitors)
      WHERE id = OLD.exhibition_id;
    ELSIF OLD.status = 'confirmed' AND NEW.status = 'confirmed' AND OLD.number_of_visitors != NEW.number_of_visitors THEN
      UPDATE exhibitions 
      SET visitors_count = GREATEST(0, visitors_count - OLD.number_of_visitors + NEW.number_of_visitors)
      WHERE id = NEW.exhibition_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'confirmed' THEN
    UPDATE exhibitions 
    SET visitors_count = GREATEST(0, visitors_count - OLD.number_of_visitors)
    WHERE id = OLD.exhibition_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_exhibition_visitors ON visit_bookings;
CREATE TRIGGER trigger_update_exhibition_visitors
AFTER INSERT OR UPDATE OR DELETE ON visit_bookings
FOR EACH ROW
EXECUTE FUNCTION update_exhibition_visitors();
