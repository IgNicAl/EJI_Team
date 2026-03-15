-- ============================================
-- Prontu.ai — Supabase Schema + RLS
-- ============================================
-- Run this in your Supabase SQL Editor.
-- Prerequisites: Supabase project with Auth enabled.

-- ── Extensions ──────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. DOCTORS
-- ============================================
CREATE TABLE IF NOT EXISTS doctors (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id    UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  specialty  TEXT NOT NULL DEFAULT '',
  crm        TEXT NOT NULL DEFAULT '',
  email      TEXT UNIQUE NOT NULL,
  phone      TEXT UNIQUE DEFAULT NULL,
  avatar     TEXT DEFAULT '',
  whatsapp_connected BOOLEAN DEFAULT FALSE,
  role       TEXT NOT NULL DEFAULT 'doctor' CHECK (role IN ('doctor', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. PATIENTS
-- ============================================
CREATE TABLE IF NOT EXISTS patients (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id         UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  cpf               TEXT UNIQUE,
  dob               DATE,
  gender            TEXT CHECK (gender IN ('M', 'F', 'Other')),
  email             TEXT DEFAULT '',
  phone             TEXT DEFAULT '',
  blood_type        TEXT DEFAULT '',
  allergies         TEXT[] DEFAULT '{}',
  chronic_conditions TEXT[] DEFAULT '{}',
  status            TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  whatsapp_synced   BOOLEAN DEFAULT FALSE,
  last_visit        TIMESTAMPTZ,
  notes             TEXT DEFAULT '',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patients_doctor  ON patients(doctor_id);
CREATE INDEX IF NOT EXISTS idx_patients_status  ON patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_name    ON patients USING GIN (to_tsvector('portuguese', name));

-- ============================================
-- 3. CONSULTATIONS (Prontuários)
-- ============================================
CREATE TABLE IF NOT EXISTS consultations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id    UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id     UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  date          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type          TEXT DEFAULT 'Consulta',
  via           TEXT DEFAULT 'web' CHECK (via IN ('web', 'whatsapp', 'presencial')),
  transcript    TEXT DEFAULT '',
  ai_summary    TEXT DEFAULT '',
  ai_generated  BOOLEAN DEFAULT FALSE,
  diagnosis     TEXT DEFAULT '',
  cid           TEXT[] DEFAULT '{}',
  medications   TEXT[] DEFAULT '{}',
  exams         TEXT[] DEFAULT '{}',
  next_visit    DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consult_patient ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consult_doctor  ON consultations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consult_date    ON consultations(date DESC);

-- ============================================
-- 4. APPOINTMENTS (Agenda)
-- ============================================
CREATE TABLE IF NOT EXISTS appointments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id  UUID REFERENCES patients(id) ON DELETE SET NULL,
  doctor_id   UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_name TEXT DEFAULT '',
  date        DATE NOT NULL,
  time        TIME NOT NULL,
  duration    INTEGER DEFAULT 30,
  type        TEXT DEFAULT 'Consulta',
  status      TEXT DEFAULT 'pending' CHECK (status IN ('confirmed', 'pending', 'cancelled')),
  via         TEXT DEFAULT 'presencial' CHECK (via IN ('presencial', 'telehealth')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appt_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appt_date   ON appointments(date);

-- ============================================
-- 5. WHATSAPP MESSAGES
-- ============================================
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id   UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id  UUID REFERENCES patients(id) ON DELETE SET NULL,
  patient_name TEXT DEFAULT '',
  chat_id     TEXT DEFAULT '',
  sender      TEXT DEFAULT 'patient' CHECK (sender IN ('patient', 'doctor', 'bot', 'system')),
  content     TEXT DEFAULT '',
  msg_type    TEXT DEFAULT 'text' CHECK (msg_type IN ('text', 'audio', 'image')),
  read        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wa_doctor ON whatsapp_messages(doctor_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE doctors            ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients           ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages  ENABLE ROW LEVEL SECURITY;

-- ── Helper function: get current doctor id ──
CREATE OR REPLACE FUNCTION get_current_doctor_id()
RETURNS UUID AS $$
  SELECT id FROM doctors WHERE auth_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ── DOCTORS ─────────────────────────────────
CREATE POLICY "Doctors can read own profile"
  ON doctors FOR SELECT
  USING (auth_id = auth.uid());

CREATE POLICY "Doctors can update own profile"
  ON doctors FOR UPDATE
  USING (auth_id = auth.uid());

-- ── PATIENTS ────────────────────────────────
CREATE POLICY "Doctors can view own patients"
  ON patients FOR SELECT
  USING (doctor_id = get_current_doctor_id());

CREATE POLICY "Doctors can insert own patients"
  ON patients FOR INSERT
  WITH CHECK (doctor_id = get_current_doctor_id());

CREATE POLICY "Doctors can update own patients"
  ON patients FOR UPDATE
  USING (doctor_id = get_current_doctor_id());

CREATE POLICY "Doctors can delete own patients"
  ON patients FOR DELETE
  USING (doctor_id = get_current_doctor_id());

-- ── CONSULTATIONS ───────────────────────────
CREATE POLICY "Doctors can view own consultations"
  ON consultations FOR SELECT
  USING (doctor_id = get_current_doctor_id());

CREATE POLICY "Doctors can insert own consultations"
  ON consultations FOR INSERT
  WITH CHECK (doctor_id = get_current_doctor_id());

CREATE POLICY "Doctors can update own consultations"
  ON consultations FOR UPDATE
  USING (doctor_id = get_current_doctor_id());

-- ── APPOINTMENTS ────────────────────────────
CREATE POLICY "Doctors can view own appointments"
  ON appointments FOR SELECT
  USING (doctor_id = get_current_doctor_id());

CREATE POLICY "Doctors can insert own appointments"
  ON appointments FOR INSERT
  WITH CHECK (doctor_id = get_current_doctor_id());

CREATE POLICY "Doctors can update own appointments"
  ON appointments FOR UPDATE
  USING (doctor_id = get_current_doctor_id());

CREATE POLICY "Doctors can delete own appointments"
  ON appointments FOR DELETE
  USING (doctor_id = get_current_doctor_id());

-- ── WHATSAPP MESSAGES ───────────────────────
CREATE POLICY "Doctors can view own messages"
  ON whatsapp_messages FOR SELECT
  USING (doctor_id = get_current_doctor_id());

CREATE POLICY "Doctors can insert own messages"
  ON whatsapp_messages FOR INSERT
  WITH CHECK (doctor_id = get_current_doctor_id());

-- ============================================
-- UPDATED_AT trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_doctors_updated     BEFORE UPDATE ON doctors       FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_patients_updated    BEFORE UPDATE ON patients      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_appointments_updated BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
