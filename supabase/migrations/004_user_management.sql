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

-- RLS policy for admins to view all users
DROP POLICY IF EXISTS "Admins can view all users" ON user_profiles;
CREATE POLICY "Admins can view all users" ON user_profiles
  FOR SELECT USING (
    auth.uid() = id OR
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS policy for admins to update users
DROP POLICY IF EXISTS "Admins can update all users" ON user_profiles;
CREATE POLICY "Admins can update all users" ON user_profiles
  FOR UPDATE USING (
    auth.uid() = id OR
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );
