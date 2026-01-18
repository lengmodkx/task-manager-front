-- Fix: Restore original user_profiles RLS policies
-- Run this if admin menu is not showing

-- Drop the problematic policies if they exist
DROP POLICY IF EXISTS "Admins can view all users" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all users" ON user_profiles;

-- Restore original policies (if not exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_profiles'
    AND policyname = 'Users can view all profiles'
  ) THEN
    CREATE POLICY "Users can view all profiles" ON user_profiles
      FOR SELECT USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_profiles'
    AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" ON user_profiles
      FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;
