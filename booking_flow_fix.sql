-- ============================================================================
-- SQL Migration: Standardize Booking Statuses and Fix RLS Policies
-- ============================================================================

-- 1. Ensure all standardized booking status enum values exist
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'searching';
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'pickedUp';
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'droppedOff';
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'paymentSent';

-- 2. Ensure generate_booking_number function and before_insert trigger exist
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

DROP TRIGGER IF EXISTS before_booking_insert ON public.bookings;
CREATE TRIGGER before_booking_insert
  BEFORE INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_booking_number();

-- 3. PASSENGER RLS POLICIES
-- A. Passenger can INSERT bookings
DROP POLICY IF EXISTS bookings_insert_passenger ON public.bookings;
CREATE POLICY bookings_insert_passenger ON public.bookings
  FOR INSERT WITH CHECK (
    passenger_id IN (SELECT id FROM public.passengers WHERE profile_id = auth.uid())
  );

-- B. Passenger can SELECT their own bookings
DROP POLICY IF EXISTS bookings_select_passenger ON public.bookings;
CREATE POLICY bookings_select_passenger ON public.bookings
  FOR SELECT USING (
    passenger_id IN (SELECT id FROM public.passengers WHERE profile_id = auth.uid())
  );

-- C. Passenger can UPDATE (cancel) their own bookings
-- Only allow updates if booking is NOT already completed (droppedOff/paymentSent) or already cancelled.
DROP POLICY IF EXISTS bookings_update_passenger ON public.bookings;
CREATE POLICY bookings_update_passenger ON public.bookings
  FOR UPDATE USING (
    passenger_id IN (SELECT id FROM public.passengers WHERE profile_id = auth.uid())
    AND status::text NOT IN ('droppedOff', 'paymentSent', 'completed', 'cancelled')
  )
  WITH CHECK (
    status::text = 'cancelled'
  );

-- 4. DRIVER RLS POLICIES
-- A. Approved, online drivers can see unassigned bookings (status pending/searching)
-- Plus drivers can see bookings assigned to them.
DROP POLICY IF EXISTS bookings_select_driver ON public.bookings;
CREATE POLICY bookings_select_driver ON public.bookings
  FOR SELECT USING (
    driver_id IN (SELECT id FROM public.drivers WHERE profile_id = auth.uid())
    OR (
      status::text IN ('pending', 'searching')
      AND driver_id IS NULL
      AND EXISTS (
        SELECT 1 FROM public.drivers
        WHERE profile_id = auth.uid()
          AND status = 'approved'
          AND is_online = TRUE
      )
    )
  );

-- B. Drivers can update ONLY bookings already assigned to them.
-- Claiming a booking is handled atomically by accept_booking RPC (SECURITY DEFINER).
DROP POLICY IF EXISTS bookings_update_driver ON public.bookings;
CREATE POLICY bookings_update_driver ON public.bookings
  FOR UPDATE USING (
    driver_id IN (SELECT id FROM public.drivers WHERE profile_id = auth.uid())
  );

-- 5. ADMIN RLS POLICIES
-- Admins can SELECT all bookings (including cancelled ones)
DROP POLICY IF EXISTS bookings_select_admin ON public.bookings;
CREATE POLICY bookings_select_admin ON public.bookings
  FOR SELECT USING ( public.is_admin() );

-- Admins can UPDATE bookings
DROP POLICY IF EXISTS bookings_update_admin ON public.bookings;
CREATE POLICY bookings_update_admin ON public.bookings
  FOR UPDATE USING ( public.is_admin() );

-- Admins can DELETE bookings
DROP POLICY IF EXISTS bookings_delete_admin ON public.bookings;
CREATE POLICY bookings_delete_admin ON public.bookings
  FOR DELETE USING ( public.is_admin() );


-- ============================================================================
-- 6. DRIVER ACCOUNT CREATION TRIGGER & FUNCTION (Conflict Fix)
-- ============================================================================

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

  -- PROFILE (Upsert/Insert)
  INSERT INTO public.profiles (id, first_name, last_name, phone_number, role)
  VALUES (p_user_id, p_first_name, p_last_name, p_phone, 'driver')
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone_number = EXCLUDED.phone_number,
    role = 'driver';

  -- DRIVER (Ensure status is always set to approved when admin creates/updates it)
  INSERT INTO public.drivers (profile_id, license_number, status, approved_at)
  VALUES (p_user_id, 'PENDING', 'approved', now())
  ON CONFLICT (profile_id) DO UPDATE SET
    status = 'approved',
    approved_at = COALESCE(public.drivers.approved_at, now())
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
    ON CONFLICT (plate_number) DO NOTHING;
  END IF;

  RETURN json_build_object(
    'success', true,
    'driver_id', v_driver_id
  );
END;
$$;


-- ============================================================================
-- 7. SAFE SQL BACKFILL FOR EXISTING DRIVER ACCOUNTS
-- ============================================================================

-- Backfill matching rows in drivers table for all profiles with role = 'driver'
INSERT INTO public.drivers (profile_id, license_number, status, approved_at, is_online)
SELECT id, 'PENDING', 'approved', now(), false
FROM public.profiles
WHERE role = 'driver'
ON CONFLICT (profile_id) DO UPDATE SET
  status = 'approved',
  approved_at = COALESCE(public.drivers.approved_at, now());

