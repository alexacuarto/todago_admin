-- SUPER FIX FOR INFINITE RECURSION

-- 1. Create a safe SECURITY DEFINER function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' THEN
    RETURN true;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- 2. Dynamically drop ALL existing policies on the profiles table 
-- (This guarantees the recursive one is deleted no matter what it was named)
DO $$ 
DECLARE 
    r RECORD;
BEGIN 
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public') 
    LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', r.policyname);
    END LOOP; 
END $$;

-- 3. Recreate safe, non-recursive policies for profiles
-- Allow anyone to read profiles (prevents read loops between drivers/passengers)
CREATE POLICY "Enable read access for all users" ON public.profiles FOR SELECT USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Allow admins to do everything
CREATE POLICY "Admins have full access" ON public.profiles FOR ALL USING (public.is_admin());
