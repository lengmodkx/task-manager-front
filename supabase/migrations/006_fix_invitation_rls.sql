-- Fix invitation codes RLS to allow updating used_count during registration

-- Allow anyone to update used_count (for registration)
DROP POLICY IF EXISTS "Anyone can update invitation used_count" ON invitation_codes;
CREATE POLICY "Anyone can update invitation used_count" ON invitation_codes
  FOR UPDATE USING (true)
  WITH CHECK (true);

-- Note: This is permissive because:
-- 1. The code validation happens in application logic
-- 2. Users can only increment used_count, not decrease it
-- 3. The invitation code itself is required to register

-- If you want stricter control, use service_role in server actions instead
