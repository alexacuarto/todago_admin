import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ylvvjlrrcawnywrwsxzt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsdnZqbHJyY2F3bnl3cndzeHp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NjA3NzcsImV4cCI6MjA5NzUzNjc3N30.cmREd7u7ZR3i_Ro9RWZwVRQfKyygv51rElRfW0XSCpI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('cancellation_reason, cancelled_by, cancelled_at')
      .limit(1);
    console.log("standard cancellation columns:", data, error);

    const { data: data2, error: error2 } = await supabase
      .from('bookings')
      .select('cancel_reason')
      .limit(1);
    console.log("cancel_reason column check:", data2, error2);
  } catch (e) {
    console.error("Error:", e);
  }
}

run();
