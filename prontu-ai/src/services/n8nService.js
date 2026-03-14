// ============================================
// n8n Integration Service
// Webhook triggers for patient, appointment, and status sync
// ============================================

import { sendWebhook, WebhookError } from './webhookClient.js';
import endpoints from './n8nEndpoints.js';

/**
 * Build a consistent envelope for all n8n webhook payloads.
 */
function buildPayload(event, data) {
  return {
    event,
    timestamp: new Date().toISOString(),
    source: 'prontu-ai',
    data,
  };
}

/**
 * Register a new patient via n8n webhook.
 *
 * @param {object} formData - Raw form data from NewPatient
 * @returns {Promise<{ success: boolean, data?: any, retries: number }>}
 */
export async function registerPatient(formData) {
  const payload = buildPayload('patient.created', {
    name: formData.name,
    cpf: formData.cpf || null,
    dateOfBirth: formData.dob,
    gender: formData.gender,
    phone: formData.phone,
    email: formData.email || null,
    bloodType: formData.bloodType || null,
    allergies: formData.allergies
      ? formData.allergies.split(',').map(a => a.trim()).filter(Boolean)
      : [],
    chronicConditions: formData.chronic
      ? formData.chronic.split(',').map(c => c.trim()).filter(Boolean)
      : [],
    notes: formData.notes || null,
  });

  return sendWebhook(endpoints.patientRegistration, payload);
}

/**
 * Sync an appointment action (create, update, cancel) via n8n webhook.
 *
 * @param {object} appointmentData - Appointment details
 * @param {'create' | 'update' | 'cancel'} action
 * @returns {Promise<{ success: boolean, data?: any, retries: number }>}
 */
export async function syncAppointment(appointmentData, action = 'create') {
  const payload = buildPayload(`appointment.${action}`, {
    id: appointmentData.id || null,
    patientId: appointmentData.patientId,
    patientName: appointmentData.patientName,
    date: appointmentData.date,
    time: appointmentData.time,
    duration: appointmentData.duration,
    type: appointmentData.type,
    status: appointmentData.status,
    via: appointmentData.via,
  });

  return sendWebhook(endpoints.appointmentCreate, payload);
}

/**
 * Notify n8n when a patient's status changes (active ↔ inactive).
 *
 * @param {string} patientId
 * @param {string} patientName
 * @param {'active' | 'inactive'} newStatus
 * @returns {Promise<{ success: boolean, data?: any, retries: number }>}
 */
export async function updatePatientStatus(patientId, patientName, newStatus) {
  const payload = buildPayload('patient.status_changed', {
    patientId,
    patientName,
    status: newStatus,
    changedAt: new Date().toISOString(),
  });

  return sendWebhook(endpoints.patientStatusUpdate, payload);
}

export { WebhookError };
