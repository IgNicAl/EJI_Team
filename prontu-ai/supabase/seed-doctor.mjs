import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nxyqtsnvkywptynahzdm.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54eXF0c252a3l3cHR5bmFoemRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzUyMzU2MywiZXhwIjoyMDg5MDk5NTYzfQ.Ef4xmwKsOAIB4cScvGj5dJs3k4SN-CEOUxgdy_dtQoU';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DOCTOR_EMAIL = 'rafael.mendes@prontu.ai';
const DOCTOR_PASSWORD = 'Prontu@2026!';

async function seed() {
  console.log('1. Creating auth user...');

  let authUserId;

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: DOCTOR_EMAIL,
    password: DOCTOR_PASSWORD,
    email_confirm: true,
  });

  if (authError) {
    if (authError.message?.includes('already been registered')) {
      console.log('   User already exists, fetching...');
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const existing = users.find(u => u.email === DOCTOR_EMAIL);
      if (!existing) throw new Error('User exists but could not be found');
      authUserId = existing.id;
    } else {
      throw authError;
    }
  } else {
    authUserId = authData.user.id;
  }

  console.log(`   Auth user ID: ${authUserId}`);

  console.log('2. Inserting doctor profile...');

  const { data: doctor, error: doctorError } = await supabase
    .from('doctors')
    .upsert({
      auth_id: authUserId,
      name: 'Dr. Rafael Mendes',
      specialty: 'Clínica Geral',
      crm: 'CRM/SP 123456',
      email: DOCTOR_EMAIL,
      phone: '+55 11 99999-0001',
      avatar: 'RM',
      whatsapp_connected: true,
      role: 'doctor',
    }, { onConflict: 'auth_id' })
    .select()
    .single();

  if (doctorError) throw doctorError;

  console.log(`   Doctor ID: ${doctor.id}`);
  console.log('\n✅ Seed complete!');
  console.log(`\n📋 Credenciais de login:`);
  console.log(`   Email: ${DOCTOR_EMAIL}`);
  console.log(`   Senha: ${DOCTOR_PASSWORD}`);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message || err);
  process.exit(1);
});
