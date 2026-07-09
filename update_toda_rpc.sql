-- SQL Migration: Update create_driver_account RPC to accept and save p_toda_association
CREATE OR REPLACE FUNCTION public.create_driver_account(
  p_user_id uuid,
  p_email text,
  p_first_name text,
  p_last_name text,
  p_phone text,
  p_plate_number text,
  p_toda_association text DEFAULT NULL
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

  -- Hard uniqueness check on email
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

  -- PROFILE (Upsert)
  INSERT INTO public.profiles (id, first_name, last_name, phone_number, role)
  VALUES (p_user_id, p_first_name, p_last_name, p_phone, 'driver')
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone_number = EXCLUDED.phone_number,
    role = 'driver';

  -- DRIVER (Upsert with toda_association)
  INSERT INTO public.drivers (profile_id, license_number, status, approved_at, toda_association)
  VALUES (p_user_id, 'PENDING', 'approved', now(), p_toda_association)
  ON CONFLICT (profile_id) DO UPDATE SET
    status = 'approved',
    approved_at = COALESCE(public.drivers.approved_at, now()),
    toda_association = EXCLUDED.toda_association
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
    ON CONFLICT (driver_id) DO UPDATE SET plate_number = EXCLUDED.plate_number;
  END IF;

  RETURN json_build_object(
    'success', true,
    'driver_id', v_driver_id
  );
END;
$$;
