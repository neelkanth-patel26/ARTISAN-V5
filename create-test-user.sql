-- Create a test admin user
SELECT create_user(
  'admin@example.com',
  'admin123',
  'Admin User',
  'admin'
);

-- Verify the user was created
SELECT id, email, full_name, role, status
FROM users
WHERE email = 'admin@example.com';
