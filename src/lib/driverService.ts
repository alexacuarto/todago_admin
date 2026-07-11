import { supabase } from "./supabase";
import { FunctionsHttpError, FunctionsRelayError, FunctionsFetchError } from "@supabase/supabase-js";

export interface CreateDriverParams {
  fullName: string;
  email: string;
  password: string;
  contactNumber: string;
  licenseNumber: string;
  plateNumber: string;
  todaAssociation: string;
}

export interface CreateDriverResult {
  success: boolean;
  error?: string;
  driverName?: string;
  driverId?: string;
  licenseNumber?: string;
}

function withTimeout<T>(promise: PromiseLike<T>, label: string, timeoutMs = 20000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error(`${label} timed out. Check the internet connection and try again.`));
    }, timeoutMs);

    Promise.resolve(promise)
      .then(resolve, reject)
      .finally(() => window.clearTimeout(timer));
  });
}

/**
 * Creates a driver through a Supabase Edge Function.
 * The service role key must stay in the Edge Function, never in React.
 */
export async function createDriverAccount(
  params: CreateDriverParams
): Promise<CreateDriverResult> {
  const { fullName, email, contactNumber, licenseNumber, plateNumber } = params;

  if (!fullName || !email || !contactNumber || !licenseNumber || !plateNumber) {
    return { success: false, error: 'Please fill in all required fields.' };
  }

  const { data, error } = await withTimeout(supabase.functions.invoke("create-driver-account", {
    body: params,
  }), "create driver account", 25000);

  if (error) {
    if (error instanceof FunctionsHttpError) {
      const errorBody = await error.context.json().catch(() => null);
      return {
        success: false,
        error: errorBody?.error ?? errorBody?.message ?? error.message,
      };
    }
    if (error instanceof FunctionsRelayError || error instanceof FunctionsFetchError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: error.message };
  }

  if (data?.success === false) {
    return { success: false, error: data.error ?? "Driver account creation failed." };
  }

  if (data?.driverId) {
    return {
      success: true,
      driverName: data.driverName ?? fullName,
      driverId: data.driverId,
      licenseNumber: data.licenseNumber ?? licenseNumber,
    };
  }

  const { data: profile } = await withTimeout(supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle(), "resolve driver profile");

  const userId = (profile as { id?: string } | null)?.id;
  if (!userId) {
    return { success: true, driverName: fullName };
  }

  const { data: driver } = await withTimeout(supabase
    .from("drivers")
    .select("id, license_number")
    .eq("user_id", userId)
    .maybeSingle(), "resolve driver record");

  return {
    success: true,
    driverName: fullName,
    driverId: (driver as { id?: string } | null)?.id,
    licenseNumber: (driver as { license_number?: string } | null)?.license_number ?? licenseNumber,
  };
}
