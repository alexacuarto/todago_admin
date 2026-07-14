-- ============================================================
-- TODAGO: FARE SETTINGS MIGRATION
-- Adds trip-type-specific fare configs with discount support
-- ============================================================
-- SAFE TO RUN: Uses IF NOT EXISTS / ON CONFLICT guards.
-- Run this in Supabase SQL Editor.
-- ============================================================

-- 1. Add new columns to fare_configurations (idempotent)
DO $$
BEGIN
  -- trip_type: 'one_way' or 'round_trip'
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'fare_configurations' AND column_name = 'trip_type'
  ) THEN
    ALTER TABLE public.fare_configurations ADD COLUMN trip_type TEXT DEFAULT 'one_way';
  END IF;

  -- display_label: Human-readable label shown in admin portal
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'fare_configurations' AND column_name = 'display_label'
  ) THEN
    ALTER TABLE public.fare_configurations ADD COLUMN display_label TEXT DEFAULT 'One Way Trip';
  END IF;

  -- included_km: KM included in the base fare before per-KM surcharge kicks in
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'fare_configurations' AND column_name = 'included_km'
  ) THEN
    ALTER TABLE public.fare_configurations ADD COLUMN included_km NUMERIC DEFAULT 1;
  END IF;

  -- succeeding_km_fare: Rate charged per additional KM beyond included_km
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'fare_configurations' AND column_name = 'succeeding_km_fare'
  ) THEN
    ALTER TABLE public.fare_configurations ADD COLUMN succeeding_km_fare NUMERIC DEFAULT 2;
  END IF;

  -- student_discount: Percentage discount for students (e.g. 20 = 20%)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'fare_configurations' AND column_name = 'student_discount'
  ) THEN
    ALTER TABLE public.fare_configurations ADD COLUMN student_discount NUMERIC DEFAULT 20;
  END IF;

  -- pwd_discount: Percentage discount for persons with disabilities
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'fare_configurations' AND column_name = 'pwd_discount'
  ) THEN
    ALTER TABLE public.fare_configurations ADD COLUMN pwd_discount NUMERIC DEFAULT 20;
  END IF;

  -- senior_citizen_discount: Percentage discount for senior citizens
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'fare_configurations' AND column_name = 'senior_citizen_discount'
  ) THEN
    ALTER TABLE public.fare_configurations ADD COLUMN senior_citizen_discount NUMERIC DEFAULT 20;
  END IF;
END $$;


-- 2. Create a unique constraint on trip_type so we can upsert
-- (Safe: will skip if it already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'fare_configurations_trip_type_unique'
  ) THEN
    ALTER TABLE public.fare_configurations
      ADD CONSTRAINT fare_configurations_trip_type_unique UNIQUE (trip_type);
  END IF;
END $$;


-- 3. Update existing row to be the 'one_way' config
UPDATE public.fare_configurations
SET
  trip_type = 'one_way',
  display_label = 'One Way Trip',
  base_fare = COALESCE(base_fare, 25),
  included_km = COALESCE(included_km, 1),
  succeeding_km_fare = COALESCE(succeeding_km_fare, 2),
  student_discount = COALESCE(student_discount, 20),
  pwd_discount = COALESCE(pwd_discount, 20),
  senior_citizen_discount = COALESCE(senior_citizen_discount, 20),
  is_active = true,
  updated_at = NOW()
WHERE trip_type = 'one_way' OR trip_type IS NULL
LIMIT 1;


-- 4. Seed Round Trip config (will not duplicate if 'round_trip' already exists)
INSERT INTO public.fare_configurations (
  vehicle_type_id,
  fare_type,
  trip_type,
  display_label,
  base_fare,
  per_km_rate,
  minimum_fare,
  booking_fee,
  surge_multiplier,
  included_km,
  succeeding_km_fare,
  student_discount,
  pwd_discount,
  senior_citizen_discount,
  is_active,
  effective_from
)
SELECT
  vehicle_type_id,
  'per_km_with_base',
  'round_trip',
  'Round Trip',
  40,           -- Round trip base fare
  10,
  25,
  5,
  1,
  2,            -- Included KM for round trip
  2,            -- Succeeding KM fare
  20,           -- Student discount %
  20,           -- PWD discount %
  20,           -- Senior citizen discount %
  true,
  NOW()
FROM public.fare_configurations
WHERE trip_type = 'one_way'
LIMIT 1
ON CONFLICT (trip_type) DO NOTHING;


-- 5. Ensure RLS policy allows reading fare_configurations for all authenticated users
-- (Passengers need to read fare settings to calculate fares)
DO $$
BEGIN
  -- Drop and recreate read policy to ensure it's correct
  DROP POLICY IF EXISTS "fare_configurations_select_all" ON public.fare_configurations;

  CREATE POLICY "fare_configurations_select_all"
    ON public.fare_configurations
    FOR SELECT
    USING (true);  -- Anyone (including anon) can read fare settings

  -- Admin update policy
  DROP POLICY IF EXISTS "fare_configurations_update_admin" ON public.fare_configurations;

  CREATE POLICY "fare_configurations_update_admin"
    ON public.fare_configurations
    FOR UPDATE
    USING (
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

  -- Admin insert policy
  DROP POLICY IF EXISTS "fare_configurations_insert_admin" ON public.fare_configurations;

  CREATE POLICY "fare_configurations_insert_admin"
    ON public.fare_configurations
    FOR INSERT
    WITH CHECK (
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );
END $$;


-- 6. Verify the migration
SELECT trip_type, display_label, base_fare, included_km, succeeding_km_fare,
       student_discount, pwd_discount, senior_citizen_discount, is_active
FROM public.fare_configurations
ORDER BY trip_type;
