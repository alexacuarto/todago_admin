import { supabase } from "./supabase";

export interface AdminProfile {
  id: string;
  full_name: string;
  email: string | null;
  role: "admin";
  is_active: boolean;
  is_primary_admin: boolean;
}

export async function getCurrentAdminProfile(): Promise<AdminProfile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, is_active, is_primary_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data || data.role !== "admin" || data.is_active !== true) {
    await supabase.auth.signOut();
    return null;
  }

  return data as AdminProfile;
}

export async function loginAdmin(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  const profile = await getCurrentAdminProfile();
  if (!profile) {
    throw new Error("Only active administrator accounts can access the Admin Dashboard.");
  }

  return profile;
}

export async function logoutAdmin() {
  await supabase.auth.signOut();
}
