-- User management enhancements

-- Add is_active column for soft delete
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS
  is_active BOOLEAN DEFAULT true;

-- Add last_login_at column
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS
  last_login_at TIMESTAMPTZ;

-- Create index for filtering
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON user_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Note: Keep original RLS policies from 001_initial_schema.sql
-- "Users can view all profiles" allows everyone to read profiles
-- "Users can update own profile" allows users to update their own profile
--
-- For admin operations, we use service_role key in server actions
-- which bypasses RLS entirely
