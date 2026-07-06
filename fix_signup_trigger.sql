-- ============================================================================
-- SQL Migration: Safe SignUp Trigger Function and Email RPC Checker
-- ============================================================================

-- 1. Create a secure, read-only RPC function to check if an email exists in auth.users
CREATE OR REPLACE FUNCTION public.check_email_exists(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users WHERE email = p_email
  );
END;
$$;

-- 2. Update handle_new_user trigger function to safely insert profile and passenger records
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role_txt text;
  v_role public.user_role;
BEGIN
  -- Parse role from user metadata and avoid invalid cast errors
  v_role_txt := NEW.raw_user_meta_data->>'role';
  IF v_role_txt = 'driver' THEN
    v_role := 'driver'::public.user_role;
  ELSIF v_role_txt = 'admin' THEN
    v_role := 'admin'::public.user_role;
  ELSE
    v_role := 'passenger'::public.user_role;
  END IF;

  -- Insert/update profile record safely
  BEGIN
    INSERT INTO public.profiles (id, first_name, last_name, phone_number, role)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'phone_number', NEW.phone),
      v_role
    )
    ON CONFLICT (id) DO UPDATE SET
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      phone_number = EXCLUDED.phone_number,
      role = EXCLUDED.role;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error inserting profile for user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
  END;

  -- Insert passenger record if role is passenger
  IF v_role = 'passenger' THEN
    BEGIN
      INSERT INTO public.passengers (profile_id)
      VALUES (NEW.id)
      ON CONFLICT (profile_id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Error inserting passenger record for user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Re-create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
