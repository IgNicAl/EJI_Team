// ============================================
// Dashboard Service — Aggregated stats from Supabase
// ============================================

import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

/**
 * Fetch dashboard statistics.
 *
 * @returns {Promise<object>}
 */
export async function getDashboardStats() {
  if (!isSupabaseConfigured()) return null;

  const today = new Date().toISOString().split('T')[0];

  const [patientsRes, newMonthRes, apptTodayRes, waRes, aiRes] = await Promise.all([
    supabase.from('patients').select('*', { count: 'exact', head: true }),
    supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('date', today),
    supabase
      .from('whatsapp_messages')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('consultations')
      .select('*', { count: 'exact', head: true })
      .eq('ai_generated', true),
  ]);

  return {
    totalPatients: patientsRes.count || 0,
    newThisMonth: newMonthRes.count || 0,
    consultationsToday: apptTodayRes.count || 0,
    whatsappMessages: waRes.count || 0,
    aiGenerated: aiRes.count || 0,
    pendingRecords: 0,
  };
}

/**
 * Fetch weekly consultation data for the chart.
 *
 * @returns {Promise<object[]>}
 */
export async function getWeeklyData() {
  if (!isSupabaseConfigured()) return [];

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const today = new Date();
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push({
      date: d.toISOString().split('T')[0],
      label: dayNames[d.getDay()],
    });
  }

  const { data, error } = await supabase
    .from('appointments')
    .select('date')
    .gte('date', days[0].date)
    .lte('date', days[days.length - 1].date);

  if (error) return days.map(d => ({ day: d.label, consultas: 0 }));

  const countByDate = {};
  (data || []).forEach(row => {
    countByDate[row.date] = (countByDate[row.date] || 0) + 1;
  });

  return days.map(d => ({
    day: d.label,
    consultas: countByDate[d.date] || 0,
  }));
}

/**
 * Fetch the most recently updated patients.
 *
 * @param {number} limit
 * @returns {Promise<object[]>}
 */
export async function getRecentPatients(limit = 4) {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) return [];

  const colorPool = ['#0EA5E9', '#10B981', '#F59E0B', '#EC4899', '#14B8A6', '#8B5CF6'];

  return (data || []).map(row => {
    const initials = row.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(w => w[0].toUpperCase())
      .join('');

    return {
      id: row.id,
      name: row.name,
      age: row.dob ? calculateAge(row.dob) : 0,
      chronic: row.chronic_conditions || [],
      lastVisit: row.last_visit || row.updated_at || '',
      whatsappSynced: row.whatsapp_synced || false,
      avatar: initials,
      avatarColor: colorPool[row.name.length % colorPool.length],
    };
  });
}

/**
 * Fetch today's appointments for the dashboard.
 *
 * @returns {Promise<object[]>}
 */
export async function getTodayAppointments() {
  if (!isSupabaseConfigured()) return [];

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('date', today)
    .order('time', { ascending: true });

  if (error) return [];

  const colorPool = ['#0EA5E9', '#10B981', '#F59E0B', '#EC4899', '#14B8A6', '#8B5CF6'];

  return (data || []).map(row => {
    const name = row.patient_name || 'Sem paciente';
    const initials = name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(w => w[0].toUpperCase())
      .join('');

    return {
      id: row.id,
      patientName: name,
      avatar: initials,
      avatarColor: colorPool[name.length % colorPool.length],
      time: typeof row.time === 'string' ? row.time.slice(0, 5) : row.time,
      type: row.type || 'Consulta',
      duration: row.duration || 30,
      status: row.status || 'pending',
    };
  });
}

/**
 * Fetch recent WhatsApp messages for the dashboard.
 *
 * @param {number} limit
 * @returns {Promise<object[]>}
 */
export async function getRecentMessages(limit = 3) {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('whatsapp_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return [];

  return (data || []).map(row => ({
    id: row.id,
    from: row.sender,
    patientName: row.patient_name || 'Sistema',
    type: row.msg_type,
    content: row.content,
    time: row.created_at
      ? new Date(row.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      : '',
    read: row.read,
  }));
}

function calculateAge(dob) {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}
