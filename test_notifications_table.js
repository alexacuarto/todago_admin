import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ylvvjlrrcawnywrwsxzt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsdnZqbHJyY2F3bnl3cndzeHp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NjA3NzcsImV4cCI6MjA5NzUzNjc3N30.cmREd7u7ZR3i_Ro9RWZwVRQfKyygv51rElRfW0XSCpI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  try {
    const { data: cols, error: err } = await supabase
      .rpc('get_table_columns_for_notifications');
    
    if (err) {
      // If RPC doesn't exist, we can try running a custom query through standard postgrest if possible,
      // or we can select a non-existent column to see if it throws an error listing columns.
      console.log("RPC error, attempting fallback select for non-existent column:", err);
      const { data: cols2, error: err2 } = await supabase
        .from('notifications')
        .select('notification_type')
        .limit(1);
      console.log("Check if notification_type exists:", cols2, err2);
    } else {
      console.log("Columns:", cols);
    }
  } catch (e) {
    console.error("Error running query:", e);
  }
}

run();
