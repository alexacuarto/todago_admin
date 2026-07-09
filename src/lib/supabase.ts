import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ??
  "https://dqvkilelqnvagcqotmmz.supabase.co";

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxdmtpbGVscW52YWdjcW90bW16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NTE3MjMsImV4cCI6MjA5ODIyNzcyM30.JmfaoJWeXk0vWqSsCPIU_FFGWKp5CNo8fG7_GhXH694";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
