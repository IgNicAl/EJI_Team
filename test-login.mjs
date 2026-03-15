import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nxyqtsnvkywptynahzdm.supabase.co';
const ANON_KEY = 'sb_publishable_mEj06y-B8HeBxI4xvVcn8w_NCKlssYJ';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54eXF0c252a3l3cHR5bmFoemRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzUyMzU2MywiZXhwIjoyMDg5MDk5NTYzfQ.Ef4xmwKsOAIB4cScvGj5dJs3k4SN-CEOUxgdy_dtQoU';

const DOCTOR_EMAIL = 'rafael.mendes@prontu.ai';
const DOCTOR_PASSWORD = 'Prontu@2026!';

// Test 1: Try login with anon key
console.log('=== Test 1: Login with anon key ===');
try {
  const supabaseAnon = createClient(SUPABASE_URL, ANON_KEY);
  const { data, error } = await supabaseAnon.auth.signInWithPassword({
    email: DOCTOR_EMAIL,
    password: DOCTOR_PASSWORD,
  });
  if (error) {
    console.error('Anon key login error:', error.message);
    console.error('Error status:', error.status);
  } else {
    console.log('Anon key login SUCCESS:', data.user?.email);
  }
} catch (err) {
  console.error('Anon key exception:', err.message);
}

// Test 2: Check if user exists using service role key
console.log('\n=== Test 2: Check user exists (service role) ===');
try {
  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    console.error('List users error:', error.message);
  } else {
    const found = users.find(u => u.email === DOCTOR_EMAIL);
    if (found) {
      console.log('User found! ID:', found.id, 'Email confirmed:', found.email_confirmed_at ? 'YES' : 'NO');
    } else {
      console.log('User NOT FOUND in auth.users');
      console.log('Available users:', users.map(u => u.email));
    }
  }
} catch (err) {
  console.error('Service role exception:', err.message);
}

// Test 3: Check doctors table
console.log('\n=== Test 3: Check doctors table ===');
try {
  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await supabaseAdmin.from('doctors').select('*');
  if (error) {
    console.error('Doctors table error:', error.message);
  } else {
    console.log('Doctors in table:', data.length);
    data.forEach(d => console.log(' -', d.email, '| auth_id:', d.auth_id));
  }
} catch (err) {
  console.error('Doctors table exception:', err.message);
}
