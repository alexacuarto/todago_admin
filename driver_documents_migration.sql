-- SQL Migration: Add driver document columns, status fields, and admin approval workflow
-- This migration is idempotent — safe to run multiple times.

-- 1. Add email column to public.profiles if it does not exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN email TEXT;
  END IF;
END $$;

-- 2. Add columns to public.drivers table (idempotent)
DO $$
BEGIN
  -- license_front_url
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'drivers' AND column_name = 'license_front_url'
  ) THEN
    ALTER TABLE public.drivers ADD COLUMN license_front_url TEXT;
  END IF;

  -- license_back_url
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'drivers' AND column_name = 'license_back_url'
  ) THEN
    ALTER TABLE public.drivers ADD COLUMN license_back_url TEXT;
  END IF;

  -- license_expiry_date
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'drivers' AND column_name = 'license_expiry_date'
  ) THEN
    ALTER TABLE public.drivers ADD COLUMN license_expiry_date DATE;
  END IF;

  -- franchise_url
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'drivers' AND column_name = 'franchise_url'
  ) THEN
    ALTER TABLE public.drivers ADD COLUMN franchise_url TEXT;
  END IF;

  -- franchise_number
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'drivers' AND column_name = 'franchise_number'
  ) THEN
    ALTER TABLE public.drivers ADD COLUMN franchise_number TEXT;
  END IF;

  -- franchise_expiry_date
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'drivers' AND column_name = 'franchise_expiry_date'
  ) THEN
    ALTER TABLE public.drivers ADD COLUMN franchise_expiry_date DATE;
  END IF;

  -- account_status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'drivers' AND column_name = 'account_status'
  ) THEN
    ALTER TABLE public.drivers ADD COLUMN account_status TEXT DEFAULT 'PENDING DOCUMENT';
  END IF;

  -- document_status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'drivers' AND column_name = 'document_status'
  ) THEN
    ALTER TABLE public.drivers ADD COLUMN document_status TEXT DEFAULT 'INCOMPLETE';
  END IF;

  -- rejection_reason
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'drivers' AND column_name = 'rejection_reason'
  ) THEN
    ALTER TABLE public.drivers ADD COLUMN rejection_reason TEXT;
  END IF;

  -- updated_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'drivers' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.drivers ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;


-- 3. Create/Update function to calculate and update document_status
-- IMPORTANT: This trigger does NOT auto-activate drivers.
-- When all documents are present → document_status = 'READY FOR VERIFICATION'
-- Admin must manually approve to set account_status = 'ACTIVE DRIVER'
-- Expired documents → account_status = 'DOCUMENT EXPIRED'
CREATE OR REPLACE FUNCTION public.fn_update_driver_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Set updated_at timestamp
  NEW.updated_at = NOW();

  -- Clean license_number if it is set to default 'PENDING' or similar
  IF NEW.license_number = 'PENDING' THEN
    NEW.license_number = NULL;
  END IF;

  -- Check if all required document fields are completed
  IF (
    NEW.license_front_url IS NOT NULL AND NEW.license_front_url != '' AND
    NEW.license_back_url IS NOT NULL AND NEW.license_back_url != '' AND
    NEW.license_number IS NOT NULL AND NEW.license_number != '' AND
    NEW.license_expiry_date IS NOT NULL AND
    NEW.franchise_url IS NOT NULL AND NEW.franchise_url != '' AND
    NEW.franchise_number IS NOT NULL AND NEW.franchise_number != '' AND
    NEW.franchise_expiry_date IS NOT NULL
  ) THEN
    -- Check if any document is expired
    IF (NEW.license_expiry_date < CURRENT_DATE OR NEW.franchise_expiry_date < CURRENT_DATE) THEN
      NEW.account_status = 'DOCUMENT EXPIRED';
      NEW.document_status = 'EXPIRED';
      NEW.status = 'inactive';
    ELSE
      -- All docs present and not expired.
      -- If already ACTIVE DRIVER (admin approved), keep it. Otherwise set to READY FOR VERIFICATION.
      IF NEW.account_status = 'ACTIVE DRIVER' AND NEW.document_status = 'VERIFIED' THEN
        -- Already approved — don't change status, keep ACTIVE DRIVER / VERIFIED
        NULL;
      ELSE
        -- Documents complete, awaiting admin review
        NEW.document_status = 'READY FOR VERIFICATION';
        -- Keep account_status as PENDING DOCUMENT until admin approves
        IF NEW.account_status IS NULL OR NEW.account_status NOT IN ('ACTIVE DRIVER', 'SUSPENDED') THEN
          NEW.account_status = 'PENDING DOCUMENT';
        END IF;
      END IF;
    END IF;
  ELSE
    -- Missing documents
    -- Only downgrade if currently not in a special state
    IF NEW.account_status NOT IN ('ACTIVE DRIVER', 'SUSPENDED') OR NEW.account_status IS NULL THEN
      NEW.account_status = 'PENDING DOCUMENT';
    END IF;
    NEW.document_status = 'INCOMPLETE';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- 4. Create Trigger to automatically handle status updates on INSERT or UPDATE
DROP TRIGGER IF EXISTS trg_update_driver_status ON public.drivers;
CREATE TRIGGER trg_update_driver_status
  BEFORE INSERT OR UPDATE OF 
    license_front_url, 
    license_back_url, 
    license_number, 
    license_expiry_date, 
    franchise_url, 
    franchise_number, 
    franchise_expiry_date
  ON public.drivers
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_update_driver_status();


-- 5. Update the create_driver_account RPC (removed p_body_number parameter)
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

  -- PROFILE (Upsert - including email)
  INSERT INTO public.profiles (id, first_name, last_name, phone_number, role, email)
  VALUES (p_user_id, p_first_name, p_last_name, p_phone, 'driver', p_email)
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone_number = EXCLUDED.phone_number,
    role = 'driver',
    email = EXCLUDED.email;

  -- DRIVER (Create with NULL documents → defaults to PENDING DOCUMENT / INCOMPLETE)
  INSERT INTO public.drivers (
    profile_id, 
    license_number, 
    license_front_url,
    license_back_url,
    license_expiry_date,
    franchise_url,
    franchise_number,
    franchise_expiry_date,
    status,
    toda_association,
    account_status,
    document_status
  )
  VALUES (
    p_user_id, 
    NULL, 
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'inactive',
    p_toda_association,
    'PENDING DOCUMENT',
    'INCOMPLETE'
  )
  ON CONFLICT (profile_id) DO UPDATE SET
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


-- 6. Delete Driver Account RPC (Admin only, removes auth user, profiles, vehicles, and documents cascade)
CREATE OR REPLACE FUNCTION public.delete_driver_account(
  p_user_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify caller is admin
  IF (auth.jwt() -> 'user_metadata' ->> 'role') IS DISTINCT FROM 'admin' THEN
    RETURN json_build_object('success', false, 'error', 'Only admins can delete driver accounts.');
  END IF;

  -- Verify the user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RETURN json_build_object('success', false, 'error', 'User not found.');
  END IF;

  -- Delete from auth.users (cascades to profiles, drivers, vehicles in public schema)
  DELETE FROM auth.users WHERE id = p_user_id;

  RETURN json_build_object('success', true);
END;
$$;
