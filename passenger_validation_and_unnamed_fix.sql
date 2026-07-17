-- ============================================================
-- SQL Migration: Enforce Passenger Validation, Atomic Profile Creation, and Cancellation Policy
-- ============================================================

-- 1. Add cancellation fields to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cancel_count INT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_cancel_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS booking_restriction_until TIMESTAMP WITH TIME ZONE NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS warning_status BOOLEAN DEFAULT FALSE;

-- 2. Safe cleanup of existing incomplete/corrupted passenger accounts (with 0 bookings/history)
CREATE OR REPLACE FUNCTION public.clean_incomplete_passengers()
RETURNS void AS $$
DECLARE
  v_user_ids uuid[];
BEGIN
  SELECT array_agg(id) INTO v_user_ids
  FROM public.profiles
  WHERE role = 'passenger'::public.user_role
    AND (
      first_name IS NULL OR TRIM(first_name) = ''
      OR last_name IS NULL OR TRIM(last_name) = ''
      OR phone_number IS NULL OR TRIM(phone_number) = ''
      OR email IS NULL OR TRIM(email) = ''
    );

  IF v_user_ids IS NOT NULL AND array_length(v_user_ids, 1) > 0 THEN
    -- Delete only if the account has no bookings referencing it as passenger_id or profile_id
    DELETE FROM public.passengers 
    WHERE profile_id = ANY(v_user_ids) 
      AND profile_id NOT IN (SELECT passenger_id FROM public.bookings UNION SELECT profile_id FROM public.bookings);
      
    DELETE FROM public.profiles 
    WHERE id = ANY(v_user_ids) 
      AND id NOT IN (SELECT passenger_id FROM public.bookings UNION SELECT profile_id FROM public.bookings);
      
    DELETE FROM auth.users 
    WHERE id = ANY(v_user_ids) 
      AND id NOT IN (SELECT passenger_id FROM public.bookings UNION SELECT profile_id FROM public.bookings);
  END IF;
END;
$$ LANGUAGE plpgsql;

SELECT public.clean_incomplete_passengers();
DROP FUNCTION IF EXISTS public.clean_incomplete_passengers();

-- 3. Add CHECK constraints (NOT VALID) to profiles table
-- This enforces that future inserts/updates cannot have empty/spaces-only values,
-- while preserving existing/legacy records without failing.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_first_name_not_empty;
ALTER TABLE public.profiles ADD CONSTRAINT check_first_name_not_empty 
  CHECK (first_name IS NOT NULL AND TRIM(first_name) <> '') NOT VALID;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_last_name_not_empty;
ALTER TABLE public.profiles ADD CONSTRAINT check_last_name_not_empty 
  CHECK (last_name IS NOT NULL AND TRIM(last_name) <> '') NOT VALID;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_phone_number_not_empty;
ALTER TABLE public.profiles ADD CONSTRAINT check_phone_number_not_empty 
  CHECK (phone_number IS NOT NULL AND TRIM(phone_number) <> '') NOT VALID;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_email_not_empty;
ALTER TABLE public.profiles ADD CONSTRAINT check_email_not_empty 
  CHECK (email IS NOT NULL AND TRIM(email) <> '') NOT VALID;

-- 4. Update the trigger function public.handle_new_user()
-- This is fired inside the same transaction as auth.signUp.
-- If validation fails or profile creation fails, the transaction is aborted
-- and the auth.users record is rolled back, preventing ghost/unnamed users.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role_txt text;
  v_role public.user_role;
  v_first_name text;
  v_last_name text;
  v_phone text;
  v_email text;
BEGIN
  -- Determine role
  v_role_txt := NEW.raw_user_meta_data->>'role';
  IF v_role_txt = 'driver' THEN
    v_role := 'driver'::public.user_role;
  ELSIF v_role_txt = 'admin' THEN
    v_role := 'admin'::public.user_role;
  ELSE
    v_role := 'passenger'::public.user_role;
  END IF;

  -- Extract and trim metadata fields
  v_first_name := TRIM(COALESCE(NEW.raw_user_meta_data->>'first_name', ''));
  v_last_name := TRIM(COALESCE(NEW.raw_user_meta_data->>'last_name', ''));
  v_phone := TRIM(COALESCE(NEW.raw_user_meta_data->>'phone_number', NEW.phone, ''));
  v_email := TRIM(COALESCE(NEW.email, ''));

  -- Validation: Reject if any required fields are empty
  IF v_first_name = '' OR v_last_name = '' OR v_phone = '' OR v_email = '' THEN
    RAISE EXCEPTION 'Complete profile information is required.';
  END IF;

  -- Insert profile (No exception block: let errors bubble up to rollback user creation)
  INSERT INTO public.profiles (id, first_name, last_name, phone_number, email, role)
  VALUES (
    NEW.id,
    v_first_name,
    v_last_name,
    v_phone,
    v_email,
    v_role
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone_number = EXCLUDED.phone_number,
    email = EXCLUDED.email,
    role = EXCLUDED.role;

  -- Insert passenger if applicable
  IF v_role = 'passenger' THEN
    INSERT INTO public.passengers (id, profile_id)
    VALUES (NEW.id, NEW.id)
    ON CONFLICT (profile_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the user creation trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Update the handle_booking_cancellation trigger function
-- Implements the 30-day window temporary restriction cancellation policy.
CREATE OR REPLACE FUNCTION public.handle_booking_cancellation()
RETURNS TRIGGER AS $$
DECLARE
  v_cancel_count integer;
  v_profile_id uuid;
BEGIN
  -- Get the profile_id for this passenger
  SELECT profile_id INTO v_profile_id
  FROM public.passengers
  WHERE id = COALESCE(NEW.passenger_id, OLD.passenger_id);

  IF v_profile_id IS NOT NULL THEN
    -- Count cancelled bookings for this passenger within the last 30 days
    SELECT COUNT(*) INTO v_cancel_count
    FROM public.bookings
    WHERE (passenger_id = COALESCE(NEW.passenger_id, OLD.passenger_id) OR passenger_id = v_profile_id)
      AND status = 'cancelled'
      AND created_at >= NOW() - INTERVAL '30 days';

    -- Update cancellation policy fields on profiles
    IF v_cancel_count >= 4 THEN
      UPDATE public.profiles
      SET 
        cancel_count = v_cancel_count,
        last_cancel_date = NOW(),
        booking_restriction_until = NOW() + INTERVAL '7 days',
        warning_status = false
      WHERE id = v_profile_id;
    ELSIF v_cancel_count = 3 THEN
      UPDATE public.profiles
      SET 
        cancel_count = v_cancel_count,
        last_cancel_date = NOW(),
        booking_restriction_until = NULL,
        warning_status = true
      WHERE id = v_profile_id;
    ELSE
      UPDATE public.profiles
      SET 
        cancel_count = v_cancel_count,
        last_cancel_date = COALESCE(last_cancel_date, NOW()),
        booking_restriction_until = NULL,
        warning_status = false
      WHERE id = v_profile_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the cancellation trigger
DROP TRIGGER IF EXISTS on_booking_cancelled ON public.bookings;
CREATE TRIGGER on_booking_cancelled
  AFTER INSERT OR UPDATE OF status ON public.bookings
  FOR EACH ROW
  WHEN (NEW.status = 'cancelled')
  EXECUTE FUNCTION public.handle_booking_cancellation();
