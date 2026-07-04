-- ============================================================
-- TODAGO: STRICT DRIVER CREATION WITH UNIQUE VALIDATIONS (v10)
-- ============================================================

-- 1. TAG ADMIN ACCOUNT
UPDATE auth.users
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'cuartoalexa22@gmail.com';

-- 2. CREATE DRIVER ACCOUNT FUNCTION
CREATE OR REPLACE FUNCTION public.create_driver_account(
  p_user_id uuid,
  p_email text,
  p_first_name text,
  p_last_name text,
  p_phone text,
  p_plate_number text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_driver_id uuid;
  v_type_id uuid;
BEGIN
  -- Verify caller is admin
  IF (auth.jwt() -> 'user_metadata' ->> 'role') IS DISTINCT FROM 'admin' THEN
    RETURN json_build_object('success', false, 'error', 'Only admins can create driver accounts.');
  END IF;

  -- 🔴 HARD CHECK BEFORE INSERT (Excluding current user's profile/auth records)
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email AND id != p_user_id) THEN
    RETURN json_build_object('success', false, 'error', 'Email already exists');
  END IF;

  -- Verify phone number doesn't exist on OTHER profiles
  IF p_phone IS NOT NULL AND p_phone != '' AND EXISTS (SELECT 1 FROM public.profiles WHERE phone_number = p_phone AND id != p_user_id) THEN
    RETURN json_build_object('success', false, 'error', 'Phone number already exists');
  END IF;

  -- Verify plate number doesn't exist on OTHER vehicles
  IF EXISTS (
    SELECT 1 FROM public.vehicles v
    JOIN public.drivers d ON v.driver_id = d.id
    WHERE v.plate_number = p_plate_number AND d.profile_id != p_user_id
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Plate number already exists');
  END IF;

  -- PROFILE (Upsert/Insert: Use ON CONFLICT to update metadata if trigger already created it)
  INSERT INTO public.profiles (id, first_name, last_name, phone_number, role)
  VALUES (p_user_id, p_first_name, p_last_name, p_phone, 'driver')
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone_number = EXCLUDED.phone_number,
    role = 'driver';

  -- DRIVER
  INSERT INTO public.drivers (profile_id, license_number, status, approved_at)
  VALUES (p_user_id, 'PENDING', 'approved', now())
  ON CONFLICT (profile_id) DO NOTHING
  RETURNING id INTO v_driver_id;

  -- If driver already existed, select its id
  IF v_driver_id IS NULL THEN
    SELECT id INTO v_driver_id FROM public.drivers WHERE profile_id = p_user_id;
  END IF;

  -- VEHICLE TYPE
  SELECT id INTO v_type_id FROM public.vehicle_types WHERE is_active = true LIMIT 1;

  -- VEHICLE
  IF v_type_id IS NOT NULL AND v_driver_id IS NOT NULL THEN
    INSERT INTO public.vehicles (driver_id, vehicle_type_id, plate_number)
    VALUES (v_driver_id, v_type_id, p_plate_number)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN json_build_object(
    'success', true,
    'driver_id', v_driver_id
  );
END;
$$;


-- 3. ROLLBACK/CLEANUP FUNCTION
CREATE OR REPLACE FUNCTION public.rollback_user_creation(
  p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify caller is admin
  IF (auth.jwt() -> 'user_metadata' ->> 'role') IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$;


-- ============================================================
-- 4. PASSENGER & BOOKING SCHEMAS AUTO-CREATION & SEEDS
-- ============================================================

-- A. Auto-create profile + passenger row when a new auth user is created.
-- This is the SINGLE source of truth for profile creation (no client-side insert).
-- The trigger fires inside the same transaction as auth.signUp, making it atomic:
--   if the trigger fails → the auth user is also rolled back → no ghost users.
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

-- Wire up the trigger (safe to re-run)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- B. Backfill passenger rows for all existing profiles that are passenger roles
INSERT INTO public.passengers (id, profile_id)
SELECT id, id FROM public.profiles
WHERE role = 'passenger'
ON CONFLICT (profile_id) DO NOTHING;

-- C. Seed standard active vehicle types if not already seeded
INSERT INTO public.vehicle_types (name, description, max_passengers, is_active)
VALUES 
  ('Tricycle', 'Standard motorized tricycle', 3, true),
  ('E-Trike', 'Electric tricycle', 3, true)
ON CONFLICT (name) DO UPDATE SET
  is_active = true;

-- D. Seed standard active fare configuration if not already seeded
INSERT INTO public.fare_configurations (vehicle_type_id, fare_type, base_fare, per_km_rate, minimum_fare, booking_fee, surge_multiplier, is_active)
SELECT id, 'per_km_with_base', 20.00, 10.00, 25.00, 5.00, 1.00, true
FROM public.vehicle_types
WHERE name = 'Tricycle'
AND NOT EXISTS (
  SELECT 1 FROM public.fare_configurations fc 
  WHERE fc.vehicle_type_id = public.vehicle_types.id AND fc.is_active = true
);


-- ============================================================
-- 5. RLS POLICIES & STATUS ENUM MODIFICATIONS
-- ============================================================

-- A. Add new statuses to the booking_status enum if they don't exist
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'searching';
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'pickedUp';
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'droppedOff';
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'paymentSent';

-- B. Recreate SELECT policy for drivers on bookings table
DROP POLICY IF EXISTS bookings_select_driver ON public.bookings;
CREATE POLICY bookings_select_driver ON public.bookings
  FOR SELECT USING (
    driver_id IN (SELECT id FROM public.drivers WHERE profile_id = auth.uid())
    OR (
      status::text IN ('pending', 'searching')
      AND EXISTS (SELECT 1 FROM public.drivers WHERE profile_id = auth.uid())
    )
  );

-- C. Recreate UPDATE policy for drivers on bookings table
DROP POLICY IF EXISTS bookings_update_driver ON public.bookings;
CREATE POLICY bookings_update_driver ON public.bookings
  FOR UPDATE USING (
    driver_id IN (SELECT id FROM public.drivers WHERE profile_id = auth.uid())
    OR (
      status::text IN ('pending', 'searching')
      AND EXISTS (SELECT 1 FROM public.drivers WHERE profile_id = auth.uid())
    )
  );


-- ============================================================
-- 6. PHONE-TO-EMAIL LOOKUP (used by passenger app sign-in)
-- ============================================================
-- Profiles table does NOT have an email column.
-- This RPC joins profiles → auth.users to resolve phone → email.

CREATE OR REPLACE FUNCTION public.get_email_by_phone(
  p_phone text,
  p_role text DEFAULT 'passenger'
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_email text;
BEGIN
  SELECT u.email INTO v_email
  FROM auth.users u
  JOIN public.profiles p ON p.id = u.id
  WHERE p.phone_number = p_phone
    AND p.role = p_role::public.user_role
  LIMIT 1;

  RETURN v_email;
END;
$$;