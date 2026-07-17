import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ylvvjlrrcawnywrwsxzt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsdnZqbHJyY2F3bnl3cndzeHp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NjA3NzcsImV4cCI6MjA5NzUzNjc3N30.cmREd7u7ZR3i_Ro9RWZwVRQfKyygv51rElRfW0XSCpI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testQueries() {
  console.log("Fetching OpenAPI schema...");
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseAnonKey
      }
    });
    const schema = await res.json();
    console.log("Schema definitions keys:", Object.keys(schema.definitions || {}));
  } catch (e) {
    console.error("Error fetching schema:", e);
  }
}

testQueries();
