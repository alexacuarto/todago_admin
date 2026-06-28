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
 * Idempotent driver creation:
 *  1. signUp() → create auth user (safe if already exists)
 *  2. Restore admin session
 *  3. RPC → create profile + driver + vehicle (all use ON CONFLICT)
 */
export async function createDriverAccount(
  params: CreateDriverParams
): Promise<CreateDriverResult> {
  const { fullName, email, password, contactNumber, plateNumber } = params;

  const nameParts = fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // 1. Save admin session
  const { data: { session: adminSession } } = await supabase.auth.getSession();
  if (!adminSession) {
    return { success: false, error: 'Admin is not logged in.' };
  }

  // 1b. Pre-validate uniqueness using client queries to prevent ghost user signup
  if (contactNumber) {
    const { data: phoneCheck } = await supabase.from('profiles').select('id').eq('phone_number', contactNumber).maybeSingle();
    if (phoneCheck) {
      return { success: false, error: 'Phone number already exists' };
    }
  }

  const { data: plateCheck } = await supabase.from('vehicles').select('id').eq('plate_number', plateNumber).maybeSingle();
  if (plateCheck) {
    return { success: false, error: 'Plate number already exists' };
  }

  // 2. Create auth user via signUp
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
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

  if (signUpError) {
    return { success: false, error: signUpError.message };
  }

  const userId = signUpData?.user?.id;
  if (!userId) {
    return { success: false, error: 'Could not create auth user.' };
  }

  // 3. Restore admin session
  await supabase.auth.setSession({
    access_token: adminSession.access_token,
    refresh_token: adminSession.refresh_token,
  });

  // 4. Call RPC
  const { data, error: rpcError } = await supabase.rpc('create_driver_account', {
    p_user_id: userId,
    p_email: email,
    p_first_name: firstName,
    p_last_name: lastName,
    p_phone: contactNumber,
    p_plate_number: plateNumber,
  });

  if (rpcError || !data?.success) {
    const errorMsg = rpcError?.message || data?.error || 'Failed to create driver account.';
    
    // Clean up/delete the created auth user from the database if RPC database writing fails
    await supabase.rpc('rollback_user_creation', { p_user_id: userId });
    
    alert(errorMsg);
    return { success: false, error: errorMsg };
  }

  return { success: true, driverName: fullName };
}
