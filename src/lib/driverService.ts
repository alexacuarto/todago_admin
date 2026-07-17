import { supabase } from './supabase';

export interface CreateDriverParams {
  fullName: string;
  email: string;
  password: string;
  contactNumber: string;
  plateNumber: string;
  todaAssociation: string;
  // Optional document uploads during creation
  licenseFrontImage?: File | null;
  licenseBackImage?: File | null;
  licenseNumber?: string;
  licenseExpiryDate?: string;
  franchiseImage?: File | null;
  franchiseNumber?: string;
  franchiseExpiryDate?: string;
}

export interface CreateDriverResult {
  success: boolean;
  error?: string;
  driverName?: string;
}

/**
 * Helper: upload a file to Supabase storage and return its public URL.
 */
async function uploadDriverDoc(
  userId: string,
  file: File,
  label: string
): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'png';
  const fileName = `${userId}-${label}-${Date.now()}.${fileExt}`;
  const bucketName = 'driver-documents';

  const { error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file, { upsert: true });

  if (error) {
    throw new Error(`Failed to upload ${label}: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  return publicUrl;
}

/**
 * Idempotent driver creation:
 *  1. signUp() → create auth user (safe if already exists)
 *  2. Restore admin session
 *  3. RPC → create profile + driver + vehicle (all use ON CONFLICT)
 *  4. Upload document images if provided
 *  5. Update driver record with document URLs & metadata
 */
export async function createDriverAccount(
  params: CreateDriverParams
): Promise<CreateDriverResult> {
  const {
    fullName, email, password, contactNumber, plateNumber, todaAssociation,
    licenseFrontImage, licenseBackImage, licenseNumber, licenseExpiryDate,
    franchiseImage, franchiseNumber, franchiseExpiryDate,
  } = params;

  console.log("createDriverAccount starting with params:", {
    fullName, email, contactNumber, plateNumber, todaAssociation,
    hasLicenseFront: !!licenseFrontImage,
    hasLicenseBack: !!licenseBackImage,
    hasLicenseNumber: !!licenseNumber,
    hasFranchiseImage: !!franchiseImage,
  });

  const nameParts = fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  try {
    // 1. Save admin session
    console.log("Fetching admin session...");
    const { data: { session: adminSession }, error: adminSessionError } = await supabase.auth.getSession();
    if (adminSessionError) {
      console.error("Failed to get admin session:", adminSessionError);
      return { success: false, error: `Admin session retrieval failed: ${adminSessionError.message}` };
    }
    if (!adminSession) {
      console.error("No active admin session found.");
      return { success: false, error: 'Admin is not logged in.' };
    }

    // 1b. Pre-validate uniqueness
    console.log("Pre-validating uniqueness...");
    if (email) {
      const { data: emailCheck } = await supabase.from('profiles').select('id').eq('email', email).maybeSingle();
      if (emailCheck) {
        console.error("Validation failed: Email already exists.");
        return { success: false, error: 'Driver account already exists.' };
      }
    }

    if (contactNumber) {
      const { data: phoneCheck } = await supabase.from('profiles').select('id').eq('phone_number', contactNumber).maybeSingle();
      if (phoneCheck) {
        console.error("Validation failed: Phone number already exists.");
        return { success: false, error: 'Driver account already exists.' };
      }
    }

    const { data: plateCheck } = await supabase.from('vehicles').select('id').eq('plate_number', plateNumber).maybeSingle();
    if (plateCheck) {
      console.error("Validation failed: Plate number already exists.");
      return { success: false, error: 'Driver account already exists.' };
    }

    // 2. Create auth user via signUp
    console.log("Calling supabase.auth.signUp...");
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
      console.error("supabase.auth.signUp failed:", signUpError);
      return { success: false, error: signUpError.message };
    }

    const userId = signUpData?.user?.id;
    console.log("Auth user creation result. User ID:", userId);
    if (!userId) {
      console.error("signUpData lacks user.id:", signUpData);
      return { success: false, error: 'User ID was not generated.' };
    }

    // 3. Restore admin session
    console.log("Restoring admin session...");
    const { error: restoreSessionError } = await supabase.auth.setSession({
      access_token: adminSession.access_token,
      refresh_token: adminSession.refresh_token,
    });
    if (restoreSessionError) {
      console.error("Failed to restore admin session:", restoreSessionError);
      return { success: false, error: `Restore admin session failed: ${restoreSessionError.message}` };
    }

    // 4. Call RPC
    console.log("Calling create_driver_account RPC...");
    const { data, error: rpcError } = await supabase.rpc('create_driver_account', {
      p_user_id: userId,
      p_email: email,
      p_first_name: firstName,
      p_last_name: lastName,
      p_phone: contactNumber,
      p_plate_number: plateNumber,
      p_toda_association: todaAssociation,
    });

    console.log("create_driver_account RPC Response Data:", data);
    if (rpcError) {
      console.error("create_driver_account RPC failed with error:", rpcError);
      await supabase.rpc('rollback_user_creation', { p_user_id: userId });
      return { success: false, error: rpcError.message };
    }

    if (!data?.success) {
      console.error("create_driver_account RPC returned success=false:", data);
      await supabase.rpc('rollback_user_creation', { p_user_id: userId });
      return { success: false, error: data?.error || 'Database RPC reported failure.' };
    }

    // 5. Upload document files if provided and update driver record
    const driverUpdates: Record<string, string | null> = {};

    try {
      if (licenseFrontImage) {
        console.log("Uploading license front image...");
        const frontUrl = await uploadDriverDoc(userId, licenseFrontImage, 'front');
        driverUpdates.license_front_url = frontUrl;
        driverUpdates.license_photo_url = frontUrl; // backward compat
      }

      if (licenseBackImage) {
        console.log("Uploading license back image...");
        const backUrl = await uploadDriverDoc(userId, licenseBackImage, 'back');
        driverUpdates.license_back_url = backUrl;
      }

      if (franchiseImage) {
        console.log("Uploading franchise image...");
        const franchiseUrl = await uploadDriverDoc(userId, franchiseImage, 'franchise');
        driverUpdates.franchise_url = franchiseUrl;
      }

      if (licenseNumber) driverUpdates.license_number = licenseNumber;
      if (licenseExpiryDate) driverUpdates.license_expiry_date = licenseExpiryDate;
      if (franchiseNumber) driverUpdates.franchise_number = franchiseNumber;
      if (franchiseExpiryDate) driverUpdates.franchise_expiry_date = franchiseExpiryDate;

      // Apply all document updates in one query
      if (Object.keys(driverUpdates).length > 0) {
        console.log("Updating driver record with document data...", driverUpdates);
        const { error: updateError } = await supabase
          .from('drivers')
          .update(driverUpdates)
          .eq('profile_id', userId);

        if (updateError) throw updateError;
      }
    } catch (docError: any) {
      console.error("Error during document uploads/saving; rolling back user...", docError);
      await supabase.rpc('rollback_user_creation', { p_user_id: userId });
      return { success: false, error: docError.message || String(docError) };
    }

    console.log("Driver account creation completed successfully.");
    return { success: true, driverName: fullName };
  } catch (err: any) {
    console.error("Unexpected JavaScript exception in createDriverAccount:", err);
    return { success: false, error: err.message || String(err) };
  }

}
