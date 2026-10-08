import fs from "fs";
import path from "path";
import crypto from "crypto";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase";

export interface UserAccount {
  id: string;
  email: string;
  fullName: string;
  role: "doctor" | "nurse" | "compounder" | "admin";
  licenseId?: string;
  passwordHash: string;
  status?: string;
  createdAt: string;
}

export type UserRecord = UserAccount;

export interface PatientRecord {
  id: string;
  name: string;
  age: string;
  gender: string;
  bpSystolic: string;
  bpDiastolic: string;
  height: string;
  weight: string;
  bloodGroup: string;
  temperature: string;
  sugarLevel: string;
  bloodGlucose?: string;
  wbcCount: string;
  isPregnant?: boolean;
  gestationalWeek?: string;
  gestationalWeeks?: string;
  fetalHeartRate?: string;
  diabetesType?: string;
  allergies?: string;
  currentMedications?: string;
  pastMedicalHistory?: string;
  surgicalHistory?: string;
  pastSurgical?: string;
  familyHistory?: string;
  smokingHistory?: string;
  alcoholHistory?: string;
  symptoms?: string[];
  triagePriority: "RED" | "YELLOW" | "GREEN";
  urgencyScore: number;
  urgencyReason?: string;
  assignedDoctor?: string;
  status: "WAITING" | "IN_REVIEW" | "TREATED" | "REFERRED";
  doctorNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StaffMessage {
  id: string;
  sender: string;
  role: "doctor" | "nurse" | "compounder" | "system";
  text: string;
  time: string;
}

export interface ResourceData {
  icuBeds: { total: number; occupied: number; free: number };
  bloodBank: Array<{ group: string; units: number; status: "critical" | "adequate" | "good" }>;
}

export interface AlertRecord {
  id: string;
  patientId?: string;
  patientName: string;
  category: string;
  notes?: string;
  timestamp: string;
  status: "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";
}

const DATA_DIR = path.join(process.cwd(), "data");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJson<T>(filename: string, defaultVal: T): T {
  ensureDir();
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultVal, null, 2), "utf-8");
    return defaultVal;
  }
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return defaultVal;
  }
}

function writeJson<T>(filename: string, data: T): void {
  ensureDir();
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "_smart_triage_salt").digest("hex");
}

// ── USERS ──────────────────────────────────────────────────────────
export async function getAllUsers(): Promise<UserAccount[]> {
  const localUsers = readJson<UserAccount[]>("users.json", []);
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase.from("users").select("*");
      if (!error && Array.isArray(data)) {
        const supabaseUsers: UserAccount[] = data.map((u: any) => ({
          id: u.id,
          email: u.email,
          fullName: u.full_name,
          role: u.role,
          licenseId: u.license_id,
          passwordHash: u.password_hash,
          createdAt: u.created_at,
        }));

        // Merge: If any local user exists that is not yet in Supabase, add and upsert to Supabase
        const supabaseEmails = new Set(supabaseUsers.map((u) => u.email.toLowerCase()));
        for (const lu of localUsers) {
          if (!supabaseEmails.has(lu.email.toLowerCase())) {
            supabaseUsers.push(lu);
            try {
              await supabase.from("users").upsert({
                id: lu.id,
                email: lu.email,
                full_name: lu.fullName,
                role: lu.role,
                license_id: lu.licenseId,
                password_hash: lu.passwordHash,
                created_at: lu.createdAt,
              });
            } catch {}
          }
        }
        return supabaseUsers;
      }
    } catch (e) {
      console.warn("Supabase fetch error, fallback to local:", e);
    }
  }
  return localUsers;
}

export async function findUserByEmail(email: string): Promise<UserAccount | null> {
  const cleanEmail = email.toLowerCase().trim();
  const users = await getAllUsers();
  return users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
}

export async function findUserById(id: string): Promise<UserAccount | null> {
  const users = await getAllUsers();
  return users.find((u) => u.id === id) || null;
}

export async function createUser(data: Omit<UserAccount, "id" | "createdAt" | "passwordHash"> & { password: string }): Promise<UserAccount> {
  const newUser: UserAccount = {
    id: "USR-" + data.role.substring(0, 3).toUpperCase() + "-" + Math.floor(1000 + Math.random() * 9000),
    email: data.email.toLowerCase().trim(),
    fullName: data.fullName.trim(),
    role: data.role,
    licenseId: data.licenseId?.trim(),
    passwordHash: hashPassword(data.password),
    createdAt: new Date().toISOString(),
  };

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("users").insert({
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.fullName,
        role: newUser.role,
        license_id: newUser.licenseId,
        password_hash: newUser.passwordHash,
        created_at: newUser.createdAt,
      });
    } catch (e) {
      console.warn("Supabase user insert fallback:", e);
    }
  }

  const users = readJson<UserAccount[]>("users.json", []);
  users.push(newUser);
  writeJson("users.json", users);
  return newUser;
}

export async function validateUserCredentials(email: string, password: string, role?: string): Promise<UserAccount | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  if (user.passwordHash !== hashPassword(password)) return null;
  if (role && user.role !== role) return null;
  return user;
}

export async function updateUserPassword(email: string, newPassword: string): Promise<boolean> {
  const cleanEmail = email.toLowerCase().trim();
  const newHash = hashPassword(newPassword);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase
        .from("users")
        .update({ password_hash: newHash })
        .eq("email", cleanEmail);
    } catch (e) {
      console.warn("Supabase password update fallback:", e);
    }
  }

  const users = readJson<UserAccount[]>("users.json", []);
  const idx = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);
  if (idx !== -1) {
    users[idx].passwordHash = newHash;
    writeJson("users.json", users);
    return true;
  }
  return false;
}

// ── PATIENTS ────────────────────────────────────────────────────────
export async function getAllPatients(): Promise<PatientRecord[]> {
  const localPatients = readJson<PatientRecord[]>("patients.json", []);
  const supabase = getSupabaseClient();
  const patientMap = new Map<string, PatientRecord>();

  if (supabase) {
    try {
      const { data, error } = await supabase.from("patients").select("*").order("urgency_score", { ascending: false });
      if (!error && Array.isArray(data)) {
        data.forEach((p: any) => {
          if (p && p.id && !patientMap.has(p.id)) {
            patientMap.set(p.id, {
              id: p.id,
              name: p.name,
              age: p.age,
              gender: p.gender,
              bpSystolic: p.bp_systolic,
              bpDiastolic: p.bp_diastolic,
              height: p.height,
              weight: p.weight,
              bloodGroup: p.blood_group,
              temperature: p.temperature,
              sugarLevel: p.sugar_level,
              wbcCount: p.wbc_count,
              isPregnant: p.is_pregnant,
              gestationalWeek: p.gestational_week,
              fetalHeartRate: p.fetal_heart_rate,
              diabetesType: p.diabetes_type,
              allergies: p.allergies,
              currentMedications: p.current_medications,
              pastMedicalHistory: p.past_medical_history,
              surgicalHistory: p.surgical_history,
              familyHistory: p.family_history,
              smokingHistory: p.smoking_history,
              alcoholHistory: p.alcohol_history,
              symptoms: p.symptoms || [],
              triagePriority: p.triage_priority,
              urgencyScore: p.urgency_score,
              urgencyReason: p.urgency_reason,
              assignedDoctor: p.assigned_doctor,
              status: p.status,
              doctorNotes: p.doctor_notes,
              createdAt: p.created_at,
              updatedAt: p.updated_at,
            });
          }
        });
      }
    } catch (e) {
      console.warn("Supabase patient fetch fallback:", e);
    }
  }

  // Merge any local patients that are not already present
  localPatients.forEach((lp) => {
    if (lp && lp.id && !patientMap.has(lp.id)) {
      patientMap.set(lp.id, lp);
    }
  });

  return Array.from(patientMap.values());
}

export async function getPatientById(id: string): Promise<PatientRecord | null> {
  const patients = await getAllPatients();
  return patients.find((p) => p.id === id) || null;
}

export async function savePatient(patientData: Omit<PatientRecord, "id" | "createdAt"> & { id?: string }): Promise<PatientRecord> {
  const newPatient: PatientRecord = {
    id: patientData.id || "PT-" + Math.floor(1000 + Math.random() * 9000),
    ...patientData,
    status: patientData.status || "WAITING",
    createdAt: new Date().toISOString(),
  };

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("patients").upsert({
        id: newPatient.id,
        name: newPatient.name,
        age: newPatient.age,
        gender: newPatient.gender,
        bp_systolic: newPatient.bpSystolic,
        bp_diastolic: newPatient.bpDiastolic,
        height: newPatient.height,
        weight: newPatient.weight,
        blood_group: newPatient.bloodGroup,
        temperature: newPatient.temperature,
        sugar_level: newPatient.sugarLevel,
        wbc_count: newPatient.wbcCount,
        is_pregnant: newPatient.isPregnant || false,
        gestational_week: newPatient.gestationalWeek,
        fetal_heart_rate: newPatient.fetalHeartRate,
        diabetes_type: newPatient.diabetesType,
        allergies: newPatient.allergies,
        current_medications: newPatient.currentMedications,
        past_medical_history: newPatient.pastMedicalHistory,
        surgical_history: newPatient.surgicalHistory,
        family_history: newPatient.familyHistory,
        smoking_history: newPatient.smokingHistory,
        alcohol_history: newPatient.alcoholHistory,
        symptoms: newPatient.symptoms || [],
        triage_priority: newPatient.triagePriority,
        urgency_score: newPatient.urgencyScore,
        urgency_reason: newPatient.urgencyReason,
        assigned_doctor: newPatient.assignedDoctor || "Dr. Arvind Rao",
        status: newPatient.status,
        doctor_notes: newPatient.doctorNotes || "",
        created_at: newPatient.createdAt,
      });
    } catch (e) {
      console.warn("Supabase save patient fallback:", e);
    }
  }

  const patients = readJson<PatientRecord[]>("patients.json", []);
  const index = patients.findIndex((p) => p.id === newPatient.id);
  if (index >= 0) {
    patients[index] = { ...patients[index], ...newPatient };
  } else {
    patients.unshift(newPatient);
  }
  writeJson("patients.json", patients);
  return newPatient;
}

export async function updatePatientStatus(id: string, status: PatientRecord["status"], doctorNotes?: string): Promise<PatientRecord | null> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const updates: any = { status, updated_at: new Date().toISOString() };
      if (doctorNotes !== undefined) updates.doctor_notes = doctorNotes;
      await supabase.from("patients").update(updates).eq("id", id);
    } catch (e) {
      console.warn("Supabase update patient fallback:", e);
    }
  }

  const patients = readJson<PatientRecord[]>("patients.json", []);
  const patient = patients.find((p) => p.id === id);
  if (!patient) return null;

  patient.status = status;
  if (doctorNotes !== undefined) {
    patient.doctorNotes = doctorNotes;
  }
  patient.updatedAt = new Date().toISOString();
  writeJson("patients.json", patients);
  return patient;
}

export async function deletePatient(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("patients").delete().eq("id", id);
    } catch (e) {}
  }
  const patients = readJson<PatientRecord[]>("patients.json", []);
  const filtered = patients.filter((p) => p.id !== id);
  writeJson("patients.json", filtered);
  return true;
}

// ── STAFF MESSAGES ──────────────────────────────────────────────────
export async function getAllStaffMessages(): Promise<StaffMessage[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from("messages").select("*").order("created_at", { ascending: true });
      if (!error && data) {
        return data.map((m: any) => ({
          id: m.id,
          sender: m.sender,
          role: m.role,
          text: m.text,
          time: m.time,
        }));
      }
    } catch (e) {}
  }
  return readJson<StaffMessage[]>("messages.json", []);
}

export async function saveStaffMessage(messageData: Omit<StaffMessage, "id" | "time"> & { time?: string }): Promise<StaffMessage> {
  const newMsg: StaffMessage = {
    id: "msg-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
    sender: messageData.sender,
    role: messageData.role,
    text: messageData.text,
    time: messageData.time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("messages").insert({
        id: newMsg.id,
        sender: newMsg.sender,
        role: newMsg.role,
        text: newMsg.text,
        time: newMsg.time,
        created_at: new Date().toISOString(),
      });
    } catch (e) {}
  }

  const messages = readJson<StaffMessage[]>("messages.json", []);
  messages.push(newMsg);
  writeJson("messages.json", messages);
  return newMsg;
}

// ── RESOURCES ───────────────────────────────────────────────────────
export async function getResources(): Promise<ResourceData> {
  const defaultRes: ResourceData = {
    icuBeds: { total: 6, occupied: 1, free: 5 },
    bloodBank: [
      { group: "O-", units: 3, status: "critical" },
      { group: "A+", units: 10, status: "adequate" },
      { group: "B+", units: 6, status: "adequate" },
      { group: "O+", units: 15, status: "good" },
    ],
  };

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data } = await supabase.from("resources").select("*").eq("id", "default").single();
      if (data) {
        return {
          icuBeds: data.icu_beds,
          bloodBank: data.blood_bank,
        };
      }
    } catch (e) {}
  }

  return readJson<ResourceData>("resources.json", defaultRes);
}

export async function allocateIcuBed(change: number = -1): Promise<ResourceData> {
  const current = await getResources();
  const newFree = Math.max(0, Math.min(current.icuBeds.total, current.icuBeds.free + change));
  const newOccupied = current.icuBeds.total - newFree;

  current.icuBeds.free = newFree;
  current.icuBeds.occupied = newOccupied;

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("resources").upsert({
        id: "default",
        icu_beds: current.icuBeds,
        blood_bank: current.bloodBank,
      });
    } catch (e) {}
  }

  writeJson("resources.json", current);
  return current;
}

export async function updateResources(updates: Partial<ResourceData>): Promise<ResourceData> {
  const current = await getResources();
  const merged = { ...current, ...updates };

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("resources").upsert({
        id: "default",
        icu_beds: merged.icuBeds,
        blood_bank: merged.bloodBank,
      });
    } catch (e) {}
  }

  writeJson("resources.json", merged);
  return merged;
}

// ── ALERTS ──────────────────────────────────────────────────────────
export async function getAllAlerts(): Promise<AlertRecord[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data } = await supabase.from("alerts").select("*").order("timestamp", { ascending: false });
      if (data) {
        return data.map((a: any) => ({
          id: a.id,
          patientId: a.patient_id,
          patientName: a.patient_name,
          category: a.category,
          notes: a.notes,
          timestamp: a.timestamp,
          status: a.status,
        }));
      }
    } catch (e) {}
  }
  return readJson<AlertRecord[]>("alerts.json", []);
}

export async function createEmergencyAlert(patientName: string, category: string, notes?: string): Promise<{ alert: AlertRecord; patient: PatientRecord }> {
  const patientId = "PT-" + Math.floor(1000 + Math.random() * 9000);
  const alertId = "ALT-" + Math.floor(1000 + Math.random() * 9000);

  const patient = await savePatient({
    id: patientId,
    name: patientName,
    age: "45",
    gender: "Other",
    bpSystolic: "185",
    bpDiastolic: "115",
    height: "172",
    weight: "74",
    bloodGroup: "O-",
    temperature: "101.5",
    sugarLevel: "260",
    wbcCount: "16500",
    triagePriority: "RED",
    urgencyScore: 98,
    urgencyReason: `🚨 FAST-TRACK CODE RED EMERGENCY: ${category}. Immediate resuscitation requested.`,
    status: "WAITING",
  });

  const alert: AlertRecord = {
    id: alertId,
    patientId,
    patientName,
    category,
    notes,
    timestamp: new Date().toISOString(),
    status: "ACTIVE",
  };

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("alerts").insert({
        id: alert.id,
        patient_id: alert.patientId,
        patient_name: alert.patientName,
        category: alert.category,
        notes: alert.notes,
        status: alert.status,
        timestamp: alert.timestamp,
      });
    } catch (e) {}
  }

  const alerts = readJson<AlertRecord[]>("alerts.json", []);
  alerts.unshift(alert);
  writeJson("alerts.json", alerts);

  await allocateIcuBed(-1);
  await saveStaffMessage({
    sender: "Emergency Trauma Dispatch",
    role: "system",
    text: `🚨 CRITICAL CODE RED ALERT: ${patientName} (${category}) admitted. ICU Bed auto-allocated.`,
  });

  return { alert, patient };
}
