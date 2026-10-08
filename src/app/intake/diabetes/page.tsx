"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Flame,
  Zap,
  TestTube2,
  CheckCircle2,
  AlertOctagon,
  LogOut,
  Stethoscope,
  Info,
  Sparkles,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useIntake } from "@/context/IntakeContext";
import CodeRedTraumaModal from "@/components/CodeRedTraumaModal";

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

export default function DiabetesAssessmentPage() {
  const router = useRouter();
  const { personal, vitals, diabetes, updateDiabetes } = useIntake();

  // Local state initialized from context (with auto-fill from vitals.sugarLevel)
  const [glucose, setGlucose] = useState(diabetes.glucoseLevel || vitals.sugarLevel || "");
  const [classification, setClassification] = useState(diabetes.classification || "None");
  const [isHypoglycemic, setIsHypoglycemic] = useState(diabetes.isHypoglycemic);
  const [hasDKASigns, setHasDKASigns] = useState(diabetes.hasDKASigns);
  const [hasFootUlcers, setHasFootUlcers] = useState(diabetes.hasFootUlcers);
  const [symptoms, setSymptoms] = useState<string[]>(diabetes.symptoms || []);

  // Sync glucose from vitals if available and not set
  useEffect(() => {
    if (vitals.sugarLevel && !glucose) {
      setGlucose(vitals.sugarLevel);
    }
  }, [vitals.sugarLevel, glucose]);

  // Auto classification logic based on glucose reading
  useEffect(() => {
    const sugarNum = parseFloat(glucose);
    if (!isNaN(sugarNum) && sugarNum > 0) {
      if (sugarNum < 70) {
        setIsHypoglycemic(true);
      }
      if (sugarNum >= 250) {
        if (classification === "None") {
          setClassification("Suspected Prediabetes / Diabetes");
        }
      } else if (sugarNum >= 140) {
        if (classification === "None") {
          setClassification("Suspected Prediabetes / Diabetes");
        }
      }
    }
  }, [glucose]);

  const toggleSymptom = (item: string) => {
    setSymptoms((prev) =>
      prev.includes(item) ? prev.filter((s) => s !== item) : [...prev, item]
    );
  };

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();

    // Update global state
    updateDiabetes({
      glucoseLevel: glucose,
      classification: classification as any,
      isHypoglycemic,
      hasDKASigns,
      hasFootUlcers,
      symptoms,
    });

    // Dynamic branching:
    // If Female -> /intake/pregnancy
    // If Male / Other -> Skip to /intake/summary
    if (personal.gender === "Female") {
      router.push("/intake/pregnancy");
    } else {
      router.push("/intake/summary");
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

  const glucoseNum = parseFloat(glucose) || 0;
  const isHighAlert = glucoseNum >= 250 || hasDKASigns;
  const isHypoAlert = (glucoseNum > 0 && glucoseNum < 70) || isHypoglycemic;

  return (
    <main className="relative min-h-screen w-full flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      <ClinicalBackground />

      {/* ══════════════════════════════════════════════════════
          TOP NAVIGATION & GLOBAL CODE RED HEADER
         ══════════════════════════════════════════════════════ */}
      <header className="mx-auto w-full max-w-6xl mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-white/15 bg-slate-900/40 p-4 sm:p-5 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/20 border border-teal-400/30 text-teal-300 shadow-md">
            <TestTube2 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-bold text-white tracking-wide">
                Specialized Metabolic Screening
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Fast-Track 1-Tap Code Red Trauma Button */}
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
        <div className="w-full rounded-3xl border border-cyan-400/30 bg-slate-950/50 p-6 sm:p-10 shadow-2xl backdrop-blur-2xl transition-all">
          
          {/* Header */}
          <div className="mb-8 border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <TestTube2 className="h-7 w-7 text-cyan-300" />
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Diabetes &amp; Blood Sugar Check
                </h1>
              </div>
              <p className="mt-1 text-sm text-slate-300 max-w-2xl">
                Check blood sugar levels, look for urgent sugar emergencies, and check for foot wounds.
              </p>
            </div>

            {/* Patient Pill */}
            {personal.name && (
              <div className="flex items-center gap-2 rounded-2xl bg-black/40 border border-white/15 px-4 py-2 text-xs">
                <span className="text-slate-400">Patient:</span>
                <span className="font-bold text-white">{personal.name}</span>
                <span className="text-teal-400 font-semibold">({personal.age ? `${personal.age}yo` : ""} {personal.gender})</span>
              </div>
            )}
          </div>

          <form onSubmit={handleProceed} className="space-y-8">
            
            {/* ══════════════════════════════════════════════════
                ROW 1: AUTO-FILLED GLUCOSE & CLASSIFICATION
               ══════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 sm:p-6 rounded-2xl border border-white/10 bg-black/35 backdrop-blur-md">
              
              {/* Blood Glucose Input */}
              <div className="space-y-2">
                <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-cyan-300" />
                    Blood Sugar Level (Auto-Filled)
                  </span>
                  <span className="text-[10px] text-slate-400">mg/dL</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={glucose}
                    onChange={(e) => setGlucose(e.target.value)}
                    placeholder="e.g. 140"
                    className="w-full rounded-2xl border border-white/15 bg-black/50 py-3.5 px-4 text-base font-extrabold text-white placeholder-slate-500 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                  />
                  {vitals.sugarLevel && (
                    <span className="absolute right-3 top-3 rounded-md bg-teal-500/20 border border-teal-400/30 px-2 py-0.5 text-[10px] font-bold text-teal-300">
                      Synced from Vitals
                    </span>
                  )}
                </div>

                {/* Real-time Indicator */}
                {glucoseNum > 0 && (
                  <div
                    className={`mt-2 flex items-center gap-2 rounded-xl p-2.5 text-xs font-semibold border ${
                      glucoseNum < 70
                        ? "bg-rose-500/20 border-rose-400 text-rose-300 animate-pulse"
                        : glucoseNum <= 140
                        ? "bg-emerald-500/15 border-emerald-400 text-emerald-300"
                        : glucoseNum <= 199
                        ? "bg-amber-500/15 border-amber-400 text-amber-300"
                        : "bg-rose-500/20 border-rose-400 text-rose-300 animate-pulse"
                    }`}
                  >
                    {glucoseNum < 70 ? (
                      <>
                        <TrendingDown className="h-4 w-4 shrink-0 text-rose-400" />
                        <span><strong>Very Low Sugar (&lt; 70 mg/dL):</strong> Needs sugar or glucose immediately.</span>
                      </>
                    ) : glucoseNum <= 140 ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                        <span><strong>Normal Sugar Range:</strong> Healthy blood sugar level (&lt; 140 mg/dL).</span>
                      </>
                    ) : glucoseNum <= 199 ? (
                      <>
                        <TrendingUp className="h-4 w-4 shrink-0 text-amber-400" />
                        <span><strong>High Sugar (140-199 mg/dL):</strong> Borderline high sugar level.</span>
                      </>
                    ) : (
                      <>
                        <Flame className="h-4 w-4 shrink-0 text-rose-400" />
                        <span><strong>Very High Sugar (≥ 200 mg/dL):</strong> Needs doctor checkup.</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Diabetes Diagnostic Classification */}
              <div className="space-y-2">
                <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-teal-300" />
                    Diabetes Type / Status
                  </span>
                  <span className="text-[10px] text-teal-300 font-semibold">Category</span>
                </label>
                <select
                  value={classification}
                  onChange={(e) => setClassification(e.target.value as any)}
                  className="w-full rounded-2xl border border-white/15 bg-black/50 py-3.5 px-4 text-sm font-bold text-white focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 cursor-pointer"
                >
                  <option value="None" className="bg-slate-900 text-white">None (No Diabetes)</option>
                  <option value="Suspected Prediabetes / Diabetes" className="bg-slate-900 text-amber-300 font-bold">Suspected High Sugar / Diabetes</option>
                  <option value="Type 1" className="bg-slate-900 text-white">Type 1 Diabetes (Takes Daily Insulin)</option>
                  <option value="Type 2" className="bg-slate-900 text-white">Type 2 Diabetes (Common Adult Diabetes)</option>
                  <option value="Gestational" className="bg-slate-900 text-purple-300">Diabetes During Pregnancy</option>
                  <option value="Other" className="bg-slate-900 text-white">Other Sugar Problem</option>
                </select>
                <p className="text-[11px] text-slate-400">
                  Auto-selected as <strong>Suspected High Sugar</strong> if sugar &gt; 140 mg/dL.
                </p>
              </div>

            </div>

            {/* ══════════════════════════════════════════════════
                ROW 2: EMERGENCY SCREENING CHECKLIST (INTERACTIVE)
               ══════════════════════════════════════════════════ */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                Emergency Signs &amp; Red Flags
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. Hypoglycemia Signs Card */}
                <button
                  type="button"
                  onClick={() => setIsHypoglycemic(!isHypoglycemic)}
                  className={`
                    p-5 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3
                    ${
                      isHypoglycemic
                        ? "bg-rose-500/25 border-rose-400 text-white shadow-[0_0_25px_rgba(244,63,94,0.45)] scale-[1.02]"
                        : "bg-black/30 border-white/10 text-slate-300 hover:bg-white/5 hover:border-white/20"
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-rose-300 font-extrabold text-xs uppercase tracking-wider">
                      <TrendingDown className="h-4 w-4" />
                      <span>1. Very Low Sugar (Hypoglycemia)</span>
                    </div>
                    <span className={`h-3 w-3 rounded-full ${isHypoglycemic ? "bg-rose-400 animate-ping" : "bg-white/20"}`} />
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    Cold sweats, shaking hands, dizziness, confusion, weakness, or sudden extreme hunger.
                  </p>
                  <span className="text-[10px] font-black uppercase text-rose-400">
                    {isHypoglycemic ? "⚠️ Low Sugar Alert (Emergency)" : "Click to Select"}
                  </span>
                </button>

                {/* 2. DKA Crisis Signs Card */}
                <button
                  type="button"
                  onClick={() => setHasDKASigns(!hasDKASigns)}
                  className={`
                    p-5 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3
                    ${
                      hasDKASigns
                        ? "bg-rose-500/25 border-rose-400 text-white shadow-[0_0_25px_rgba(244,63,94,0.45)] scale-[1.02]"
                        : "bg-black/30 border-white/10 text-slate-300 hover:bg-white/5 hover:border-white/20"
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-rose-300 font-extrabold text-xs uppercase tracking-wider">
                      <Flame className="h-4 w-4" />
                      <span>2. High Sugar Emergency (DKA)</span>
                    </div>
                    <span className={`h-3 w-3 rounded-full ${hasDKASigns ? "bg-rose-400 animate-ping" : "bg-white/20"}`} />
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    Fruity smell in breath, fast deep breathing, nonstop vomiting, extreme dry mouth.
                  </p>
                  <span className="text-[10px] font-black uppercase text-rose-400">
                    {hasDKASigns ? "⚠️ High Sugar Emergency Alert" : "Click to Select"}
                  </span>
                </button>

                {/* 3. Foot Ulcers & Neuropathy Card */}
                <button
                  type="button"
                  onClick={() => setHasFootUlcers(!hasFootUlcers)}
                  className={`
                    p-5 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3
                    ${
                      hasFootUlcers
                        ? "bg-amber-500/25 border-amber-400 text-white shadow-[0_0_25px_rgba(251,191,36,0.45)] scale-[1.02]"
                        : "bg-black/30 border-white/10 text-slate-300 hover:bg-white/5 hover:border-white/20"
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-300 font-extrabold text-xs uppercase tracking-wider">
                      <AlertOctagon className="h-4 w-4" />
                      <span>3. Foot Wounds / Numbness (Ulcers)</span>
                    </div>
                    <span className={`h-3 w-3 rounded-full ${hasFootUlcers ? "bg-amber-400 animate-ping" : "bg-white/20"}`} />
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    Wounds on feet not healing, numbness or tingling in toes, or dark skin/infection.
                  </p>
                  <span className="text-[10px] font-black uppercase text-amber-400">
                    {hasFootUlcers ? "⚠️ Foot Wound Alert" : "Click to Select"}
                  </span>
                </button>

              </div>
            </div>

            {/* ══════════════════════════════════════════════════
                ROW 3: COMMON ASSOCIATED SYMPTOMS CHIPS
               ══════════════════════════════════════════════════ */}
            <div className="p-5 rounded-2xl border border-white/10 bg-black/30 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Other Symptoms (Click to Select)
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "Excessive Thirst (Drinking lots of water)",
                  "Frequent Urination (Peeing often)",
                  "Sudden Weight Loss",
                  "Blurry Vision",
                  "Extreme Tiredness & Weakness",
                  "Slow Wound Healing",
                  "Frequent Skin Infections",
                ].map((symptom) => {
                  const active = symptoms.includes(symptom);
                  return (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() => toggleSymptom(symptom)}
                      className={`
                        px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer
                        ${
                          active
                            ? "bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-md"
                            : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
                        }
                      `}
                    >
                      {active ? "✓ " : "+ "}
                      {symptom}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ══════════════════════════════════════════════════
                ACTION NAVIGATION FOOTER
               ══════════════════════════════════════════════════ */}
            <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => router.push("/intake/history")}
                className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-6 py-3 text-xs sm:text-sm font-bold text-slate-300 backdrop-blur-md hover:bg-white/10 hover:text-white transition-all cursor-pointer w-full sm:w-auto justify-center"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="submit"
                  className="
                    flex items-center gap-2 rounded-2xl
                    bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400
                    hover:from-cyan-300 hover:to-emerald-300
                    px-8 py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider
                    text-slate-950 shadow-[0_0_25px_rgba(45,212,191,0.6)]
                    hover:shadow-[0_0_35px_rgba(45,212,191,0.85)]
                    transition-all duration-300 cursor-pointer active:scale-[0.98]
                    w-full sm:w-auto justify-center
                  "
                >
                  <span>Next</span>
                  <ArrowRight className="h-4 w-4 stroke-[3]" />
                </button>
              </div>

            </div>
          </form>

        </div>
      </div>

      <footer className="mx-auto w-full max-w-6xl mt-8 text-center text-xs text-slate-400/70">
        <p>© 2026 Smart Triage Co-Pilot · Clinical Decision Support System for Rural PHCs</p>
      </footer>
    </main>
  );
}

