import { supabase } from "./supabase";
import { FunctionsHttpError, FunctionsRelayError, FunctionsFetchError } from "@supabase/supabase-js";

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
 * Creates a driver through a Supabase Edge Function.
 * The service role key must stay in the Edge Function, never in React.
 */
export async function createDriverAccount(
  params: CreateDriverParams
): Promise<CreateDriverResult> {
  const { fullName, email, contactNumber, plateNumber } = params;

  if (!fullName || !email || !contactNumber || !plateNumber) {
    return { success: false, error: 'Please fill in all required fields.' };
  }

  const { data, error } = await supabase.functions.invoke("create-driver-account", {
    body: params,
  });

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

  return { success: true, driverName: fullName };
}
