-- Add name column to users table (nullable first)
ALTER TABLE users ADD COLUMN IF NOT EXISTS name STRING DEFAULT 'User';

-- Update existing users to have a default name
UPDATE users SET name = 'User' WHERE name IS NULL OR name = '';
