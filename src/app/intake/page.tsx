"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import VoiceScribeWidget from "@/components/VoiceScribeWidget";
import {
  User,
  Calendar,
  Activity,
  Ruler,
  Scale,
  Droplet,
  Thermometer,
  TestTube2,
  ShieldAlert,
  ArrowLeft,
  ArrowRight,
  Edit3,
  CheckCircle2,
  Save,
  HeartPulse,
  LogOut,
  AlertTriangle,
  Info,
  ShieldCheck,
  Stethoscope,
  Sparkles,
  RotateCcw,
  MessageSquare,
  FileText,
} from "lucide-react";
import { useIntake } from "@/context/IntakeContext";
import { useStaffChat } from "@/context/StaffChatContext";
import CodeRedTraumaModal from "@/components/CodeRedTraumaModal";
import PatientReceiptModal from "@/components/PatientReceiptModal";

/* ─────────── Form Data Type ─────────── */
interface PatientVitals {
  name: string;
  age: string;
  gender: "Female" | "Male" | "Other" | "";
  bpSystolic: string;
  bpDiastolic: string;
  height: string;
  weight: string;
  bloodGroup: string;
  temperature: string;
  sugarLevel: string;
  wbcCount: string;
}

const initialForm: PatientVitals = {
  name: "",
  age: "",
  gender: "",
  bpSystolic: "",
  bpDiastolic: "",
  height: "",
  weight: "",
  bloodGroup: "",
  temperature: "",
  sugarLevel: "",
  wbcCount: "",
};

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

/* ═══════════════════════════════════════════════════════════════
   ANIMATED ABSTRACT CLINICAL BACKGROUND
   ═══════════════════════════════════════════════════════════════ */
function ClinicalBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#040f14]">
      {/* Dynamic Gradient Mesh */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 20% 15%, rgba(13,148,136,0.22) 0%, transparent 45%), radial-gradient(circle at 80% 85%, rgba(6,182,212,0.18) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(15,23,42,0.8) 0%, transparent 100%)",
        }}
      />

      {/* Pulsing Floating Ambient Orbs */}
      <div className="absolute top-[10%] left-[8%] h-96 w-96 rounded-full bg-teal-500/10 blur-3xl animate-pulse-glow" />
      <div
        className="absolute bottom-[10%] right-[10%] h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-3xl animate-pulse-glow"
        style={{ animationDelay: "3s" }}
      />
      <div
        className="absolute top-[50%] left-[45%] h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl animate-pulse-glow"
        style={{ animationDelay: "1.5s" }}
      />

      {/* Subtle Clinical Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Animated Glowing ECG / Pulse Line */}
      <div className="absolute top-1/3 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-teal-400/20 to-transparent overflow-hidden">
        <div className="h-full w-48 bg-gradient-to-r from-transparent via-teal-300 to-transparent animate-ecg-scan" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN CHECKUP & VITALS INTAKE PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function IntakePage() {
  const router = useRouter();
  const { personal, vitals, updatePersonal, updateVitals, resetIntake } = useIntake();
  const { setCurrentUserRole, setCurrentUserName } = useStaffChat();

  /* ── State ── */
  const [form, setForm] = useState<PatientVitals>({
    name: personal.name || initialForm.name,
    age: personal.age || initialForm.age,
    gender: personal.gender || initialForm.gender,
    bpSystolic: vitals.bpSystolic || initialForm.bpSystolic,
    bpDiastolic: vitals.bpDiastolic || initialForm.bpDiastolic,
    height: vitals.height || initialForm.height,
    weight: vitals.weight || initialForm.weight,
    bloodGroup: vitals.bloodGroup || initialForm.bloodGroup,
    temperature: vitals.temperature || initialForm.temperature,
    sugarLevel: vitals.sugarLevel || initialForm.sugarLevel,
    wbcCount: vitals.wbcCount || initialForm.wbcCount,
  });
  const [mode, setMode] = useState<"editing" | "saved">("editing");
  const [errors, setErrors] = useState<Partial<Record<keyof PatientVitals, string>>>({});
  const [nurseName, setNurseName] = useState<string>("Nurse Praharshitha");
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const isSaved = mode === "saved";

  useEffect(() => {
    try {
      setCurrentUserRole("nurse");
      localStorage.setItem("userRole", "nurse");
      let nName = localStorage.getItem("nurseName");
      if (!nName || !nName.trim() || nName.toLowerCase().startsWith("dr.") || nName.toLowerCase().startsWith("dr ") || nName.toLowerCase().includes("amit")) {
        const uRole = localStorage.getItem("userRole");
        const uName = localStorage.getItem("userName");
        if (uRole === "nurse" && uName && !uName.toLowerCase().startsWith("dr.") && !uName.toLowerCase().includes("amit")) {
          nName = uName.toLowerCase().startsWith("nurse") || uName.toLowerCase().startsWith("duty nurse")
            ? uName
            : `Nurse ${uName}`;
        } else {
          nName = "Nurse Praharshitha";
        }
      }
      setNurseName(nName);
      setCurrentUserName(nName);
      localStorage.setItem("nurseName", nName);
    } catch {}
  }, [setCurrentUserRole, setCurrentUserName]);

  /* ── Change Handler ── */
  const handleChange = (field: keyof PatientVitals, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  /* ── Voice Scribe Auto-Extraction Handler (Live Partial Merge) ── */
  const handleDataExtracted = (extractedData: any) => {
    if (!extractedData || typeof extractedData !== "object") return;

    setForm((prev) => {
      const updated = { ...prev };
      if (extractedData.name) updated.name = extractedData.name;
      if (extractedData.age) updated.age = String(extractedData.age);
      if (extractedData.gender) updated.gender = extractedData.gender;
      if (extractedData.bpSystolic) updated.bpSystolic = String(extractedData.bpSystolic);
      if (extractedData.bpDiastolic) updated.bpDiastolic = String(extractedData.bpDiastolic);
      if (extractedData.height) updated.height = String(extractedData.height);
      if (extractedData.weight) updated.weight = String(extractedData.weight);
      if (extractedData.bloodGroup) updated.bloodGroup = extractedData.bloodGroup;
      if (extractedData.temperature) updated.temperature = String(extractedData.temperature);
      if (extractedData.sugarLevel) updated.sugarLevel = String(extractedData.sugarLevel);
      if (extractedData.wbcCount) updated.wbcCount = String(extractedData.wbcCount);
      return updated;
    });

    setErrors({});
  };

  /* ── Listen for Global Assistant Autofill Events ── */
  useEffect(() => {
    const handleGlobalAutofill = (event: any) => {
      if (event.detail) {
        handleDataExtracted(event.detail);
      }
    };
    window.addEventListener("clinical-data-autofill", handleGlobalAutofill);
    return () => {
      window.removeEventListener("clinical-data-autofill", handleGlobalAutofill);
    };
  }, []);

  /* ── Real-Time AI Medical Logic & Indicators ── */

  // 1. Sugar Level Logic
  const sugarAnalysis = useMemo(() => {
    const val = parseFloat(form.sugarLevel);
    if (isNaN(val) || val <= 0) return null;
    if (val < 140) {
      return {
        category: "Normal",
        color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
        badge: "bg-emerald-500",
        msg: "Within standard non-fasting range (< 140 mg/dL)",
        status: "normal",
      };
    }
    if (val <= 199) {
      return {
        category: "Prediabetes / Borderline",
        color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
        badge: "bg-amber-500",
        msg: "Impaired glucose tolerance (140 - 199 mg/dL)",
        status: "warning",
      };
    }
    return {
      category: "Diabetic / High",
      color: "text-rose-400 border-rose-500/30 bg-rose-500/10",
      badge: "bg-rose-500",
      msg: "Elevated glycemia alert (≥ 200 mg/dL)",
      status: "danger",
    };
  }, [form.sugarLevel]);

  // 2. CBP WBC Count Logic
  const wbcAnalysis = useMemo(() => {
    const val = parseFloat(form.wbcCount);
    if (isNaN(val) || val <= 0) return null;
    if (val < 4500) {
      return {
        category: "Low WBC (Leukopenia)",
        color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
        badge: "bg-amber-500",
        msg: "Lower than standard threshold (< 4,500 cells/mcL)",
        status: "warning",
      };
    }
    if (val <= 11000) {
      return {
        category: "Normal WBC Count",
        color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
        badge: "bg-emerald-500",
        msg: "Healthy immune response (4,500 - 11,000 cells/mcL)",
        status: "normal",
      };
    }
    return {
      category: "High WBC - Possible Infection",
      color: "text-rose-400 border-rose-500/30 bg-rose-500/10",
      badge: "bg-rose-500",
      msg: "Leukocytosis flag — Possible acute infection (> 11,000 cells/mcL)",
      status: "danger",
    };
  }, [form.wbcCount]);

  // 3. Blood Pressure Logic (American Heart Association Standards)
  const bpAnalysis = useMemo(() => {
    const sys = parseFloat(form.bpSystolic);
    const dia = parseFloat(form.bpDiastolic);
    if (isNaN(sys) || isNaN(dia) || sys <= 0 || dia <= 0) return null;

    // Hypertensive Crisis
    if (sys >= 180 || dia >= 120) {
      return {
        category: "Hypertensive Crisis",
        color: "text-rose-400 border-rose-500/40 bg-rose-500/15",
        msg: "Critical: ≥180 systolic or ≥120 diastolic mmHg (Immediate Emergency)",
      };
    }
    // Stage 2 Hypertension
    if (sys >= 140 || dia >= 90) {
      return {
        category: "Stage 2 Hypertension",
        color: "text-rose-400 border-rose-500/30 bg-rose-500/10",
        msg: "Stage 2 HTN: ≥140 systolic or ≥90 diastolic mmHg",
      };
    }
    // Stage 1 Hypertension
    if (sys >= 130 || dia >= 80) {
      return {
        category: "Stage 1 Hypertension",
        color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
        msg: "Stage 1 HTN: 130-139 systolic or 80-89 diastolic mmHg",
      };
    }
    // Elevated Blood Pressure
    if (sys >= 120 && sys <= 129 && dia < 80) {
      return {
        category: "Elevated BP",
        color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
        msg: "Elevated: 120-129 systolic and <80 diastolic mmHg",
      };
    }
    // Hypotension (Low Blood Pressure)
    if (sys < 90 || dia < 60) {
      return {
        category: "Low BP (Hypotension)",
        color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
        msg: "Hypotension: <90 systolic or <60 diastolic mmHg",
      };
    }
    // Normal Blood Pressure
    return {
      category: "Normal BP",
      color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
      msg: "Normal range: 90-119 systolic and 60-79 diastolic mmHg",
    };
  }, [form.bpSystolic, form.bpDiastolic]);

  // 4. Body Temperature Logic
  const tempAnalysis = useMemo(() => {
    const val = parseFloat(form.temperature);
    if (isNaN(val) || val <= 0) return null;
    if (val < 95) {
      return {
        category: "Hypothermia",
        color: "text-blue-400 border-blue-500/30 bg-blue-500/10",
        msg: "Low body temperature (< 95.0°F)",
      };
    }
    if (val <= 99.0) {
      return {
        category: "Normal Temp",
        color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
        msg: "Afebrile (97.0 - 99.0°F)",
      };
    }
    if (val <= 100.4) {
      return {
        category: "Low-Grade Fever",
        color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
        msg: "Mild pyrexia (99.1 - 100.4°F)",
      };
    }
    return {
      category: "High Fever",
      color: "text-rose-400 border-rose-500/30 bg-rose-500/10",
      msg: "Pyrexia alert (≥ 100.5°F)",
    };
  }, [form.temperature]);

  // 5. BMI Calculation
  const bmiAnalysis = useMemo(() => {
    const h = parseFloat(form.height) / 100; // in meters
    const w = parseFloat(form.weight); // in kg
    if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) return null;
    const bmi = +(w / (h * h)).toFixed(1);
    let category = "Normal";
    let color = "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (bmi < 18.5) {
      category = "Underweight";
      color = "text-amber-400 border-amber-500/30 bg-amber-500/10";
    } else if (bmi >= 25 && bmi < 30) {
      category = "Overweight";
      color = "text-amber-400 border-amber-500/30 bg-amber-500/10";
    } else if (bmi >= 30) {
      category = "Obese";
      color = "text-rose-400 border-rose-500/30 bg-rose-500/10";
    }
    return { bmi, category, color };
  }, [form.height, form.weight]);

  /* ── Validation & Save ── */
  const validateForm = () => {
    const newErrors: Partial<Record<keyof PatientVitals, string>> = {};
    if (!form.name.trim()) newErrors.name = "Patient full name is required";
    if (!form.age.trim()) newErrors.age = "Age is required";
    if (!form.bpSystolic.trim()) newErrors.bpSystolic = "Systolic BP required";
    if (!form.bpDiastolic.trim()) newErrors.bpDiastolic = "Diastolic BP required";
    if (!form.height.trim()) newErrors.height = "Height is required";
    if (!form.weight.trim()) newErrors.weight = "Weight is required";
    if (!form.bloodGroup) newErrors.bloodGroup = "Select blood group";
    if (!form.temperature.trim()) newErrors.temperature = "Temperature required";
    if (!form.sugarLevel.trim()) newErrors.sugarLevel = "Sugar level required";
    if (!form.wbcCount.trim()) newErrors.wbcCount = "WBC count required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setMode("saved");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNext = () => {
    updatePersonal({
      name: form.name,
      age: form.age,
      gender: form.gender,
    });
    updateVitals({
      bpSystolic: form.bpSystolic,
      bpDiastolic: form.bpDiastolic,
      height: form.height,
      weight: form.weight,
      bloodGroup: form.bloodGroup,
      temperature: form.temperature,
      sugarLevel: form.sugarLevel,
      wbcCount: form.wbcCount,
    });
    router.push("/intake/history");
  };

  const handleResetData = () => {
    setForm(initialForm);
    resetIntake();
    setErrors({});
    setMode("editing");
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    try {
      localStorage.removeItem("userRole");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      localStorage.removeItem("doctorName");
      localStorage.removeItem("nurseName");
    } catch {}
    window.location.href = "/auth";
  };

  const { setIsChatOpen, unreadCount } = useStaffChat();

  return (
    <main className="relative min-h-screen w-full flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      <ClinicalBackground />

      {/* ══════════════════════════════════════════════════════
          TOP NAVIGATION & STATUS BAR
         ══════════════════════════════════════════════════════ */}
      <header className="mx-auto w-full max-w-6xl mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-white/15 bg-slate-900/40 p-4 sm:p-5 backdrop-blur-xl shadow-lg">
        {/* Brand & Clinical Station Info */}
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/20 border border-teal-400/30 text-teal-300 shadow-md">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-wide">
                Nurse Triage Station
              </span>
              <span className="rounded-full bg-teal-500/20 border border-teal-400/30 px-2 py-0.5 text-[10px] font-bold uppercase text-teal-300">
                Frontline Intake
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {nurseName} • Connected with Medical Officer on Duty
            </p>
          </div>
        </div>

        {/* Staff Comms + Step Indicator + 1-Tap Code Red + Sign Out */}
        <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
          <button
            type="button"
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-teal-400/30 bg-teal-500/15 hover:bg-teal-500/25 px-3.5 py-1.5 text-xs font-bold text-teal-200 transition-all cursor-pointer relative"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Chat Box</span>
            {unreadCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          <CodeRedTraumaModal />

          <button
            type="button"
            onClick={() => setIsReceiptModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-teal-400/40 bg-teal-500/15 hover:bg-teal-500/25 px-3.5 py-1.5 text-xs font-bold text-teal-200 transition-all cursor-pointer shadow-sm"
            title="View Patient Admission Receipts & Case Sheets"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>View Patient Receipts</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-rose-500/20 hover:border-rose-400/30 hover:text-rose-200 transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════
          MAIN SPACIOUS FROSTED GLASS FORM CONTAINER
         ══════════════════════════════════════════════════════ */}
      <div className="mx-auto w-full max-w-6xl flex-1 flex flex-col justify-center">
        <div
          className="
            animate-card-neon
            w-full rounded-3xl
            border border-teal-300/30
            bg-slate-950/40
            p-6 sm:p-10
            shadow-2xl
            backdrop-blur-2xl
            transition-all duration-300
          "
        >
          {/* ── Form Card Header ── */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <Stethoscope className="h-6 w-6 text-teal-300" />
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Patient Vitals
                </h1>
              </div>
              <p className="mt-1 text-sm text-slate-300 max-w-2xl">
                Enter the patient&apos;s details and vitals below to check health risks.
              </p>
            </div>

            {/* Mode Controls: Reset Data & Edit Option */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Reset Button */}
              <button
                type="button"
                onClick={handleResetData}
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/20 hover:border-rose-400/50 hover:text-rose-200 transition-all cursor-pointer shadow-sm active:scale-95"
                title="Clear and reset all form data"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>

              {/* Edit Mode Toggle */}
              {isSaved ? (
                <button
                  type="button"
                  onClick={() => setMode("editing")}
                  className="flex items-center gap-1.5 rounded-xl border border-teal-300/40 bg-teal-500/20 px-3.5 py-1.5 text-xs font-bold text-teal-200 hover:bg-teal-500/30 transition-all cursor-pointer shadow-sm"
                  title="Switch to Edit Mode"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit Vitals</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 rounded-xl bg-teal-500/15 border border-teal-400/30 px-3.5 py-1.5 text-xs font-bold text-teal-300">
                  <Edit3 className="h-3.5 w-3.5 text-teal-400 animate-pulse" />
                  <span>Edit Mode Active</span>
                </div>
              )}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              VOICE SCRIBE WIDGET INTEGRATION (Top of Form)
             ══════════════════════════════════════════════════════ */}
          {!isSaved && (
            <div className="mb-8">
              <VoiceScribeWidget onDataExtracted={handleDataExtracted} />
            </div>
          )}

          {/* ── Saved Success Banner ── */}
          {isSaved && (
            <div className="animate-fade-slide-in mb-8 flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200 shadow-lg">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-white">
                    Patient Vitals Successfully Captured
                  </h4>
                  <p className="text-xs text-emerald-200/80">
                    Data has been verified and locked. You can now proceed to Deep Clinical History or edit fields if necessary.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMode("editing")}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-200 hover:bg-emerald-500/30 transition-all cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Unlock & Edit</span>
              </button>
            </div>
          )}

          {/* ── UNIFIED VITALS FORM GRID ── */}
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-start">
              
              {/* ──────────────── 1. PATIENT NAME (Wide) ──────────────── */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-teal-300" />
                    Patient Full Name
                  </span>
                  <span className="text-[10px] text-rose-400 font-semibold">*Required</span>
                </label>
                {isSaved ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm font-semibold text-white">
                    {form.name}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g. Ramesh Chandra"
                    className={`w-full rounded-2xl border bg-black/40 py-2.5 px-4 text-sm text-white placeholder-slate-500 backdrop-blur-md transition-all focus:border-teal-300 focus:bg-black/60 focus:ring-2 focus:ring-teal-400/20 ${errors.name ? "border-rose-500/70" : "border-white/15"}`}
                  />
                )}
                {errors.name && <p className="text-xs text-rose-400 font-medium">{errors.name}</p>}
              </div>

              {/* ──────────────── 2. AGE (Compact) ──────────────── */}
              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-teal-300" />
                    Age (Years)
                  </span>
                  <span className="text-[10px] text-rose-400 font-semibold">*Required</span>
                </label>
                {isSaved ? (
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3 text-sm font-semibold text-white">
                    <span>{form.age} Years</span>
                    <span className="rounded-lg bg-teal-500/20 px-2 py-0.5 text-xs text-teal-300 font-bold">
                      {+form.age < 18 ? "Pediatric" : +form.age >= 60 ? "Geriatric" : "Adult"}
                    </span>
                  </div>
                ) : (
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={form.age}
                    onChange={(e) => handleChange("age", e.target.value)}
                    placeholder="e.g. 42"
                    className={`w-full max-w-[180px] rounded-2xl border bg-black/40 py-2.5 px-4 text-sm text-white placeholder-slate-500 backdrop-blur-md transition-all focus:border-teal-300 focus:bg-black/60 focus:ring-2 focus:ring-teal-400/20 ${errors.age ? "border-rose-500/70" : "border-white/15"}`}
                  />
                )}
                {errors.age && <p className="text-xs text-rose-400 font-medium">{errors.age}</p>}
              </div>

              {/* ──────────────── 3. BIOLOGICAL GENDER ──────────────── */}
              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-200">
                  <span>Biological Gender</span>
                  <span className="text-[10px] text-teal-300 font-semibold">Maternal Gate</span>
                </label>
                {isSaved ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm font-semibold text-white">
                    {form.gender || "Not specified"}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    {(["Female", "Male", "Other"] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => handleChange("gender", g)}
                        className={`flex-1 py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${form.gender === g ? "bg-teal-500/25 border-teal-300 text-teal-200 shadow-md" : "bg-black/40 border-white/15 text-slate-400 hover:bg-white/5 hover:text-white"}`}
                      >
                        {g === "Female" ? "♀ Female" : g === "Male" ? "♂ Male" : "Other"}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ──────────────── 4. BLOOD PRESSURE ──────────────── */}
              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-teal-300" />
                    Blood Pressure
                  </span>
                  <span className="text-[10px] text-slate-400">mmHg</span>
                </label>
                {isSaved ? (
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3 text-sm font-semibold text-white">
                    <span>{form.bpSystolic} / {form.bpDiastolic} mmHg</span>
                    {bpAnalysis && (
                      <span className={`rounded-lg border px-2 py-0.5 text-xs font-bold ${bpAnalysis.color}`}>
                        {bpAnalysis.category}
                      </span>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={form.bpSystolic}
                        onChange={(e) => handleChange("bpSystolic", e.target.value)}
                        placeholder="Sys (120)"
                        className={`w-24 rounded-2xl border bg-black/40 py-2.5 px-3 text-sm text-white placeholder-slate-500 focus:border-teal-300 ${errors.bpSystolic ? "border-rose-500/70" : "border-white/15"}`}
                      />
                      <span className="text-slate-400 font-bold">/</span>
                      <input
                        type="number"
                        value={form.bpDiastolic}
                        onChange={(e) => handleChange("bpDiastolic", e.target.value)}
                        placeholder="Dia (80)"
                        className={`w-24 rounded-2xl border bg-black/40 py-2.5 px-3 text-sm text-white placeholder-slate-500 focus:border-teal-300 ${errors.bpDiastolic ? "border-rose-500/70" : "border-white/15"}`}
                      />
                    </div>
                    {bpAnalysis && (
                      <div className={`mt-1.5 flex items-center gap-1 rounded-lg border p-1.5 text-[11px] font-medium ${bpAnalysis.color}`}>
                        <Info className="h-3 w-3 shrink-0" />
                        <span><strong>{bpAnalysis.category}:</strong> {bpAnalysis.msg}</span>
                      </div>
                    )}
                  </div>
                )}
                {(errors.bpSystolic || errors.bpDiastolic) && (
                  <p className="text-xs text-rose-400 font-medium">Both systolic and diastolic values required</p>
                )}
              </div>

              {/* ──────────────── 5. TEMPERATURE ──────────────── */}
              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Thermometer className="h-3.5 w-3.5 text-amber-300" />
                    Body Temperature
                  </span>
                  <span className="text-[10px] text-slate-400">°F</span>
                </label>
                {isSaved ? (
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3 text-sm font-semibold text-white">
                    <span>{form.temperature} °F</span>
                    {tempAnalysis && (
                      <span className={`rounded-lg border px-2 py-0.5 text-xs font-bold ${tempAnalysis.color}`}>
                        {tempAnalysis.category}
                      </span>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="number"
                      step="0.1"
                      min="90"
                      max="110"
                      value={form.temperature}
                      onChange={(e) => handleChange("temperature", e.target.value)}
                      placeholder="e.g. 98.6"
                      className={`w-full max-w-[180px] rounded-2xl border bg-black/40 py-2.5 px-4 text-sm text-white placeholder-slate-500 focus:border-teal-300 ${errors.temperature ? "border-rose-500/70" : "border-white/15"}`}
                    />
                    {tempAnalysis && (
                      <div className={`mt-1.5 flex items-center gap-1 rounded-lg border p-1.5 text-[11px] font-medium ${tempAnalysis.color}`}>
                        <Info className="h-3 w-3 shrink-0" />
                        <span><strong>{tempAnalysis.category}:</strong> {tempAnalysis.msg}</span>
                      </div>
                    )}
                  </div>
                )}
                {errors.temperature && <p className="text-xs text-rose-400 font-medium">{errors.temperature}</p>}
              </div>

              {/* ──────────────── 6. BLOOD GROUP ──────────────── */}
              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Droplet className="h-3.5 w-3.5 text-rose-400" />
                    Blood Group
                  </span>
                  <span className="text-[10px] text-rose-400 font-semibold">*Required</span>
                </label>
                {isSaved ? (
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm font-bold text-rose-300">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/20 border border-rose-400/30 text-xs">
                      {form.bloodGroup}
                    </span>
                    <span>Blood Type {form.bloodGroup}</span>
                  </div>
                ) : (
                  <select
                    value={form.bloodGroup}
                    onChange={(e) => handleChange("bloodGroup", e.target.value)}
                    className={`w-full max-w-[200px] rounded-2xl border bg-black/40 py-2.5 px-4 text-sm text-white focus:border-teal-300 cursor-pointer ${errors.bloodGroup ? "border-rose-500/70" : "border-white/15"}`}
                  >
                    <option value="" disabled className="bg-slate-900 text-slate-400">
                      Select Blood Group...
                    </option>
                    {bloodGroups.map((bg) => (
                      <option key={bg} value={bg} className="bg-slate-900 text-white font-medium">
                        {bg}
                      </option>
                    ))}
                  </select>
                )}
                {errors.bloodGroup && <p className="text-xs text-rose-400 font-medium">{errors.bloodGroup}</p>}
              </div>

              {/* ──────────────── 7. HEIGHT ──────────────── */}
              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Ruler className="h-3.5 w-3.5 text-teal-300" />
                    Height (cm)
                  </span>
                  <span className="text-[10px] text-slate-400">Centimeters</span>
                </label>
                {isSaved ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm font-semibold text-white">
                    {form.height} cm
                  </div>
                ) : (
                  <input
                    type="number"
                    min="30"
                    max="250"
                    value={form.height}
                    onChange={(e) => handleChange("height", e.target.value)}
                    placeholder="e.g. 172"
                    className={`w-full max-w-[180px] rounded-2xl border bg-black/40 py-2.5 px-4 text-sm text-white placeholder-slate-500 focus:border-teal-300 ${errors.height ? "border-rose-500/70" : "border-white/15"}`}
                  />
                )}
                {errors.height && <p className="text-xs text-rose-400 font-medium">{errors.height}</p>}
              </div>

              {/* ──────────────── 8. WEIGHT & BMI ──────────────── */}
              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Scale className="h-3.5 w-3.5 text-teal-300" />
                    Weight (kg)
                  </span>
                  <span className="text-[10px] text-slate-400">Kilograms</span>
                </label>
                {isSaved ? (
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3 text-sm font-semibold text-white">
                    <span>{form.weight} kg</span>
                    {bmiAnalysis && (
                      <span className={`rounded-lg border px-2 py-0.5 text-xs font-bold ${bmiAnalysis.color}`}>
                        BMI: {bmiAnalysis.bmi} ({bmiAnalysis.category})
                      </span>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="number"
                      step="0.1"
                      min="2"
                      max="300"
                      value={form.weight}
                      onChange={(e) => handleChange("weight", e.target.value)}
                      placeholder="e.g. 68.5"
                      className={`w-full max-w-[180px] rounded-2xl border bg-black/40 py-2.5 px-4 text-sm text-white placeholder-slate-500 focus:border-teal-300 ${errors.weight ? "border-rose-500/70" : "border-white/15"}`}
                    />
                    {bmiAnalysis && (
                      <div className={`mt-1.5 flex items-center justify-between rounded-lg border p-1.5 text-[11px] font-medium ${bmiAnalysis.color}`}>
                        <span>BMI: <strong>{bmiAnalysis.bmi}</strong></span>
                        <span className="font-bold uppercase text-[9px]">{bmiAnalysis.category}</span>
                      </div>
                    )}
                  </div>
                )}
                {errors.weight && <p className="text-xs text-rose-400 font-medium">{errors.weight}</p>}
              </div>

              {/* ──────────────── 9. BLOOD SUGAR LEVEL (GLUCOSE) ──────────────── */}
              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <TestTube2 className="h-3.5 w-3.5 text-cyan-300" />
                    Blood Sugar (Glucose)
                  </span>
                  <span className="text-[10px] text-slate-400">mg/dL</span>
                </label>
                {isSaved ? (
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3 text-sm font-semibold text-white">
                    <span>{form.sugarLevel} mg/dL</span>
                    {sugarAnalysis && (
                      <span className={`rounded-lg border px-2 py-0.5 text-xs font-bold ${sugarAnalysis.color}`}>
                        {sugarAnalysis.category}
                      </span>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="number"
                      min="20"
                      max="800"
                      value={form.sugarLevel}
                      onChange={(e) => handleChange("sugarLevel", e.target.value)}
                      placeholder="e.g. 110"
                      className={`w-full max-w-[180px] rounded-2xl border bg-black/40 py-2.5 px-4 text-sm text-white placeholder-slate-500 focus:border-teal-300 ${errors.sugarLevel ? "border-rose-500/70" : "border-white/15"}`}
                    />
                    {sugarAnalysis && (
                      <div className={`mt-1.5 flex items-center gap-1.5 rounded-lg border p-1.5 text-[11px] font-semibold ${sugarAnalysis.color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${sugarAnalysis.badge} animate-ping shrink-0`} />
                        <span><strong>{sugarAnalysis.category}:</strong> {sugarAnalysis.msg}</span>
                      </div>
                    )}
                  </div>
                )}
                {errors.sugarLevel && <p className="text-xs text-rose-400 font-medium">{errors.sugarLevel}</p>}
              </div>

              {/* ──────────────── 10. CBP - WBC COUNT ──────────────── */}
              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 text-teal-300" />
                    CBP - WBC Count
                  </span>
                  <span className="text-[10px] text-slate-400">/mcL</span>
                </label>
                {isSaved ? (
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3 text-sm font-semibold text-white">
                    <span>{form.wbcCount} cells/mcL</span>
                    {wbcAnalysis && (
                      <span className={`rounded-lg border px-2 py-0.5 text-xs font-bold ${wbcAnalysis.color}`}>
                        {wbcAnalysis.category}
                      </span>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="number"
                      min="500"
                      max="100000"
                      value={form.wbcCount}
                      onChange={(e) => handleChange("wbcCount", e.target.value)}
                      placeholder="e.g. 7200"
                      className={`w-full max-w-[180px] rounded-2xl border bg-black/40 py-2.5 px-4 text-sm text-white placeholder-slate-500 focus:border-teal-300 ${errors.wbcCount ? "border-rose-500/70" : "border-white/15"}`}
                    />
                    {wbcAnalysis && (
                      <div className={`mt-1.5 flex items-center gap-1.5 rounded-lg border p-1.5 text-[11px] font-semibold ${wbcAnalysis.color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${wbcAnalysis.badge} animate-ping shrink-0`} />
                        <span><strong>{wbcAnalysis.category}:</strong> {wbcAnalysis.msg}</span>
                      </div>
                    )}
                  </div>
                )}
                {errors.wbcCount && <p className="text-xs text-rose-400 font-medium">{errors.wbcCount}</p>}
              </div>

            </div>

            {/* ══════════════════════════════════════════════════════
                ACTION FOOTER ROW
               ══════════════════════════════════════════════════════ */}
            <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Left Actions: Back & Reset */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                <button
                  type="button"
                  onClick={() => router.push("/auth")}
                  className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-5 py-3 text-xs sm:text-sm font-bold text-slate-300 backdrop-blur-md hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetData}
                  className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-3 text-xs sm:text-sm font-bold text-rose-300 backdrop-blur-md hover:bg-rose-500/25 hover:border-rose-400/50 hover:text-rose-200 transition-all cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Right Actions: Save / Edit / Next */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {isSaved ? (
                  <>
                    {/* Unlock / Edit Button */}
                    <button
                      type="button"
                      onClick={() => setMode("editing")}
                      className="
                        flex items-center gap-2 rounded-2xl border border-teal-300/40 bg-teal-500/15
                        px-5 py-3 text-xs sm:text-sm font-bold text-teal-200 backdrop-blur-md
                        hover:bg-teal-500/25 transition-all cursor-pointer
                      "
                    >
                      <Edit3 className="h-4 w-4" />
                      <span>Edit Vitals</span>
                    </button>

                    {/* Proceed to Deep History Button (Next) */}
                    <button
                      type="button"
                      onClick={handleNext}
                      className="
                        flex items-center gap-2 rounded-2xl
                        bg-gradient-to-r from-[#99f6e4] via-[#67e8f9] to-[#a7f3d0]
                        hover:from-[#5eead4] hover:via-[#38bdf8] hover:to-[#6ee7b7]
                        px-8 py-3 text-xs sm:text-sm font-black uppercase tracking-wider
                        text-[#042f2e] shadow-[0_0_25px_rgba(94,234,212,0.6)]
                        hover:shadow-[0_0_35px_rgba(94,234,212,0.85)]
                        transition-all duration-300 cursor-pointer active:scale-[0.98]
                      "
                    >
                      <span>Next</span>
                      <ArrowRight className="h-4 w-4 stroke-[3]" />
                    </button>
                  </>
                ) : (
                  /* Save & Next Button */
                  <button
                    type="submit"
                    className="
                      flex items-center gap-2 rounded-2xl
                      bg-gradient-to-r from-teal-500 to-emerald-500
                      hover:from-teal-400 hover:to-emerald-400
                      px-8 py-3.5 text-xs sm:text-sm font-extrabold uppercase tracking-wider
                      text-white shadow-[0_0_20px_rgba(20,184,166,0.5)]
                      hover:shadow-[0_0_30px_rgba(20,184,166,0.7)]
                      transition-all duration-300 cursor-pointer active:scale-[0.98]
                      w-full sm:w-auto justify-center
                    "
                  >
                    <span>Next</span>
                    <ArrowRight className="h-4 w-4 stroke-[3]" />
                  </button>
                )}
              </div>

            </div>
          </form>

        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          OFFICIAL PATIENT ADMISSION RECEIPT MODAL
         ══════════════════════════════════════════════════════ */}
      <PatientReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
      />

      {/* ══════════════════════════════════════════════════════
          FOOTER CREDIT
         ══════════════════════════════════════════════════════ */}
      <footer className="mx-auto w-full max-w-6xl mt-8 text-center text-xs text-slate-400/70">
        <p>© 2026 Smart Triage Co-Pilot · Clinical Decision Support System for Rural PHCs</p>
      </footer>
    </main>
  );
}
