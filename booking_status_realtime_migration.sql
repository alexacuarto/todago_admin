-- ============================================================
-- TODAGO: BOOKING STATUS, REALTIME & SECURE RLS POLICIES
-- ============================================================

-- 1. Standards for Booking Status Enum
-- Ensure all required enum values exist. Do not drop the enum.
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'searching';
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'accepted';
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'pickedUp';
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'completed';
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'cancelled';


-- 2. Enable Realtime Replication for Key Tables
-- Ensure that insertion and update events trigger realtime events for these tables.
DO $$
BEGIN
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
    ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicles;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;


-- 3. Row Level Security (RLS) policies

-- Enable RLS on core tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- 3A. Profiles Table Policies
-- Clean up existing general read policies to enforce strict data isolation
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins have full access" ON public.profiles;
DROP POLICY IF EXISTS profiles_select_driver ON public.profiles;

-- Self profile read
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Self profile update
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admin full access
CREATE POLICY profiles_all_admin ON public.profiles
  FOR ALL USING (public.is_admin());

-- Driver access: Can select profiles of passengers associated with available bookings or accepted bookings assigned to them
CREATE POLICY profiles_select_for_driver ON public.profiles
  FOR SELECT USING (
    role = 'passenger'
    AND id IN (
      SELECT p.profile_id FROM public.bookings b
      JOIN public.passengers p ON b.passenger_id = p.id
      WHERE (b.status::text = 'searching' AND b.driver_id IS NULL)
         OR (b.driver_id IN (SELECT id FROM public.drivers WHERE profile_id = auth.uid()) AND b.status::text IN ('accepted', 'pickedUp'))
    )
  );

-- Passenger access: Can select profiles of drivers assigned to their bookings
CREATE POLICY profiles_select_for_passenger ON public.profiles
  FOR SELECT USING (
    role = 'driver'
    AND id IN (
      SELECT d.profile_id FROM public.bookings b
      JOIN public.drivers d ON b.driver_id = d.id
      WHERE b.passenger_id IN (SELECT id FROM public.passengers WHERE profile_id = auth.uid())
    )
  );


-- 3B. Drivers Table Policies
DROP POLICY IF EXISTS drivers_select_for_passenger ON public.drivers;

-- Passenger access: Can select driver details of drivers assigned to their bookings
CREATE POLICY drivers_select_for_passenger ON public.drivers
  FOR SELECT USING (
    id IN (
      SELECT b.driver_id FROM public.bookings b
      WHERE b.passenger_id IN (SELECT id FROM public.passengers WHERE profile_id = auth.uid())
    )
  );


-- 3C. Vehicles Table Policies
DROP POLICY IF EXISTS vehicles_select_for_passenger ON public.vehicles;

-- Passenger access: Can select vehicle details of drivers assigned to their bookings
CREATE POLICY vehicles_select_for_passenger ON public.vehicles
  FOR SELECT USING (
    driver_id IN (
      SELECT b.driver_id FROM public.bookings b
      WHERE b.passenger_id IN (SELECT id FROM public.passengers WHERE profile_id = auth.uid())
    )
  );


-- 3D. Passengers Table Policies
DROP POLICY IF EXISTS passengers_select_for_driver ON public.passengers;

-- Driver access: Can select passenger mappings associated with active bookings
CREATE POLICY passengers_select_for_driver ON public.passengers
  FOR SELECT USING (
    id IN (
      SELECT b.passenger_id FROM public.bookings b
      WHERE (b.status::text = 'searching' AND b.driver_id IS NULL)
         OR (b.driver_id IN (SELECT id FROM public.drivers WHERE profile_id = auth.uid()) AND b.status::text IN ('accepted', 'pickedUp'))
    )
  );

-- 4. Update existing approved drivers to be ACTIVE and VERIFIED for testing
UPDATE public.drivers
SET account_status = 'ACTIVE',
    document_status = 'VERIFIED'
WHERE status = 'approved';

