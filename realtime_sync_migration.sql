-- ============================================================
-- TODAGO: REALTIME SYNC MIGRATION
-- Passenger ↔ Driver ↔ Admin — Full Database Sync
-- ============================================================
-- SAFE TO RUN: Uses DROP IF EXISTS + IF NOT EXISTS guards.
-- Does NOT conflict with existing policies from:
--   supabase_fix.sql, fix_recursion.sql, super_fix.sql
-- ============================================================


-- ############################################################
-- SECTION 1: ENABLE SUPABASE REALTIME ON ALL KEY TABLES
-- ############################################################
-- Supabase Realtime only broadcasts changes for tables that
-- are added to the `supabase_realtime` publication.

DO $$
BEGIN
  -- Remove tables first (safe if not present) then re-add
  -- This is idempotent and avoids "already a member" errors
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.bookings;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.drivers;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.profiles;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.passengers;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.vehicles;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.vehicle_types;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.fare_configurations;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  -- Now add them all back
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.drivers;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.passengers;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicles;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicle_types;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.fare_configurations;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;


-- ############################################################
-- SECTION 2: ENABLE RLS ON ALL TABLES (idempotent)
-- ############################################################

ALTER TABLE public.bookings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passengers     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_types  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fare_configurations ENABLE ROW LEVEL SECURITY;


-- ############################################################
-- SECTION 3: BOOKINGS — PASSENGER POLICIES
-- ############################################################
-- Existing policies (from supabase_fix.sql):
--   bookings_select_driver  (driver SELECT)
--   bookings_update_driver  (driver UPDATE)
-- We ADD policies for passengers + admin. No conflicts.

-- 3A. Passengers can INSERT new bookings (request a ride)
DROP POLICY IF EXISTS bookings_insert_passenger ON public.bookings;
CREATE POLICY bookings_insert_passenger ON public.bookings
  FOR INSERT
  WITH CHECK (
    -- The passenger_id must reference a passengers row owned by the current user
    passenger_id IN (
      SELECT id FROM public.passengers WHERE profile_id = auth.uid()
    )
  );

-- 3B. Passengers can SELECT their own bookings
DROP POLICY IF EXISTS bookings_select_passenger ON public.bookings;
CREATE POLICY bookings_select_passenger ON public.bookings
  FOR SELECT USING (
    passenger_id IN (
      SELECT id FROM public.passengers WHERE profile_id = auth.uid()
    )
  );

-- 3C. Passengers can UPDATE their own bookings (cancel only)
-- The actual cancellation logic is enforced in the app layer,
-- but RLS allows the UPDATE so the client can set status = 'cancelled'.
DROP POLICY IF EXISTS bookings_update_passenger ON public.bookings;
CREATE POLICY bookings_update_passenger ON public.bookings
  FOR UPDATE USING (
    passenger_id IN (
      SELECT id FROM public.passengers WHERE profile_id = auth.uid()
    )
    -- Only allow update while ride is still cancellable
    AND status::text IN ('pending', 'searching', 'accepted')
  );


-- ############################################################
-- SECTION 4: BOOKINGS — ADMIN POLICIES
-- ############################################################

-- 4A. Admin can SELECT all bookings
DROP POLICY IF EXISTS bookings_select_admin ON public.bookings;
CREATE POLICY bookings_select_admin ON public.bookings
  FOR SELECT USING ( public.is_admin() );

-- 4B. Admin can INSERT bookings (dispatch rides)
DROP POLICY IF EXISTS bookings_insert_admin ON public.bookings;
CREATE POLICY bookings_insert_admin ON public.bookings
  FOR INSERT
  WITH CHECK ( public.is_admin() );

-- 4C. Admin can UPDATE any booking (assign driver, override status)
DROP POLICY IF EXISTS bookings_update_admin ON public.bookings;
CREATE POLICY bookings_update_admin ON public.bookings
  FOR UPDATE USING ( public.is_admin() );

-- 4D. Admin can DELETE bookings
DROP POLICY IF EXISTS bookings_delete_admin ON public.bookings;
CREATE POLICY bookings_delete_admin ON public.bookings
  FOR DELETE USING ( public.is_admin() );


-- ############################################################
-- SECTION 5: DRIVERS TABLE — DRIVER SELF-UPDATE + ADMIN
-- ############################################################
-- Existing policies: bookings_select_driver / bookings_update_driver
--   are on BOOKINGS table, not DRIVERS table. So no conflict here.

-- 5A. Drivers can SELECT their own driver record
DROP POLICY IF EXISTS drivers_select_own ON public.drivers;
CREATE POLICY drivers_select_own ON public.drivers
  FOR SELECT USING ( profile_id = auth.uid() );

-- 5B. Drivers can UPDATE their own record (toggle is_online)
DROP POLICY IF EXISTS drivers_update_own ON public.drivers;
CREATE POLICY drivers_update_own ON public.drivers
  FOR UPDATE USING ( profile_id = auth.uid() );

-- 5C. Admin can do everything on drivers
DROP POLICY IF EXISTS drivers_all_admin ON public.drivers;
CREATE POLICY drivers_all_admin ON public.drivers
  FOR ALL USING ( public.is_admin() );


-- ############################################################
-- SECTION 6: PASSENGERS TABLE — POLICIES
-- ############################################################
-- Existing policy (supabase_fix.sql): passengers_select_driver
-- We keep that and ADD passenger self-access + admin.

-- 6A. Passengers can SELECT their own passenger record
DROP POLICY IF EXISTS passengers_select_own ON public.passengers;
CREATE POLICY passengers_select_own ON public.passengers
  FOR SELECT USING ( profile_id = auth.uid() );

-- 6B. Passengers can INSERT their own passenger record (self-heal)
DROP POLICY IF EXISTS passengers_insert_own ON public.passengers;
CREATE POLICY passengers_insert_own ON public.passengers
  FOR INSERT WITH CHECK ( profile_id = auth.uid() );

-- 6B. Admin full access on passengers
DROP POLICY IF EXISTS passengers_all_admin ON public.passengers;
CREATE POLICY passengers_all_admin ON public.passengers
  FOR ALL USING ( public.is_admin() );


-- ############################################################
-- SECTION 7: VEHICLES TABLE — POLICIES
-- ############################################################

-- 7A. Drivers can SELECT their own vehicles
DROP POLICY IF EXISTS vehicles_select_own_driver ON public.vehicles;
CREATE POLICY vehicles_select_own_driver ON public.vehicles
  FOR SELECT USING (
    driver_id IN (SELECT id FROM public.drivers WHERE profile_id = auth.uid())
  );

-- 7B. Admin full access on vehicles
DROP POLICY IF EXISTS vehicles_all_admin ON public.vehicles;
CREATE POLICY vehicles_all_admin ON public.vehicles
  FOR ALL USING ( public.is_admin() );


-- ############################################################
-- SECTION 8: VEHICLE_TYPES & FARE_CONFIGURATIONS — READ ACCESS
-- ############################################################
-- These are reference/config tables. Everyone should be able to read them.
-- Only admins should be able to modify them.

-- Vehicle Types
DROP POLICY IF EXISTS vehicle_types_select_all ON public.vehicle_types;
CREATE POLICY vehicle_types_select_all ON public.vehicle_types
  FOR SELECT USING ( true );

DROP POLICY IF EXISTS vehicle_types_all_admin ON public.vehicle_types;
CREATE POLICY vehicle_types_all_admin ON public.vehicle_types
  FOR ALL USING ( public.is_admin() );

-- Fare Configurations
DROP POLICY IF EXISTS fare_config_select_all ON public.fare_configurations;
CREATE POLICY fare_config_select_all ON public.fare_configurations
  FOR SELECT USING ( true );

DROP POLICY IF EXISTS fare_config_all_admin ON public.fare_configurations;
CREATE POLICY fare_config_all_admin ON public.fare_configurations
  FOR ALL USING ( public.is_admin() );


-- ############################################################
-- SECTION 9: RPC — ACCEPT BOOKING (Atomic, Race-Condition Safe)
-- ############################################################
-- Prevents two drivers from accepting the same ride simultaneously.
-- Uses SELECT ... FOR UPDATE to lock the row during the transaction.

CREATE OR REPLACE FUNCTION public.accept_booking(
  p_booking_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_driver_id uuid;
  v_booking_status text;
  v_current_driver_id uuid;
BEGIN
  -- 1. Get the driver ID for the current user
  SELECT id INTO v_driver_id
  FROM public.drivers
  WHERE profile_id = auth.uid()
    AND status = 'approved'
  LIMIT 1;

  IF v_driver_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'You are not registered as an approved driver.'
    );
  END IF;

  -- 2. Lock and read the booking row (prevents race conditions)
  SELECT status::text, driver_id
  INTO v_booking_status, v_current_driver_id
  FROM public.bookings
  WHERE id = p_booking_id
  FOR UPDATE;

  IF v_booking_status IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Booking not found.'
    );
  END IF;

  -- 3. Check if booking is still available
  IF v_booking_status NOT IN ('pending', 'searching') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'This ride has already been accepted or is no longer available.'
    );
  END IF;

  IF v_current_driver_id IS NOT NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'This ride has already been assigned to another driver.'
    );
  END IF;

  -- 4. Assign the driver and update status atomically
  UPDATE public.bookings
  SET
    driver_id = v_driver_id,
    status = 'accepted',
    updated_at = now()
  WHERE id = p_booking_id;

  RETURN json_build_object(
    'success', true,
    'driver_id', v_driver_id,
    'booking_id', p_booking_id,
    'status', 'accepted'
  );
END;
$$;


-- ############################################################
-- SECTION 10: RPC — COMPLETE BOOKING
-- ############################################################
-- Called by the driver when ride is finished.
-- Uses estimated_fare as the actual fare (admin can override later).
-- Progresses: pickedUp → droppedOff

CREATE OR REPLACE FUNCTION public.complete_booking(
  p_booking_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_driver_id uuid;
  v_booking record;
BEGIN
  -- 1. Get the driver ID for the current user
  SELECT id INTO v_driver_id
  FROM public.drivers
  WHERE profile_id = auth.uid()
    AND status = 'approved'
  LIMIT 1;

  IF v_driver_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'You are not registered as an approved driver.'
    );
  END IF;

  -- 2. Lock and read the booking
  SELECT * INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id
  FOR UPDATE;

  IF v_booking IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Booking not found.'
    );
  END IF;

  -- 3. Verify this driver owns the booking
  IF v_booking.driver_id != v_driver_id THEN
    RETURN json_build_object(
      'success', false,
      'error', 'This booking is not assigned to you.'
    );
  END IF;

  -- 4. Verify booking is in the right state
  IF v_booking.status::text NOT IN ('pickedUp') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Booking must be in pickedUp status to complete. Current: ' || v_booking.status::text
    );
  END IF;

  -- 5. Complete the booking — use estimated_fare as actual_fare
  UPDATE public.bookings
  SET
    status = 'droppedOff',
    actual_fare = COALESCE(actual_fare, estimated_fare),
    completed_at = now(),
    updated_at = now()
  WHERE id = p_booking_id;

  RETURN json_build_object(
    'success', true,
    'booking_id', p_booking_id,
    'status', 'droppedOff',
    'fare', COALESCE(v_booking.actual_fare, v_booking.estimated_fare)
  );
END;
$$;


-- ############################################################
-- SECTION 11: ADD updated_at AND completed_at COLUMNS (IF MISSING)
-- ############################################################
-- These columns are referenced by the RPCs above. Add them safely.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN completed_at timestamptz;
  END IF;
END $$;

-- Auto-update updated_at on every bookings row change
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS bookings_set_updated_at ON public.bookings;
CREATE TRIGGER bookings_set_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ############################################################
-- SECTION 12: AUTO-DEACTIVATE PASSENGER ON 3 CANCELLATIONS
-- ############################################################
-- Automatically toggles profiles.is_active = false if passenger cancels >= 3 trips.

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
    -- Count all cancelled bookings for this passenger
    SELECT COUNT(*) INTO v_cancel_count
    FROM public.bookings
    WHERE passenger_id = COALESCE(NEW.passenger_id, OLD.passenger_id)
      AND status = 'cancelled';

    -- If cancellation count is 3 or more, deactivate the passenger profile
    IF v_cancel_count >= 3 THEN
      UPDATE public.profiles
      SET is_active = false
      WHERE id = v_profile_id;
    ELSE
      -- Optional: reactivate if cancellations go below 3 (e.g. on reset)
      UPDATE public.profiles
      SET is_active = true
      WHERE id = v_profile_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_booking_cancelled ON public.bookings;
CREATE TRIGGER on_booking_cancelled
  AFTER INSERT OR UPDATE OF status ON public.bookings
  FOR EACH ROW
  WHEN (NEW.status = 'cancelled')
  EXECUTE FUNCTION public.handle_booking_cancellation();


-- ############################################################
-- DONE! Summary of what was created:
-- ############################################################
-- ✅ Realtime enabled on 7 tables
-- ✅ RLS enabled on 7 tables
-- ✅ 3 passenger booking policies (INSERT, SELECT, UPDATE)
-- ✅ 4 admin booking policies (SELECT, INSERT, UPDATE, DELETE)
-- ✅ 3 driver table policies (SELECT own, UPDATE own, admin ALL)
-- ✅ 2 passenger table policies (SELECT own, admin ALL)
-- ✅ 2 vehicle policies (driver SELECT own, admin ALL)
-- ✅ 4 config table policies (everyone SELECT, admin ALL)
-- ✅ accept_booking RPC (atomic, race-safe)
-- ✅ complete_booking RPC (uses estimated_fare)
-- ✅ updated_at / completed_at columns + auto-trigger
-- ✅ Auto-deactivate passenger profile on 3+ cancellations trigger
-- ============================================================


-- ############################################################
-- SECTION 13: FIX GENERATE BOOKING NUMBER BY MAX SUFFIX INSTEAD OF COUNT
-- ############################################################

CREATE OR REPLACE FUNCTION public.generate_booking_number()
RETURNS TRIGGER AS $$
DECLARE
  v_today_prefix TEXT;
  v_max_suffix INTEGER;
BEGIN
  v_today_prefix := 'TG-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-%';
  
  SELECT COALESCE(
    MAX(CAST(SUBSTRING(booking_number FROM '([0-9]+)$') AS INTEGER)), 
    0
  ) + 1 INTO v_max_suffix
  FROM public.bookings
  WHERE booking_number LIKE v_today_prefix;

  NEW.booking_number := 'TG-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(v_max_suffix::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ############################################################
-- SECTION 14: EMAIL COLUMN, UPDATED TRIGGER & PASSENGER BACKFILL
-- ############################################################

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

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


