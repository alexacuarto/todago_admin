import { supabase } from './supabase';

export interface CreateDriverParams {
  fullName: string;
  email: string;
  password: string;
  contactNumber: string;
  plateNumber: string;
  todaAssociation: string;
  licenseImage?: File | null;
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
 *  4. Upload license image if provided
 */
export async function createDriverAccount(
  params: CreateDriverParams
): Promise<CreateDriverResult> {
  const { fullName, email, password, contactNumber, plateNumber, todaAssociation, licenseImage } = params;

  console.log("createDriverAccount starting with params:", {
    fullName,
    email,
    contactNumber,
    plateNumber,
    todaAssociation,
    hasLicenseImage: !!licenseImage,
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

    // 1b. Pre-validate uniqueness using client queries to prevent ghost user signup
    console.log("Pre-validating uniqueness...");
    if (contactNumber) {
      const { data: phoneCheck, error: phoneCheckError } = await supabase.from('profiles').select('id').eq('phone_number', contactNumber).maybeSingle();
      if (phoneCheckError) {
        console.warn("Uniqueness check for phone number returned an error:", phoneCheckError);
      }
      if (phoneCheck) {
        console.error("Validation failed: Phone number already exists.");
        return { success: false, error: 'Phone number already exists' };
      }
    }

    const { data: plateCheck, error: plateCheckError } = await supabase.from('vehicles').select('id').eq('plate_number', plateNumber).maybeSingle();
    if (plateCheckError) {
      console.warn("Uniqueness check for plate number returned an error:", plateCheckError);
    }
    if (plateCheck) {
      console.error("Validation failed: Plate number already exists.");
      return { success: false, error: 'Plate number already exists' };
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
      return { success: false, error: `Auth signup failed: ${signUpError.message || JSON.stringify(signUpError)}` };
    }

    const userId = signUpData?.user?.id;
    console.log("Auth user creation result. User ID:", userId);
    if (!userId) {
      console.error("signUpData lacks user.id:", signUpData);
      return { success: false, error: 'Could not create auth user: Missing user id.' };
    }

    // 3. Restore admin session
    console.log("Restoring admin session...");
    const { error: restoreSessionError } = await supabase.auth.setSession({
      access_token: adminSession.access_token,
      refresh_token: adminSession.refresh_token,
    });
    if (restoreSessionError) {
      console.error("Failed to restore admin session:", restoreSessionError);
      return { success: false, error: `Failed to restore admin session: ${restoreSessionError.message}` };
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
      const rpcErrMsg = `RPC failed: ${rpcError.message || 'Unknown RPC error'}${rpcError.details ? ` (${rpcError.details})` : ''}${rpcError.hint ? ` (${rpcError.hint})` : ''}`;
      
      console.log("Rolling back user creation due to RPC error...");
      await supabase.rpc('rollback_user_creation', { p_user_id: userId });
      return { success: false, error: rpcErrMsg };
    }

    if (!data?.success) {
      console.error("create_driver_account RPC returned success=false:", data);
      const dataErrMsg = data?.error || 'Failed to create driver account (RPC success=false).';
      
      console.log("Rolling back user creation due to success=false...");
      await supabase.rpc('rollback_user_creation', { p_user_id: userId });
      return { success: false, error: dataErrMsg };
    }

    // 5. Upload document if licenseImage is provided
    if (licenseImage) {
      console.log("Uploading license image file:", licenseImage.name);
      const fileExt = licenseImage.name.split('.').pop() || 'png';
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      const bucketName = 'driver-documents';

      const { data: uploadData, error: storageError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, licenseImage, {
          upsert: true,
        });

      if (storageError) {
        console.error("Storage upload failed:", storageError);
        console.log("Rolling back user creation due to storage upload failure...");
        await supabase.rpc('rollback_user_creation', { p_user_id: userId });
        
        let errorMsg = storageError.message || JSON.stringify(storageError);
        if (
          errorMsg.toLowerCase().includes('bucket not found') ||
          errorMsg.toLowerCase().includes('does not exist') ||
          (storageError as any).status === 404 ||
          (storageError as any).statusCode === '404'
        ) {
          errorMsg = "Storage bucket driver-documents does not exist. Please create it in Supabase Storage.";
        }
        
        return { success: false, error: `Storage upload failed: ${errorMsg}` };
      }

      console.log("Storage upload successful:", uploadData);

      // Get public URL structure (will be signed on-the-fly for private access)
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      console.log("Retrieved public URL structure for license:", publicUrl);

      // Update the driver's license photo url
      console.log("Updating drivers table with license photo URL...");
      const { error: updateError } = await supabase
        .from('drivers')
        .update({ license_photo_url: publicUrl })
        .eq('profile_id', userId);

      if (updateError) {
        console.error("Failed to update driver with license photo URL:", updateError);
        console.log("Rolling back user creation due to driver profile update failure...");
        await supabase.rpc('rollback_user_creation', { p_user_id: userId });
        return { success: false, error: `Failed to update driver profile with license photo: ${updateError.message}` };
      }
      console.log("Driver license photo URL updated successfully.");
    }

    console.log("Driver account creation completed successfully.");
    return { success: true, driverName: fullName };
  } catch (err: any) {
    console.error("Unexpected JavaScript exception in createDriverAccount:", err);
    return { success: false, error: `Unexpected error: ${err.message || String(err)}` };
  }
}
