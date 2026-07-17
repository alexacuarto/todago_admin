import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ylvvjlrrcawnywrwsxzt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsdnZqbHJyY2F3bnl3cndzeHp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NjA3NzcsImV4cCI6MjA5NzUzNjc3N30.cmREd7u7ZR3i_Ro9RWZwVRQfKyygv51rElRfW0XSCpI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspect() {
  try {
    // We can select one row or just check if querying columns fails
    const { data: pData, error: pError } = await supabase
      .from('passengers')
      .select('cancel_count, last_cancel_date, booking_restriction_until, warning_status')
      .limit(1);
    
    console.log('passengers check:', pData ? 'Success' : 'Failed', pError);

    const { data: profData, error: profError } = await supabase
      .from('profiles')
      .select('cancel_count, last_cancel_date, booking_restriction_until, warning_status')
      .limit(1);
    
    console.log('profiles check:', profData ? 'Success' : 'Failed', profError);
  } catch (e) {
    console.error('Exception:', e);
  }
}

inspect();
