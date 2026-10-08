"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Loader2,
  TrendingUp,
  Scissors,
  Dna,
  HeartHandshake,
  Pill,
  AlertTriangle,
  Moon,
  Droplet,
  LogOut,
  Stethoscope,
} from "lucide-react";
import { useIntake } from "@/context/IntakeContext";
import CodeRedTraumaModal from "@/components/CodeRedTraumaModal";

/* ─────────── Form Data Type ─────────── */
interface DeepHistoryData {
  aggravatingRelieving: string;
  pastSurgical: string;
  familyHistory: string;
  personalHistory: string;
  currentMedications: string;
  allergies: string;
  sleepCycle: string;
  urineIssues: string;
}

const initialForm: DeepHistoryData = {
  aggravatingRelieving: "",
  pastSurgical: "",
  familyHistory: "",
  personalHistory: "",
  currentMedications: "",
  allergies: "",
  sleepCycle: "",
  urineIssues: "",
};

/* ═══════════════════════════════════════════════════════════════
   ANIMATED ABSTRACT CLINICAL BACKGROUND
   ═══════════════════════════════════════════════════════════════ */
function ClinicalBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#040f14]">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 20% 15%, rgba(13,148,136,0.22) 0%, transparent 45%), radial-gradient(circle at 80% 85%, rgba(6,182,212,0.18) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(15,23,42,0.8) 0%, transparent 100%)",
        }}
      />
      <div className="absolute top-[12%] left-[8%] h-96 w-96 rounded-full bg-teal-500/10 blur-3xl animate-pulse-glow" />
      <div
        className="absolute bottom-[10%] right-[10%] h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-3xl animate-pulse-glow"
        style={{ animationDelay: "3s" }}
      />
      <div
        className="absolute top-[50%] left-[45%] h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl animate-pulse-glow"
        style={{ animationDelay: "1.5s" }}
      />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute top-1/3 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-teal-400/20 to-transparent overflow-hidden">
        <div className="h-full w-48 bg-gradient-to-r from-transparent via-teal-300 to-transparent animate-ecg-scan" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT: PATIENT DEEP HISTORY (PHASE 2)
   ═══════════════════════════════════════════════════════════════ */
export default function DeepHistoryPage() {
  const router = useRouter();
  const { deepHistory, updateDeepHistory } = useIntake();

  /* ── State ── */
  const [form, setForm] = useState<DeepHistoryData>({
    aggravatingRelieving: deepHistory.aggravatingRelieving || initialForm.aggravatingRelieving,
    pastSurgical: deepHistory.pastSurgical || initialForm.pastSurgical,
    familyHistory: deepHistory.familyHistory || initialForm.familyHistory,
    personalHistory: deepHistory.personalHistory || initialForm.personalHistory,
    currentMedications: deepHistory.currentMedications || initialForm.currentMedications,
    allergies: deepHistory.allergies || initialForm.allergies,
    sleepCycle: deepHistory.sleepCycle || initialForm.sleepCycle,
    urineIssues: deepHistory.urineIssues || initialForm.urineIssues,
  });
  const [isSaving, setIsSaving] = useState(false);

  /* ── Handlers ── */
  const handleChange = (field: keyof DeepHistoryData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleClearAll = () => {
    setForm(initialForm);
  };

  const handleSaveAndProceed = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    updateDeepHistory(form);

    // Save and route to Dedicated Diabetes Assessment Page
    setTimeout(() => {
      setIsSaving(false);
      router.push("/intake/diabetes");
    }, 400);
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

  return (
    <main className="relative min-h-screen w-full flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      <ClinicalBackground />

      {/* ══════════════════════════════════════════════════════
          TOP NAVIGATION & STATUS BAR
         ══════════════════════════════════════════════════════ */}
      <header className="mx-auto w-full max-w-6xl mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-white/15 bg-slate-900/40 p-4 sm:p-5 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/20 border border-teal-400/30 text-teal-300 shadow-md">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-wide">
                Nurse Triage Station
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <CodeRedTraumaModal />

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
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <FileText className="h-6 w-6 text-teal-300" />
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Patient Deep History
                </h1>
              </div>
              <p className="mt-1 text-sm text-slate-300 max-w-2xl">
                Enter the patient&apos;s past health history, operations, medicines, and daily habits below.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearAll}
                className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Clear Fields</span>
              </button>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              RESPONSIVE 2-COLUMN GRID (8 TEXTAREA FIELDS)
             ══════════════════════════════════════════════════════ */}
          <form onSubmit={handleSaveAndProceed} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* 1. AGGRAVATING & RELIEVING FACTORS */}
              <div className="space-y-2">
                <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-teal-300" />
                    1. What Makes Symptoms Better or Worse?
                  </span>
                  <span className="text-[10px] text-teal-300 font-semibold">Triggers</span>
                </label>
                <p className="text-[11px] text-slate-400">
                  What triggers the symptoms or brings relief? (e.g. food, rest, walking, posture)
                </p>
                <textarea
                  rows={3}
                  value={form.aggravatingRelieving}
                  onChange={(e) => handleChange("aggravatingRelieving", e.target.value)}
                  placeholder="e.g. Pain increases when walking; relieved by sitting or rest..."
                  className="w-full rounded-2xl border border-white/15 bg-black/35 p-3.5 text-sm text-white placeholder-slate-500 backdrop-blur-md transition-all focus:border-teal-300 focus:bg-black/55 focus:ring-2 focus:ring-teal-400/20 resize-y"
                />
              </div>

              {/* 2. PAST SURGICAL HISTORY */}
              <div className="space-y-2">
                <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Scissors className="h-3.5 w-3.5 text-teal-300" />
                    2. Past Surgeries &amp; Operations
                  </span>
                  <span className="text-[10px] text-teal-300 font-semibold">Operations</span>
                </label>
                <p className="text-[11px] text-slate-400">
                  Past operations, approximate year, and recovery.
                </p>
                <textarea
                  rows={3}
                  value={form.pastSurgical}
                  onChange={(e) => handleChange("pastSurgical", e.target.value)}
                  placeholder="e.g. Appendix surgery (2018), Knee operation (2021)..."
                  className="w-full rounded-2xl border border-white/15 bg-black/35 p-3.5 text-sm text-white placeholder-slate-500 backdrop-blur-md transition-all focus:border-teal-300 focus:bg-black/55 focus:ring-2 focus:ring-teal-400/20 resize-y"
                />
              </div>

              {/* 3. FAMILY HISTORY */}
              <div className="space-y-2">
                <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Dna className="h-3.5 w-3.5 text-cyan-300" />
                    3. Family Health History
                  </span>
                  <span className="text-[10px] text-cyan-300 font-semibold">Family Conditions</span>
                </label>
                <p className="text-[11px] text-slate-400">
                  Health issues in family members (e.g. high BP, diabetes, heart problem, asthma).
                </p>
                <textarea
                  rows={3}
                  value={form.familyHistory}
                  onChange={(e) => handleChange("familyHistory", e.target.value)}
                  placeholder="e.g. Father has diabetes; Mother has high blood pressure..."
                  className="w-full rounded-2xl border border-white/15 bg-black/35 p-3.5 text-sm text-white placeholder-slate-500 backdrop-blur-md transition-all focus:border-teal-300 focus:bg-black/55 focus:ring-2 focus:ring-teal-400/20 resize-y"
                />
              </div>

              {/* 4. PERSONAL HISTORY */}
              <div className="space-y-2">
                <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <HeartHandshake className="h-3.5 w-3.5 text-emerald-300" />
                    4. Daily Habits &amp; Diet
                  </span>
                  <span className="text-[10px] text-emerald-300 font-semibold">Habits &amp; Diet</span>
                </label>
                <p className="text-[11px] text-slate-400">
                  Food habits, smoking, alcohol use, or daily physical activity.
                </p>
                <textarea
                  rows={3}
                  value={form.personalHistory}
                  onChange={(e) => handleChange("personalHistory", e.target.value)}
                  placeholder="e.g. Non-smoker, vegetarian food, walks daily in morning..."
                  className="w-full rounded-2xl border border-white/15 bg-black/35 p-3.5 text-sm text-white placeholder-slate-500 backdrop-blur-md transition-all focus:border-teal-300 focus:bg-black/55 focus:ring-2 focus:ring-teal-400/20 resize-y"
                />
              </div>

              {/* 5. CURRENT MEDICATIONS */}
              <div className="space-y-2">
                <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Pill className="h-3.5 w-3.5 text-teal-300" />
                    5. Current Medicines
                  </span>
                  <span className="text-[10px] text-teal-300 font-semibold">Medicines</span>
                </label>
                <p className="text-[11px] text-slate-400">
                  Medicines and tablets the patient takes daily.
                </p>
                <textarea
                  rows={3}
                  value={form.currentMedications}
                  onChange={(e) => handleChange("currentMedications", e.target.value)}
                  placeholder="e.g. BP tablet in the morning, sugar tablet before meals..."
                  className="w-full rounded-2xl border border-white/15 bg-black/35 p-3.5 text-sm text-white placeholder-slate-500 backdrop-blur-md transition-all focus:border-teal-300 focus:bg-black/55 focus:ring-2 focus:ring-teal-400/20 resize-y"
                />
              </div>

              {/* 6. ALLERGIES */}
              <div className="space-y-2">
                <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-300" />
                    6. Allergies
                  </span>
                  <span className="text-[10px] text-amber-300 font-semibold">Reactions</span>
                </label>
                <p className="text-[11px] text-slate-400">
                  Bad reactions or allergies to medicines, foods, or dust.
                </p>
                <textarea
                  rows={3}
                  value={form.allergies}
                  onChange={(e) => handleChange("allergies", e.target.value)}
                  placeholder="e.g. Allergic to Penicillin medicine, dust allergy..."
                  className="w-full rounded-2xl border border-white/15 bg-black/35 p-3.5 text-sm text-white placeholder-slate-500 backdrop-blur-md transition-all focus:border-teal-300 focus:bg-black/55 focus:ring-2 focus:ring-teal-400/20 resize-y"
                />
              </div>

              {/* 7. SLEEP CYCLE */}
              <div className="space-y-2">
                <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Moon className="h-3.5 w-3.5 text-indigo-300" />
                    7. Sleep Habits
                  </span>
                  <span className="text-[10px] text-indigo-300 font-semibold">Sleep</span>
                </label>
                <p className="text-[11px] text-slate-400">
                  Hours of sleep per night and any sleeping problems.
                </p>
                <textarea
                  rows={3}
                  value={form.sleepCycle}
                  onChange={(e) => handleChange("sleepCycle", e.target.value)}
                  placeholder="e.g. Sleeps 6 hours, wakes up frequently at night..."
                  className="w-full rounded-2xl border border-white/15 bg-black/35 p-3.5 text-sm text-white placeholder-slate-500 backdrop-blur-md transition-all focus:border-teal-300 focus:bg-black/55 focus:ring-2 focus:ring-teal-400/20 resize-y"
                />
              </div>

              {/* 8. URINE ISSUES */}
              <div className="space-y-2">
                <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Droplet className="h-3.5 w-3.5 text-teal-300" />
                    8. Urine &amp; Bladder Problems
                  </span>
                  <span className="text-[10px] text-teal-300 font-semibold">Bladder</span>
                </label>
                <p className="text-[11px] text-slate-400">
                  Burning sensation, frequent urination, pain, or difficulty passing urine.
                </p>
                <textarea
                  rows={3}
                  value={form.urineIssues}
                  onChange={(e) => handleChange("urineIssues", e.target.value)}
                  placeholder="e.g. Burning feeling while passing urine, waking up at night to urinate..."
                  className="w-full rounded-2xl border border-white/15 bg-black/35 p-3.5 text-sm text-white placeholder-slate-500 backdrop-blur-md transition-all focus:border-teal-300 focus:bg-black/55 focus:ring-2 focus:ring-teal-400/20 resize-y"
                />
              </div>

            </div>

            {/* ══════════════════════════════════════════════════════
                ACTION FOOTER ROW
               ══════════════════════════════════════════════════════ */}
            <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => router.push("/intake")}
                className="
                  flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5
                  px-6 py-3 text-xs sm:text-sm font-bold text-slate-300 backdrop-blur-md
                  hover:bg-white/10 hover:text-white transition-all cursor-pointer w-full sm:w-auto justify-center
                "
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="
                  flex items-center gap-2 rounded-2xl
                  bg-gradient-to-r from-[#99f6e4] via-[#67e8f9] to-[#a7f3d0]
                  hover:from-[#5eead4] hover:via-[#38bdf8] hover:to-[#6ee7b7]
                  px-8 py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider
                  text-[#042f2e] shadow-[0_0_25px_rgba(94,234,212,0.6)]
                  hover:shadow-[0_0_35px_rgba(94,234,212,0.85)]
                  transition-all duration-300 cursor-pointer active:scale-[0.98]
                  w-full sm:w-auto justify-center disabled:opacity-60
                "
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#042f2e]" />
                    <span>Processing…</span>
                  </>
                ) : (
                  <>
                    <span>Next</span>
                    <ArrowRight className="h-4 w-4 stroke-[3]" />
                  </>
                )}
              </button>

            </div>
          </form>

        </div>
      </div>

      {/* Footer */}
      <footer className="mx-auto w-full max-w-6xl mt-8 text-center text-xs text-slate-400/70">
        <p>© 2026 Smart Triage Co-Pilot · Clinical Decision Support System for Rural PHCs</p>
      </footer>
    </main>
  );
}
