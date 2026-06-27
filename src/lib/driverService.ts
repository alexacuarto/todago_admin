import { supabase } from './supabase';

export interface CreateDriverParams {
  fullName: string;
  email: string;
  password: string;
  contactNumber: string;
  plateNumber: string;
  todaAssociation: string;
}

export interface CreateDriverResult {
  success: boolean;
  error?: string;
  driverName?: string;
}

/**
 * Creates a driver account in two steps:
 *  1. Supabase Auth sign-up (email + password) with user_metadata
 *     so the `handle_new_user` trigger auto-creates the profile row.
 *  2. Insert a row into the `drivers` table linked to the new profile,
 *     and a row into the `vehicles` table for the plate number.
 *
 * If auth creation fails (e.g. duplicate email), the database insert
 * is never attempted.
 */
export async function createDriverAccount(
  params: CreateDriverParams
): Promise<CreateDriverResult> {
  const { fullName, email, password, contactNumber, plateNumber, todaAssociation } = params;

  // Split full name into first and last
  const nameParts = fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // ── Step 1: Create Supabase Auth user ──────────────────────────────────
  // The `handle_new_user` DB trigger reads raw_user_meta_data and
  // auto-creates a profiles row with role='driver'.
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        phone_number: contactNumber,
        role: 'driver',
      },
    },
  });

  if (authError) {
    // Common: "User already registered"
    return { success: false, error: authError.message };
  }

  const userId = authData.user?.id;
  if (!userId) {
    return { success: false, error: 'User creation succeeded but no user ID was returned.' };
  }

  // ── Step 2: Insert driver record ───────────────────────────────────────
  const { data: driverRow, error: driverError } = await supabase
    .from('drivers')
    .insert({
      profile_id: userId,
      license_number: 'PENDING',    // admin can update later
      status: 'approved',           // is_approved = true per requirements
      approved_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (driverError) {
    return {
      success: false,
      error: `Auth account created but driver record failed: ${driverError.message}`,
    };
  }

  // ── Step 3: Insert vehicle record (plate number) ───────────────────────
  // We need a vehicle_type — get the first active one (Tricycle)
  const { data: vehicleType } = await supabase
    .from('vehicle_types')
    .select('id')
    .eq('is_active', true)
    .limit(1)
    .single();

  if (vehicleType && driverRow) {
    await supabase.from('vehicles').insert({
      driver_id: driverRow.id,
      vehicle_type_id: vehicleType.id,
      plate_number: plateNumber,
    });
  }

  return { success: true, driverName: fullName };
}
