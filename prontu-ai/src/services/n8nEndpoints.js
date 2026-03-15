// ============================================
// n8n Webhook Endpoints Configuration
// ============================================
// Add your n8n webhook URLs here.
// Each key maps to a specific event/action in the application.
//
// For test webhooks use:  /webhook-test/...
// For production use:     /webhook/...

const N8N_BASE_URL = import.meta.env.VITE_N8N_BASE_URL || 'https://n8n-n8n.vk6aah.easypanel.host';

const endpoints = {
  // ── Patient ───────────────────────────────────────
  patientRegistration: `${N8N_BASE_URL}/webhook-test/91d00691-018a-4238-8006-ece0b53bd8ca`,
  patientStatusUpdate: `${N8N_BASE_URL}/webhook-test/91d00691-018a-4238-8006-ece0b53bd8ca`,

  // ── Appointments ──────────────────────────────────
  appointmentCreate:   `${N8N_BASE_URL}/webhook-test/91d00691-018a-4238-8006-ece0b53bd8ca`,
  appointmentUpdate:   `${N8N_BASE_URL}/webhook-test/91d00691-018a-4238-8006-ece0b53bd8ca`,
  appointmentCancel:   `${N8N_BASE_URL}/webhook-test/91d00691-018a-4238-8006-ece0b53bd8ca`,

  // ── Consultations / Medical Records ───────────────
  consultationCreated: `${N8N_BASE_URL}/webhook-test/91d00691-018a-4238-8006-ece0b53bd8ca`,

  // ── WhatsApp ──────────────────────────────────────
  whatsappAudioProcessed: `${N8N_BASE_URL}/webhook-test/91d00691-018a-4238-8006-ece0b53bd8ca`,

  // ── Add more endpoints below as needed ────────────
  // exampleGet:   `${N8N_BASE_URL}/webhook-test/your-uuid-here`,
  // examplePost:  `${N8N_BASE_URL}/webhook-test/your-uuid-here`,
};

export { N8N_BASE_URL };
export default endpoints;
