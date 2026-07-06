-- ============================================================================
-- SQL Migration: Add Email Column, Update Trigger, and Backfill Blank Profiles
-- ============================================================================

-- 1. Add email column to profiles if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Update trigger function handle_new_user to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role_txt text;
  v_role public.user_role;
BEGIN
  v_role_txt := NEW.raw_user_meta_data->>'role';
  IF v_role_txt = 'driver' THEN
    v_role := 'driver'::public.user_role;
  ELSIF v_role_txt = 'admin' THEN
    v_role := 'admin'::public.user_role;
  ELSE
    v_role := 'passenger'::public.user_role;
  END IF;

  BEGIN
    INSERT INTO public.profiles (id, first_name, last_name, phone_number, email, role)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'phone_number', NEW.phone),
      NEW.email,
      v_role
    )
    ON CONFLICT (id) DO UPDATE SET
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      phone_number = EXCLUDED.phone_number,
      email = EXCLUDED.email,
      role = EXCLUDED.role;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error inserting profile for user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
  END;

  IF v_role = 'passenger' THEN
    BEGIN
      INSERT INTO public.passengers (id, profile_id)
      VALUES (NEW.id, NEW.id)
      ON CONFLICT (profile_id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Error inserting passenger for user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Backfill existing blank profiles from auth.users
UPDATE public.profiles p
SET
  first_name = COALESCE(
    NULLIF(TRIM(p.first_name), ''), 
    NULLIF(TRIM(u.raw_user_meta_data->>'first_name'), ''),
    NULLIF(TRIM(u.raw_user_meta_data->>'full_name'), ''),
    ''
  ),
  last_name = COALESCE(
    NULLIF(TRIM(p.last_name), ''), 
    NULLIF(TRIM(u.raw_user_meta_data->>'last_name'), ''),
    ''
  ),
  phone_number = COALESCE(
    p.phone_number, 
    u.raw_user_meta_data->>'phone_number', 
    u.phone
  ),
  email = COALESCE(p.email, u.email)
FROM auth.users u
WHERE p.id = u.id;
