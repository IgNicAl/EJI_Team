// ============================================
// Patient Service — Supabase CRUD + n8n webhooks
// ============================================

import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { registerPatient as triggerPatientWebhook } from './n8nService.js';
import { updatePatientStatus as triggerStatusWebhook } from './n8nService.js';

/**
 * Fetch patients list with optional filters.
 *
 * @param {{ search?: string, status?: string, whatsappSynced?: boolean }} filters
 * @returns {Promise<object[]>}
 */
export async function getPatients(filters = {}) {
  if (!isSupabaseConfigured()) return [];

  let query = supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.status && filters.status !== 'all') {
    if (filters.status === 'whatsapp') {
      query = query.eq('whatsapp_synced', true);
    } else {
      query = query.eq('status', filters.status);
    }
  }

  if (filters.search) {
    const term = `%${filters.search}%`;
    query = query.or(`name.ilike.${term},cpf.ilike.${term},phone.ilike.${term}`);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data.map(mapPatientFromDb);
}

/**
 * Fetch a single patient by ID with their consultations.
 *
 * @param {string} id — patient UUID
 * @returns {Promise<{ patient: object, consultations: object[] } | null>}
 */
export async function getPatientById(id) {
  if (!isSupabaseConfigured()) return null;

  const { data: patient, error: pErr } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single();

  if (pErr) throw pErr;

  const { data: consultations, error: cErr } = await supabase
    .from('consultations')
    .select('*')
    .eq('patient_id', id)
    .order('date', { ascending: false });

  if (cErr) throw cErr;

  return {
    patient: mapPatientFromDb(patient),
    consultations: consultations.map(mapConsultationFromDb),
  };
}

/**
 * Create a new patient in Supabase, then trigger n8n webhook.
 *
 * @param {object} formData — raw form values
 * @param {string} doctorId — current doctor's UUID
 * @returns {Promise<object>} — created patient
 */
export async function createPatient(formData, doctorId) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const row = {
    doctor_id: doctorId,
    name: formData.name,
    cpf: formData.cpf || null,
    dob: formData.dob || null,
    gender: formData.gender || null,
    phone: formData.phone || '',
    email: formData.email || '',
    blood_type: formData.bloodType || '',
    allergies: formData.allergies
      ? formData.allergies.split(',').map(a => a.trim()).filter(Boolean)
      : [],
    chronic_conditions: formData.chronic
      ? formData.chronic.split(',').map(c => c.trim()).filter(Boolean)
      : [],
    notes: formData.notes || '',
    status: 'active',
    whatsapp_synced: false,
  };

  const { data, error } = await supabase
    .from('patients')
    .insert(row)
    .select()
    .single();

  if (error) throw error;

  // Fire-and-forget: notify n8n about the new patient
  triggerPatientWebhook(formData).catch(err => {
    console.warn('[PatientService] n8n webhook failed (non-blocking):', err.message);
  });

  return mapPatientFromDb(data);
}

/**
 * Update a patient's data.
 *
 * @param {string} id
 * @param {object} updates
 * @returns {Promise<object>}
 */
export async function updatePatient(id, updates) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('patients')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapPatientFromDb(data);
}

/**
 * Toggle patient status (active/inactive) and notify n8n.
 *
 * @param {string} id
 * @param {string} patientName
 * @param {'active' | 'inactive'} newStatus
 * @returns {Promise<object>}
 */
export async function changePatientStatus(id, patientName, newStatus) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('patients')
    .update({ status: newStatus })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Fire-and-forget: notify n8n
  triggerStatusWebhook(id, patientName, newStatus).catch(err => {
    console.warn('[PatientService] n8n status webhook failed (non-blocking):', err.message);
  });

  return mapPatientFromDb(data);
}

/**
 * Get count of patients grouped by status for stats.
 *
 * @returns {Promise<{ total: number, active: number, whatsapp: number, totalConsults: number }>}
 */
export async function getPatientStats() {
  if (!isSupabaseConfigured()) {
    return { total: 0, active: 0, whatsapp: 0, totalConsults: 0 };
  }

  const { count: total } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true });

  const { count: active } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const { count: whatsapp } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })
    .eq('whatsapp_synced', true);

  const { count: totalConsults } = await supabase
    .from('consultations')
    .select('*', { count: 'exact', head: true });

  return {
    total: total || 0,
    active: active || 0,
    whatsapp: whatsapp || 0,
    totalConsults: totalConsults || 0,
  };
}

// ── Mappers ─────────────────────────────────

function mapPatientFromDb(row) {
  if (!row) return null;

  const initials = row.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');

  const colorPool = ['#0EA5E9', '#10B981', '#F59E0B', '#EC4899', '#14B8A6', '#8B5CF6'];
  const colorIndex = row.name.length % colorPool.length;

  return {
    id: row.id,
    name: row.name,
    cpf: row.cpf || '',
    dob: row.dob || '',
    age: row.dob ? calculateAge(row.dob) : 0,
    gender: row.gender || '',
    email: row.email || '',
    phone: row.phone || '',
    bloodType: row.blood_type || '',
    allergies: row.allergies || [],
    chronic: row.chronic_conditions || [],
    status: row.status || 'active',
    whatsappSynced: row.whatsapp_synced || false,
    lastVisit: row.last_visit || row.updated_at || '',
    totalConsults: 0,
    avatar: initials,
    avatarColor: colorPool[colorIndex],
    notes: row.notes || '',
  };
}

function mapConsultationFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    date: row.date,
    type: row.type || 'Consulta',
    via: row.via || 'web',
    transcript: row.transcript || '',
    aiGenerated: row.ai_generated || false,
    aiSummary: row.ai_summary || '',
    diagnosis: row.diagnosis || '',
    cid: row.cid || [],
    medications: row.medications || [],
    exams: row.exams || [],
    nextVisit: row.next_visit || null,
  };
}

function calculateAge(dob) {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}
