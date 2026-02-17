-- Insert default art categories
INSERT INTO categories (name, slug, description, is_active) VALUES
  ('Painting', 'painting', 'Traditional and contemporary paintings', true),
  ('Sculpture', 'sculpture', '3D artworks and sculptures', true),
  ('Photography', 'photography', 'Photographic artworks', true),
  ('Digital Art', 'digital-art', 'Digital and computer-generated art', true),
  ('Drawing', 'drawing', 'Sketches and drawings', true),
  ('Mixed Media', 'mixed-media', 'Artworks combining multiple mediums', true),
  ('Printmaking', 'printmaking', 'Prints and printmaking techniques', true),
  ('Textile Art', 'textile-art', 'Fabric and textile-based artworks', true),
  ('Installation', 'installation', 'Installation and conceptual art', true),
  ('Abstract', 'abstract', 'Abstract and non-representational art', true)
ON CONFLICT (slug) DO NOTHING;
