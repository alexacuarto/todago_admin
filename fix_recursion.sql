-- Fix for "infinite recursion detected in policy for relation 'profiles'"

-- 1. Create a SECURITY DEFINER function to safely check if the current user is an admin.
-- This runs with elevated privileges and bypasses RLS, preventing the infinite recursion loop.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check user_metadata first for safety
  IF (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' THEN
    RETURN true;
  END IF;

  -- Then check the profiles table (bypassing RLS because of SECURITY DEFINER)
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- 2. Drop the existing recursive policies on profiles
-- (Note: you may need to adjust the policy names if yours are different, 
-- but these are common names. Alternatively, you can drop ALL policies on profiles and recreate them)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable all access for admins" ON public.profiles;

-- 3. Recreate the admin policy using the safe function
CREATE POLICY "Admins have full access to profiles" ON public.profiles
  FOR ALL
  USING ( public.is_admin() );

-- 4. Recreate basic access for regular users
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT
  USING ( auth.uid() = id );

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE
  USING ( auth.uid() = id );
