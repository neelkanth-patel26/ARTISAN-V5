-- Add more categories to the database
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
