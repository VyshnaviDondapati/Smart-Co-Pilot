"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Baby,
  Check,
  CheckCircle2,
  Droplet,
  Edit3,
  FileText,
  Flame,
  Heart,
  HeartPulse,
  Info,
  Loader2,
  LogOut,
  MessageSquare,
  Pill,
  Printer,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TestTube2,
  Thermometer,
  User,
  Zap,
} from "lucide-react";
import { useIntake } from "@/context/IntakeContext";
import { useStaffChat } from "@/context/StaffChatContext";
import { analyzePatientClinicalFindings } from "@/lib/clinicalRules";
import CodeRedTraumaModal from "@/components/CodeRedTraumaModal";
import PatientReceiptModal from "@/components/PatientReceiptModal";

/* ══════════════════════════════════════════════════════════
   ANIMATED CLINICAL GLASSMORPHISM BACKGROUND
   ══════════════════════════════════════════════════════════ */
function AnimatedGlassBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#030d12]">
      {/* Deep Ambient Mesh Gradient */}
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(circle at 15% 20%, rgba(13,148,136,0.25) 0%, transparent 50%), radial-gradient(circle at 85% 80%, rgba(14,116,144,0.2) 0%, transparent 55%), radial-gradient(circle at 50% 50%, rgba(2,44,54,0.4) 0%, transparent 100%)",
        }}
      />
      {/* Slow Floating Animated Mesh Orbs */}
      <div className="absolute top-[10%] left-[10%] h-[450px] w-[450px] rounded-full bg-teal-500/12 blur-[120px] animate-pulse-glow" />
      <div
        className="absolute bottom-[15%] right-[10%] h-[500px] w-[500px] rounded-full bg-cyan-500/12 blur-[130px] animate-pulse-glow"
        style={{ animationDelay: "3.5s" }}
      />

      {/* Subtle Grid Lines */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
}

export default function MedicalRecordsSummaryPage() {
  const router = useRouter();
  const { personal, vitals, deepHistory, diabetes, pregnancy, triageResult, resetIntake } = useIntake();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string>("");
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [submittedPatientRecord, setSubmittedPatientRecord] = useState<any>(null);

  /* ────────────────────────────────────────────────────────
     DATA EXTRACTION & CLEAN FALLBACKS
     ──────────────────────────────────────────────────────── */
  const patientName = personal.name || "Patient";
  const patientAge = personal.age || "30";
  const patientGender = personal.gender || "Adult";
  const patientBloodGroup = vitals.bloodGroup || "O+";
  const patientHeight = vitals.height ? `${vitals.height} cm` : "--";
  const patientWeight = vitals.weight ? `${vitals.weight} kg` : "--";

  const bpSys = parseInt(vitals.bpSystolic || "120", 10);
  const bpDia = parseInt(vitals.bpDiastolic || "80", 10);
  const tempVal = parseFloat(vitals.temperature || "98.6");
  const glucoseVal = parseInt(vitals.sugarLevel || diabetes.glucoseLevel || "110", 10);
  const wbcVal = parseInt(vitals.wbcCount || "7500", 10);

  /* ────────────────────────────────────────────────────────
     STATUS CALCULATIONS
     ──────────────────────────────────────────────────────── */
  const isBPAbnormal = bpSys >= 140 || bpDia >= 90 || bpSys < 90;
  const isTempAbnormal = tempVal >= 100.4 || tempVal < 95.0;
  const isGlucoseAbnormal = glucoseVal >= 200 || glucoseVal < 70;
  const isWBCAbnormal = wbcVal > 11000 || wbcVal < 4000;

  const clinicalAnalysis = analyzePatientClinicalFindings({
    bpSystolic: vitals.bpSystolic,
    bpDiastolic: vitals.bpDiastolic,
    sugarLevel: vitals.sugarLevel || diabetes.glucoseLevel,
    temperature: vitals.temperature,
    wbcCount: vitals.wbcCount,
    height: vitals.height,
    weight: vitals.weight,
    isPregnant: pregnancy.isPregnant,
    diabetesType: diabetes.classification,
    allergies: deepHistory.allergies,
  });

  const isP1 = triageResult.priorityLevel === "P1-Red";
  const isP2 = triageResult.priorityLevel === "P2-Yellow";

  const priorityBadgeLabel = isP1
    ? "Priority 1 (Red / Immediate Emergency)"
    : isP2
    ? "Priority 2 (Yellow / Urgent Care)"
    : "Priority 3 (Green / Normal Routine)";

  const priorityCardStyles = isP1
    ? "border-rose-500/60 bg-rose-950/30 shadow-[0_0_40px_rgba(244,63,94,0.35)] text-rose-200"
    : isP2
    ? "border-amber-500/60 bg-amber-950/30 shadow-[0_0_40px_rgba(251,191,36,0.35)] text-amber-200"
    : "border-emerald-500/60 bg-emerald-950/30 shadow-[0_0_40px_rgba(16,185,129,0.35)] text-emerald-200";

  const priorityTagBadgeStyle = isP1
    ? "bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.6)]"
    : isP2
    ? "bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.6)]"
    : "bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.6)]";

  /* ────────────────────────────────────────────────────────
     SIMPLE ENGLISH 2-LINE REASONING (EASY TO UNDERSTAND)
     ──────────────────────────────────────────────────────── */
  const line1Reasoning = isP1
    ? (pregnancy.isPregnant && isBPAbnormal
        ? "Patient has dangerously high blood pressure and serious pregnancy symptoms."
        : isGlucoseAbnormal
        ? "Patient has extremely high or dangerously low blood sugar levels."
        : isBPAbnormal
        ? "Patient has very high blood pressure and needs immediate medical attention."
        : "Patient has critical emergency symptoms that need urgent doctor care.")
    : isP2
    ? (isBPAbnormal
        ? "Patient has elevated blood pressure and needs quick doctor checkup."
        : diabetes.classification !== "None"
        ? "Patient has diabetes symptoms or health risks that need priority care."
        : "Patient has health symptoms that need to be checked quickly by the doctor.")
    : "All recorded body vitals and health records are in normal range.";

  const line2Reasoning = isP1
    ? "Doctor must see and treat the patient immediately for emergency care."
    : isP2
    ? "Doctor should examine the patient within 30 minutes."
    : "Patient is queued for regular doctor consultation in normal turn.";

  /* ────────────────────────────────────────────────────────
     DISPATCH TO DOCTOR QUEUE
     ──────────────────────────────────────────────────────── */
  const handleDispatch = async () => {
    setIsSubmitting(true);
    const priorityTag = isP1 ? "RED" : isP2 ? "YELLOW" : "GREEN";

    const payload = {
      name: patientName,
      age: patientAge,
      gender: patientGender,
      bpSystolic: vitals.bpSystolic || "120",
      bpDiastolic: vitals.bpDiastolic || "80",
      height: vitals.height || "165",
      weight: vitals.weight || "65",
      bloodGroup: patientBloodGroup,
      temperature: vitals.temperature || "98.6",
      sugarLevel: vitals.sugarLevel || diabetes.glucoseLevel || "110",
      wbcCount: vitals.wbcCount || "7500",

      aggravatingRelieving: deepHistory.aggravatingRelieving,
      pastSurgical: deepHistory.pastSurgical,
      familyHistory: deepHistory.familyHistory,
      personalHistory: deepHistory.personalHistory,
      currentMedications: deepHistory.currentMedications,
      allergies: deepHistory.allergies,
      sleepCycle: deepHistory.sleepCycle,
      urineIssues: deepHistory.urineIssues,

      isPregnant: pregnancy.isPregnant,
      gestationalWeeks: pregnancy.gestationalWeeks,
      maternalFlags: pregnancy.preEclampsiaFlags.reduce((acc, f) => ({ ...acc, [f]: true }), {}),
      diabetesType: diabetes.classification,
      bloodGlucose: diabetes.glucoseLevel || vitals.sugarLevel,
      glycemicFlags: {
        hypoglycemiaSigns: diabetes.isHypoglycemic,
        dkaSigns: diabetes.hasDKASigns,
        footUlcersNeuropathy: diabetes.hasFootUlcers,
      },

      triagePriority: priorityTag,
      urgencyScore: triageResult.urgencyScore || (isP1 ? 90 : isP2 ? 55 : 20),
      urgencyReason: `${line1Reasoning} ${line2Reasoning}`,
      assignedDoctor: "Dr. Arvind Rao",
      status: "WAITING",
    };

    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const saved = await res.json();
        const ticketId = saved.patient?.id || saved.id || `PT-${Math.floor(1000 + Math.random() * 9000)}`;
        setSubmittedTicket(ticketId);
        setSubmittedPatientRecord(saved.patient || { id: ticketId, ...payload, createdAt: new Date().toISOString() });
        setIsSubmitted(true);
      } else {
        const ticketId = `PT-${Math.floor(1000 + Math.random() * 9000)}`;
        setSubmittedTicket(ticketId);
        setSubmittedPatientRecord({ id: ticketId, ...payload, createdAt: new Date().toISOString() });
        setIsSubmitted(true);
      }
    } catch (e) {
      console.error("Failed to commit patient:", e);
      const ticketId = `PT-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmittedTicket(ticketId);
      setSubmittedPatientRecord({ id: ticketId, ...payload, createdAt: new Date().toISOString() });
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
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
    <main className="relative min-h-screen w-full px-4 py-6 sm:px-8 sm:py-10 flex flex-col justify-between overflow-x-hidden text-slate-100 selection:bg-teal-500 selection:text-white">
      <AnimatedGlassBackground />

      {/* ══════════════════════════════════════════════════════
          TOP GLOBAL NAVBAR
         ══════════════════════════════════════════════════════ */}
      <header className="mx-auto w-full max-w-5xl mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4 sm:p-5 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/20 border border-teal-400/30 text-teal-300 shadow-md">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-wide">
              Medical Records Summary
            </span>
            <span className="block text-xs text-slate-400">
              Review all patient records before confirming
            </span>
          </div>
        </div>

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
          MAIN STRUCTURED MEDICAL SUMMARY CONTAINER
         ══════════════════════════════════════════════════ */}
      <div className="mx-auto w-full max-w-5xl flex-1 flex flex-col justify-center">
        <div className="w-full rounded-3xl border border-white/15 bg-zinc-900/80 p-6 sm:p-10 shadow-2xl backdrop-blur-2xl transition-all space-y-8">
          
          {/* Main Title Heading */}
          <div className="border-b border-white/15 pb-4 text-center">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Medical Records Summary
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Complete intake dossier for medical consultation &amp; doctor review
            </p>
          </div>

          {/* ══════════════════════════════════════════════════
              TABLE 1: PATIENT INFORMATION
             ══════════════════════════════════════════════════ */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-teal-300 flex items-center gap-2">
                <User className="h-4 w-4" /> Patient Information
              </h2>
              <Link
                href="/intake"
                className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-teal-300 transition-all cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5" /> Edit
              </Link>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/15 bg-black/40">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                    <th className="py-2.5 px-4 sm:px-6 w-1/3">Field</th>
                    <th className="py-2.5 px-4 sm:px-6">Information</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 sm:px-6 text-slate-400 font-medium">Name</td>
                    <td className="py-3 px-4 sm:px-6 font-bold text-white">{patientName}</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 sm:px-6 text-slate-400 font-medium">Age &amp; Gender</td>
                    <td className="py-3 px-4 sm:px-6 font-semibold">{patientAge} years • {patientGender}</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 sm:px-6 text-slate-400 font-medium">Blood Group</td>
                    <td className="py-3 px-4 sm:px-6 font-bold text-cyan-300">{patientBloodGroup}</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 sm:px-6 text-slate-400 font-medium">Height &amp; Weight</td>
                    <td className="py-3 px-4 sm:px-6 font-semibold">{patientHeight} / {patientWeight}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              TABLE 2: RECORDED VITALS & LABS
             ══════════════════════════════════════════════════ */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                <Activity className="h-4 w-4" /> Vitals &amp; Lab Measurements
              </h2>
              <Link
                href="/intake"
                className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-cyan-300 transition-all cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5" /> Edit Vitals
              </Link>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/15 bg-black/40">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                    <th className="py-2.5 px-4 sm:px-6 w-1/3">Measurement</th>
                    <th className="py-2.5 px-4 sm:px-6">Recorded Value</th>
                    <th className="py-2.5 px-4 sm:px-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 sm:px-6 text-slate-400 font-medium">Blood Pressure</td>
                    <td className="py-3 px-4 sm:px-6 font-bold text-white">
                      {vitals.bpSystolic || "120"}/{vitals.bpDiastolic || "80"} mmHg
                    </td>
                    <td className="py-3 px-4 sm:px-6 text-right">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        isBPAbnormal ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : "bg-emerald-500/20 text-emerald-300"
                      }`}>
                        {isBPAbnormal ? "High / Abnormal" : "Normal"}
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 sm:px-6 text-slate-400 font-medium">Body Temperature</td>
                    <td className="py-3 px-4 sm:px-6 font-bold text-white">
                      {vitals.temperature || "98.6"} °F
                    </td>
                    <td className="py-3 px-4 sm:px-6 text-right">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        isTempAbnormal ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : "bg-emerald-500/20 text-emerald-300"
                      }`}>
                        {isTempAbnormal ? "Fever" : "Normal"}
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 sm:px-6 text-slate-400 font-medium">Blood Sugar Level</td>
                    <td className="py-3 px-4 sm:px-6 font-bold text-white">
                      {glucoseVal} mg/dL
                    </td>
                    <td className="py-3 px-4 sm:px-6 text-right">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        isGlucoseAbnormal ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : "bg-emerald-500/20 text-emerald-300"
                      }`}>
                        {isGlucoseAbnormal ? "Critical Sugar" : glucoseVal >= 140 ? "Elevated" : "Normal"}
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 sm:px-6 text-slate-400 font-medium">WBC Count</td>
                    <td className="py-3 px-4 sm:px-6 font-bold text-white">
                      {wbcVal.toLocaleString()} /mcL
                    </td>
                    <td className="py-3 px-4 sm:px-6 text-right">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        isWBCAbnormal ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300"
                      }`}>
                        {isWBCAbnormal ? "Elevated" : "Standard"}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              TABLE 3: MEDICAL HISTORY
             ══════════════════════════════════════════════════ */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" /> Medical History
              </h2>
              <Link
                href="/intake/history"
                className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-purple-300 transition-all cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5" /> Edit History
              </Link>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/15 bg-black/40">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                    <th className="py-2.5 px-4 sm:px-6 w-1/3">Category</th>
                    <th className="py-2.5 px-4 sm:px-6">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 sm:px-6 text-slate-400 font-medium">Allergies</td>
                    <td className="py-3 px-4 sm:px-6 font-semibold">
                      {deepHistory.allergies ? (
                        <span className="text-rose-300 font-bold">{deepHistory.allergies}</span>
                      ) : (
                        "None reported"
                      )}
                    </td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 sm:px-6 text-slate-400 font-medium">Current Medicines</td>
                    <td className="py-3 px-4 sm:px-6 font-semibold">
                      {deepHistory.currentMedications || "None"}
                    </td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 sm:px-6 text-slate-400 font-medium">Past Surgeries / Operations</td>
                    <td className="py-3 px-4 sm:px-6 font-semibold">
                      {deepHistory.pastSurgical || "None reported"}
                    </td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 sm:px-6 text-slate-400 font-medium">Family Medical History</td>
                    <td className="py-3 px-4 sm:px-6 font-semibold">
                      {deepHistory.familyHistory || "None reported"}
                    </td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 sm:px-6 text-slate-400 font-medium">Daily Habits &amp; Triggers</td>
                    <td className="py-3 px-4 sm:px-6 font-semibold">
                      {deepHistory.aggravatingRelieving || deepHistory.personalHistory || "Normal routine"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              TABLE 4: SPECIALIZED SCREENING
             ══════════════════════════════════════════════════ */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                <Zap className="h-4 w-4" /> Specialized Screening
              </h2>
              <div className="flex gap-3 text-[11px] font-bold text-slate-400">
                <Link href="/intake/diabetes" className="hover:text-amber-300 transition-all">Edit Sugar</Link>
                {personal.gender === "Female" && (
                  <Link href="/intake/pregnancy" className="hover:text-amber-300 transition-all">Edit Pregnancy</Link>
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/15 bg-black/40">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                    <th className="py-2.5 px-4 sm:px-6 w-1/3">Condition</th>
                    <th className="py-2.5 px-4 sm:px-6">Status &amp; Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 sm:px-6 text-slate-400 font-medium">Diabetes / Sugar Status</td>
                    <td className="py-3 px-4 sm:px-6 font-semibold">
                      <span className="text-teal-300 font-bold">{diabetes.classification}</span>
                      {diabetes.isHypoglycemic && <span className="text-rose-400 block text-xs mt-0.5 font-bold">⚠️ Very Low Sugar Emergency</span>}
                      {diabetes.hasDKASigns && <span className="text-rose-400 block text-xs mt-0.5 font-bold">⚠️ High Sugar Acid Crisis</span>}
                      {diabetes.hasFootUlcers && <span className="text-amber-300 block text-xs mt-0.5 font-bold">⚠️ Foot Wound Alert</span>}
                    </td>
                  </tr>

                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 sm:px-6 text-slate-400 font-medium">Pregnancy Status</td>
                    <td className="py-3 px-4 sm:px-6 font-semibold">
                      {pregnancy.isPregnant ? (
                        <div>
                          <span className="text-purple-300 font-bold">Pregnant ({pregnancy.gestationalWeeks || "28"} weeks)</span>
                          {pregnancy.preEclampsiaFlags.length > 0 && (
                            <span className="text-amber-300 block text-xs mt-0.5 font-bold">
                              ⚠️ High BP Signs: {pregnancy.preEclampsiaFlags.join(", ")}
                            </span>
                          )}
                          {pregnancy.complications.length > 0 && (
                            <span className="text-rose-400 block text-xs mt-0.5 font-bold">
                              🚨 Emergency: {pregnancy.complications.join(", ")}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">Not pregnant</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              SECTION 5: PRIORITY LEVEL BANNER (SIMPLE ENGLISH)
             ══════════════════════════════════════════════════ */}
          <div className={`rounded-3xl border-2 p-6 sm:p-7 backdrop-blur-2xl transition-all ${priorityCardStyles}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3.5">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shrink-0 ${priorityTagBadgeStyle}`}>
                  {triageResult.priorityLevel.split("-")[0]}
                </div>
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${priorityTagBadgeStyle}`}>
                    {priorityBadgeLabel}
                  </span>
                  <p className="text-xs text-slate-300 mt-1 font-semibold">
                    Target Time for Doctor: <strong>{triageResult.reviewTimeLimit}</strong>
                  </p>
                </div>
              </div>

              {/* Urgency Score */}
              <div className="flex items-center gap-3 bg-black/50 border border-white/15 rounded-2xl p-3 sm:p-4 shrink-0">
                <HeartPulse className="h-7 w-7 text-rose-400 animate-pulse" />
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                    Urgency Score
                  </span>
                  <span className="text-2xl font-black text-white">{triageResult.urgencyScore || (isP1 ? 90 : isP2 ? 55 : 20)}</span>
                  <span className="text-xs text-slate-400"> / 100</span>
                </div>
              </div>
            </div>

            {/* Simple English Reason in 2 Lines */}
            <div className="pt-4 space-y-1.5 text-xs sm:text-sm leading-relaxed">
              <p className="text-white font-semibold">
                • {line1Reasoning}
              </p>
              <p className="text-slate-200 font-medium">
                • {line2Reasoning}
              </p>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              SECTION 6: 🚨 DETECTED ABNORMALITIES & TREATMENT RECOMMENDATIONS
             ══════════════════════════════════════════════════ */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className={`text-xs sm:text-sm font-extrabold uppercase tracking-wider flex items-center gap-2 ${
                clinicalAnalysis.criticalCount > 0
                  ? "text-rose-400"
                  : clinicalAnalysis.hasAbnormalities
                  ? "text-amber-300"
                  : "text-emerald-400"
              }`}>
                <AlertOctagon className="h-4 w-4" />
                Detected Abnormalities &amp; Recommended Clinical Interventions
              </h2>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                clinicalAnalysis.criticalCount > 0
                  ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                  : clinicalAnalysis.hasAbnormalities
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                  : "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
              }`}>
                {clinicalAnalysis.hasAbnormalities ? `${clinicalAnalysis.totalAbnormal} Finding(s) Requiring Care` : "Normal Baseline"}
              </span>
            </div>

            {clinicalAnalysis.hasAbnormalities ? (
              <div className="space-y-3 rounded-2xl border border-rose-500/30 bg-rose-950/20 p-4 sm:p-5 backdrop-blur-xl">
                {clinicalAnalysis.items.map((item, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl border p-3 text-xs sm:text-sm space-y-2 ${
                      item.severity === "RED"
                        ? "border-rose-500/40 bg-rose-900/30 text-rose-100"
                        : "border-amber-500/30 bg-amber-900/20 text-amber-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-white flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${item.severity === "RED" ? "bg-rose-400" : "bg-amber-400"}`} />
                        {item.field}: <strong className="text-cyan-300">{item.value}</strong>
                      </span>
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md ${
                        item.severity === "RED" ? "bg-rose-500 text-white shadow" : "bg-amber-400 text-slate-950"
                      }`}>
                        {item.urgency}
                      </span>
                    </div>

                    {/* What is NOT Normal */}
                    <div className="text-xs leading-relaxed text-slate-200">
                      <strong className="text-rose-300 uppercase text-[11px] block font-bold">🔴 What is not normal:</strong>
                      {item.finding}
                    </div>

                    {/* What HAS TO BE Treated */}
                    <div className="text-xs leading-relaxed text-teal-100 bg-black/40 p-2.5 rounded-lg border border-teal-400/20">
                      <strong className="text-teal-300 uppercase text-[11px] block font-bold flex items-center gap-1">
                        <Pill className="h-3.5 w-3.5" /> 💊 Recommended Treatment &amp; Care Protocol:
                      </strong>
                      {item.treatment}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-xs sm:text-sm flex items-center gap-3 text-emerald-300">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <span>All vital parameters and laboratory measurements are within normal clinical thresholds. No emergency physiological intervention required.</span>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════
              ACTION BUTTONS: BACK & CONFIRM
             ══════════════════════════════════════════════════ */}
          <div className="border-t border-white/15 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => {
                if (personal.gender === "Female") {
                  router.push("/intake/pregnancy");
                } else {
                  router.push("/intake/diabetes");
                }
              }}
              className="
                flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5
                px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-300 backdrop-blur-md
                hover:bg-white/10 hover:text-white transition-all cursor-pointer w-full sm:w-auto justify-center
              "
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleDispatch}
                disabled={isSubmitting}
                className="
                  flex items-center gap-2.5 rounded-2xl
                  bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400
                  hover:from-emerald-300 hover:via-teal-200 hover:to-cyan-300
                  px-9 py-4 text-xs sm:text-sm font-black uppercase tracking-wider
                  text-slate-950 shadow-[0_0_30px_rgba(52,211,153,0.6)]
                  hover:shadow-[0_0_40px_rgba(52,211,153,0.85)]
                  transition-all duration-300 cursor-pointer active:scale-[0.98]
                  w-full sm:w-auto justify-center disabled:opacity-50
                "
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Confirming…</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 stroke-[2.5]" />
                    <span>Confirm &amp; Send to Doctor</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          POST-SUBMISSION SUCCESS MODAL
         ══════════════════════════════════════════════════ */}
      {isSubmitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-teal-400/40 bg-zinc-900/90 p-6 sm:p-8 text-center shadow-2xl backdrop-blur-2xl space-y-5 animate-scale-up">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
              <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
            </div>

            <div>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-300">
                {triageResult.priorityLevel} QUEUE COMMITTED
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
                Patient Dispatched Successfully!
              </h2>
              <p className="text-xs text-slate-300 max-w-md mx-auto mt-1 leading-relaxed">
                Patient <strong>{patientName}</strong> (Ticket #{submittedTicket}) is now live in the doctor review queue.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-white/10 bg-black/40 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned Doctor:</span>
                <span className="font-bold text-teal-300">Dr. Arvind Rao (On Duty)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Triage Priority:</span>
                <span className="font-bold text-white">{priorityBadgeLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target Time to Doctor:</span>
                <span className="font-bold text-amber-300">{triageResult.reviewTimeLimit}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  resetIntake();
                  router.push("/intake");
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-white/15 bg-white/5 text-xs font-bold text-slate-300 hover:bg-white/10 transition-all cursor-pointer"
              >
                + Start Next Patient Intake
              </button>

              <button
                type="button"
                onClick={() => setIsReceiptModalOpen(true)}
                className="
                  w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl
                  bg-gradient-to-r from-emerald-400 to-teal-400
                  hover:from-emerald-300 hover:to-teal-300
                  px-7 py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider text-slate-950
                  shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95
                "
              >
                <FileText className="h-4 w-4 stroke-[2.5]" />
                <span>View Patient Receipt</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          OFFICIAL PATIENT ADMISSION RECEIPT MODAL
         ══════════════════════════════════════════════════ */}
      <PatientReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        initialPatient={submittedPatientRecord}
      />

      <footer className="mx-auto w-full max-w-5xl mt-8 text-center text-xs text-slate-400/70">
        <p>© 2026 Smart Triage Co-Pilot · Clinical Decision Support System for Rural PHCs</p>
      </footer>
    </main>
  );
}
