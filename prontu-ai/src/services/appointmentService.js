// ============================================
// Appointment Service — Supabase CRUD + n8n webhooks
// ============================================

import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { syncAppointment as triggerAppointmentWebhook } from './n8nService.js';

/**
 * Fetch appointments, optionally filtered by date range.
 *
 * @param {{ date?: string, from?: string, to?: string }} filters
 * @returns {Promise<object[]>}
 */
export async function getAppointments(filters = {}) {
  if (!isSupabaseConfigured()) return [];

  let query = supabase
    .from('appointments')
    .select('*')
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  if (filters.date) {
    query = query.eq('date', filters.date);
  } else if (filters.from && filters.to) {
    query = query.gte('date', filters.from).lte('date', filters.to);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data.map(mapAppointmentFromDb);
}

/**
 * Create a new appointment in Supabase and notify n8n.
 *
 * @param {object} appointmentData
 * @param {string} doctorId
 * @returns {Promise<object>}
 */
export async function createAppointment(appointmentData, doctorId) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const row = {
    doctor_id: doctorId,
    patient_id: appointmentData.patientId || null,
    patient_name: appointmentData.patientName || '',
    date: appointmentData.date,
    time: appointmentData.time,
    duration: appointmentData.duration || 30,
    type: appointmentData.type || 'Consulta',
    status: appointmentData.status || 'pending',
    via: appointmentData.via || 'presencial',
  };

  const { data, error } = await supabase
    .from('appointments')
    .insert(row)
    .select()
    .single();

  if (error) throw error;

  // Fire-and-forget: notify n8n
  triggerAppointmentWebhook(appointmentData, 'create').catch(err => {
    console.warn('[AppointmentService] n8n webhook failed (non-blocking):', err.message);
  });

  return mapAppointmentFromDb(data);
}

/**
 * Update an existing appointment.
 *
 * @param {string} id
 * @param {object} updates
 * @returns {Promise<object>}
 */
export async function updateAppointment(id, updates) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Fire-and-forget: notify n8n
  triggerAppointmentWebhook({ ...updates, id }, 'update').catch(err => {
    console.warn('[AppointmentService] n8n webhook failed (non-blocking):', err.message);
  });

  return mapAppointmentFromDb(data);
}

/**
 * Get count of appointments for today.
 *
 * @returns {Promise<number>}
 */
export async function getTodayAppointmentCount() {
  if (!isSupabaseConfigured()) return 0;

  const today = new Date().toISOString().split('T')[0];
  const { count, error } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('date', today);

  if (error) return 0;
  return count || 0;
}

// ── Mapper ──────────────────────────────────

function mapAppointmentFromDb(row) {
  if (!row) return null;

  const name = row.patient_name || 'Sem paciente';
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');

  const colorPool = ['#0EA5E9', '#10B981', '#F59E0B', '#EC4899', '#14B8A6', '#8B5CF6'];
  const colorIndex = name.length % colorPool.length;

  return {
    id: row.id,
    patientId: row.patient_id,
    patientName: name,
    avatar: initials,
    avatarColor: colorPool[colorIndex],
    date: row.date,
    time: typeof row.time === 'string' ? row.time.slice(0, 5) : row.time,
    duration: row.duration || 30,
    type: row.type || 'Consulta',
    status: row.status || 'pending',
    via: row.via || 'presencial',
  };
}
