-- ==========================================================
-- SMART TRIAGE CO-PILOT — SUPABASE SQL SCHEMA
-- Run this in your Supabase Project: SQL Editor -> New Query -> Run
-- ==========================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('doctor', 'nurse', 'compounder', 'admin')),
  license_id TEXT,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PATIENTS & TRIAGE DOSSIERS TABLE
CREATE TABLE IF NOT EXISTS public.patients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age TEXT,
  gender TEXT,
  bp_systolic TEXT,
  bp_diastolic TEXT,
  height TEXT,
  weight TEXT,
  blood_group TEXT,
  temperature TEXT,
  sugar_level TEXT,
  wbc_count TEXT,
  is_pregnant BOOLEAN DEFAULT FALSE,
  gestational_week TEXT,
  fetal_heart_rate TEXT,
  diabetes_type TEXT,
  allergies TEXT,
  current_medications TEXT,
  past_medical_history TEXT,
  surgical_history TEXT,
  family_history TEXT,
  smoking_history TEXT,
  alcohol_history TEXT,
  symptoms JSONB,
  triage_priority TEXT NOT NULL CHECK (triage_priority IN ('RED', 'YELLOW', 'GREEN')),
  urgency_score INT NOT NULL,
  urgency_reason TEXT,
  assigned_doctor TEXT,
  status TEXT NOT NULL DEFAULT 'WAITING' CHECK (status IN ('WAITING', 'IN_REVIEW', 'TREATED', 'REFERRED')),
  doctor_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. STAFF MESSAGES (REAL-TIME CHAT) TABLE
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  sender TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('doctor', 'nurse', 'compounder', 'system')),
  text TEXT NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. HOSPITAL RESOURCES (ICU BEDS & BLOOD BANK) TABLE
CREATE TABLE IF NOT EXISTS public.resources (
  id TEXT PRIMARY KEY DEFAULT 'default',
  icu_beds JSONB NOT NULL DEFAULT '{"total": 6, "occupied": 2, "free": 4}',
  blood_bank JSONB NOT NULL DEFAULT '[{"group": "O-", "units": 2, "status": "critical"}, {"group": "A+", "units": 8, "status": "adequate"}, {"group": "B+", "units": 5, "status": "adequate"}, {"group": "O+", "units": 12, "status": "good"}]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CODE RED EMERGENCY ALERTS TABLE
CREATE TABLE IF NOT EXISTS public.alerts (
  id TEXT PRIMARY KEY,
  patient_id TEXT,
  patient_name TEXT NOT NULL,
  category TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime replication for patients and messages tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.patients;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.resources;

-- Enable Row Level Security (RLS) & Allow Read/Write for Authenticated/Anon API Clients
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to patients" ON public.patients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to messages" ON public.messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to resources" ON public.resources FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to alerts" ON public.alerts FOR ALL USING (true) WITH CHECK (true);
