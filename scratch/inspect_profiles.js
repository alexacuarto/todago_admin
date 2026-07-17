import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ylvvjlrrcawnywrwsxzt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsdnZqbHJyY2F3bnl3cndzeHp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NjA3NzcsImV4cCI6MjA5NzUzNjc3N30.cmREd7u7ZR3i_Ro9RWZwVRQfKyygv51rElRfW0XSCpI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectProfiles() {
  console.log("Fetching profiles to check empty names...");
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) {
    console.error("Error:", error);
    return;
  }
  
  console.log(`Total profiles: ${data.length}`);
  if (data.length > 0) {
    console.log("Sample columns:", Object.keys(data[0]));
  }
  
  const incomplete = data.filter(p => {
    const fullName = `${p.first_name || ''} ${p.last_name || ''}`.trim();
    return !p.first_name || !p.last_name || fullName === '';
  });
  
  console.log(`Incomplete profiles (empty first_name or last_name): ${incomplete.length}`);
  incomplete.forEach(p => {
    console.log(`ID: ${p.id}, Role: ${p.role}, First: "${p.first_name}", Last: "${p.last_name}", Phone: "${p.phone_number}", Email: "${p.email}"`);
  });
}

inspectProfiles();
