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
 * Local mock driver creation (no backend required).
 * Validates basic uniqueness against in-memory state is handled by the caller.
 */
export async function createDriverAccount(
  params: CreateDriverParams
): Promise<CreateDriverResult> {
  const { fullName, email, contactNumber, plateNumber } = params;

  if (!fullName || !email || !contactNumber || !plateNumber) {
    return { success: false, error: 'Please fill in all required fields.' };
  }

  // Simulate a short async delay as if saving
  await new Promise((resolve) => setTimeout(resolve, 500));

  return { success: true, driverName: fullName };
}
