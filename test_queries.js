import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ylvvjlrrcawnywrwsxzt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsdnZqbHJyY2F3bnl3cndzeHp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NjA3NzcsImV4cCI6MjA5NzUzNjc3N30.cmREd7u7ZR3i_Ro9RWZwVRQfKyygv51rElRfW0XSCpI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testQueries() {
  console.log("Testing profiles...");
  const { error: e1 } = await supabase.from('profiles').select('*').limit(1);
  console.log("Profiles error:", e1?.message || "Success");

  console.log("Testing drivers...");
  const { error: e2 } = await supabase.from('drivers').select('*').limit(1);
  console.log("Drivers error:", e2?.message || "Success");

  console.log("Testing bookings...");
  const { error: e3 } = await supabase.from('bookings').select('*').limit(1);
  console.log("Bookings error:", e3?.message || "Success");

  console.log("Testing passengers...");
  const { error: e4 } = await supabase.from('passengers').select('*').limit(1);
  console.log("Passengers error:", e4?.message || "Success");
}

testQueries();
