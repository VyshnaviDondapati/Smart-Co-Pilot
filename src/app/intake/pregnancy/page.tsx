"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Baby,
  Heart,
  AlertTriangle,
  Flame,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertOctagon,
  LogOut,
  Sparkles,
  Zap,
  Activity,
  Info,
  Calendar,
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
            "radial-gradient(circle at 20% 15%, rgba(168,85,247,0.22) 0%, transparent 45%), radial-gradient(circle at 80% 85%, rgba(236,72,153,0.18) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(15,23,42,0.8) 0%, transparent 100%)",
        }}
      />
      <div className="absolute top-[12%] left-[8%] h-96 w-96 rounded-full bg-purple-500/10 blur-3xl animate-pulse-glow" />
      <div
        className="absolute bottom-[10%] right-[10%] h-[450px] w-[450px] rounded-full bg-pink-500/10 blur-3xl animate-pulse-glow"
        style={{ animationDelay: "3s" }}
      />
      <div
        className="absolute top-[50%] left-[45%] h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl animate-pulse-glow"
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
    </div>
  );
}

export default function PregnancyAssessmentPage() {
  const router = useRouter();
  const { personal, vitals, pregnancy, updatePregnancy } = useIntake();

  // Local state initialized from context
  const [isPregnant, setIsPregnant] = useState(pregnancy.isPregnant);
  const [gestationalWeeks, setGestationalWeeks] = useState(pregnancy.gestationalWeeks || "");
  const [trimester, setTrimester] = useState(pregnancy.trimester || "");
  const [preEclampsiaFlags, setPreEclampsiaFlags] = useState<string[]>(pregnancy.preEclampsiaFlags || []);
  const [complications, setComplications] = useState<string[]>(pregnancy.complications || []);

  const bpSys = parseFloat(vitals.bpSystolic) || 0;
  const bpDia = parseFloat(vitals.bpDiastolic) || 0;
  const isHighBP = bpSys >= 140 || bpDia >= 90;

  // Auto-sync trimester from weeks
  useEffect(() => {
    const w = parseInt(gestationalWeeks, 10);
    if (!isNaN(w) && w > 0) {
      if (w <= 12) setTrimester("1st Trimester (1-12w)");
      else if (w <= 26) setTrimester("2nd Trimester (13-26w)");
      else setTrimester("3rd Trimester (27-40w)");
    }
  }, [gestationalWeeks]);

  const toggleFlag = (flag: string) => {
    setPreEclampsiaFlags((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]
    );
  };

  const toggleComplication = (comp: string) => {
    setComplications((prev) =>
      prev.includes(comp) ? prev.filter((c) => c !== comp) : [...prev, comp]
    );
  };

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();

    updatePregnancy({
      isPregnant,
      gestationalWeeks: isPregnant ? gestationalWeeks : "",
      trimester: isPregnant ? (trimester as any) : "",
      preEclampsiaFlags: isPregnant ? preEclampsiaFlags : [],
      complications: isPregnant ? complications : [],
    });

    router.push("/intake/summary");
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

  const isEclampsiaAlert =
    isPregnant &&
    (complications.includes("Active Vaginal Bleeding") ||
      complications.includes("Absent Fetal Movement") ||
      (isHighBP && preEclampsiaFlags.includes("Severe Frontal Headache")));

  return (
    <main className="relative min-h-screen w-full flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      <ClinicalBackground />

      {/* ══════════════════════════════════════════════════════
          TOP NAVIGATION & GLOBAL CODE RED HEADER
         ══════════════════════════════════════════════════════ */}
      <header className="mx-auto w-full max-w-6xl mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-white/15 bg-slate-900/40 p-4 sm:p-5 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-300 shadow-md">
            <Baby className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-bold text-white tracking-wide">
                Maternal &amp; Pregnancy Assessment
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
        <div className="w-full rounded-3xl border border-purple-400/30 bg-slate-950/50 p-6 sm:p-10 shadow-2xl backdrop-blur-2xl transition-all">
          
          {/* Header */}
          <div className="mb-8 border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <Baby className="h-7 w-7 text-purple-300" />
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Maternal &amp; Pregnancy Check
                </h1>
              </div>
              <p className="mt-1 text-sm text-slate-300 max-w-2xl">
                Check pregnant mothers for high blood pressure symptoms, bleeding, and baby well-being.
              </p>
            </div>

            {/* Patient Pill */}
            {personal.name && (
              <div className="flex items-center gap-2 rounded-2xl bg-black/40 border border-white/15 px-4 py-2 text-xs">
                <span className="text-slate-400">Patient:</span>
                <span className="font-bold text-white">{personal.name}</span>
                <span className="text-purple-400 font-semibold">({personal.age ? `${personal.age}yo` : ""} {personal.gender})</span>
              </div>
            )}
          </div>

          <form onSubmit={handleProceed} className="space-y-8">
            
            {/* ══════════════════════════════════════════════════
                TOP TOGGLE: IS THE PATIENT CURRENTLY PREGNANT?
               ══════════════════════════════════════════════════ */}
            <div className="p-6 rounded-3xl border border-purple-400/40 bg-purple-950/20 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/25 border border-purple-400 text-purple-300 shadow-md">
                  <Heart className="h-6 w-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Is the patient currently pregnant?
                  </h3>
                  <p className="text-xs text-slate-300">
                    If &quot;No&quot;, you can proceed directly to the summary.
                  </p>
                </div>
              </div>

              {/* Glowing Toggle Buttons */}
              <div className="flex items-center gap-2 bg-black/50 p-1.5 rounded-2xl border border-white/15">
                <button
                  type="button"
                  onClick={() => setIsPregnant(false)}
                  className={`
                    px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer
                    ${
                      !isPregnant
                        ? "bg-slate-700 text-white shadow-md"
                        : "text-slate-400 hover:text-white"
                    }
                  `}
                >
                  No (Not Pregnant)
                </button>
                <button
                  type="button"
                  onClick={() => setIsPregnant(true)}
                  className={`
                    px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer
                    ${
                      isPregnant
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.6)] scale-105"
                        : "text-slate-400 hover:text-white"
                    }
                  `}
                >
                  ✓ Yes (Pregnant)
                </button>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════
                EXPANDED SECTION (WHEN PREGNANT = TRUE)
               ══════════════════════════════════════════════════ */}
            {isPregnant ? (
              <div className="space-y-8 animate-fade-slide-in">
                
                {/* Gestational Age & Trimester Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 sm:p-6 rounded-2xl border border-white/10 bg-black/35 backdrop-blur-md">
                  <div className="space-y-2">
                    <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-200">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-purple-300" />
                        Pregnancy Weeks (Gestational Age)
                      </span>
                      <span className="text-[10px] text-slate-400">1 to 42 weeks</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="42"
                      value={gestationalWeeks}
                      onChange={(e) => setGestationalWeeks(e.target.value)}
                      placeholder="e.g. 28"
                      className="w-full rounded-2xl border border-white/15 bg-black/50 py-3.5 px-4 text-base font-extrabold text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-200">
                      Pregnancy Stage (Trimester)
                    </label>
                    <select
                      value={trimester}
                      onChange={(e) => setTrimester(e.target.value)}
                      className="w-full rounded-2xl border border-white/15 bg-black/50 py-3.5 px-4 text-sm font-bold text-white focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 cursor-pointer"
                    >
                      <option value="" className="bg-slate-900 text-slate-400">Select Stage...</option>
                      <option value="1st Trimester (1-12w)" className="bg-slate-900 text-white">1st Stage (Months 1 - 3 / Weeks 1 - 12)</option>
                      <option value="2nd Trimester (13-26w)" className="bg-slate-900 text-white">2nd Stage (Months 4 - 6 / Weeks 13 - 26)</option>
                      <option value="3rd Trimester (27-40w)" className="bg-slate-900 text-purple-300 font-bold">3rd Stage (Months 7 - 9+ / Weeks 27 - 40+)</option>
                    </select>
                  </div>
                </div>

                {/* Pre-Eclampsia Triggers (Auto-highlighted if BP was high) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
                      <Zap className="h-4 w-4 text-purple-400" />
                      High BP Symptoms in Pregnancy (Pre-Eclampsia)
                    </h3>
                    {isHighBP && (
                      <span className="rounded-full bg-amber-500/20 border border-amber-400/40 px-3 py-1 text-[11px] font-black text-amber-300 flex items-center gap-1.5 animate-pulse">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Blood Pressure High ({vitals.bpSystolic}/{vitals.bpDiastolic} mmHg) — Check Symptoms Below
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { id: "Severe Frontal Headache", label: "Severe Headache", desc: "Constant throbbing headache that does not stop with rest." },
                      { id: "Visual Blurring / Scotoma", label: "Blurry Vision", desc: "Seeing spots, flashes of light, or blurry vision." },
                      { id: "Epigastric / RUQ Pain", label: "Upper Stomach Pain", desc: "Sharp pain in upper stomach or under ribs." },
                      { id: "Severe Facial / Hand Edema", label: "Face & Hand Swelling", desc: "Sudden swelling in face, fingers, or hands." },
                    ].map((item) => {
                      const isSelected = preEclampsiaFlags.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleFlag(item.id)}
                          className={`
                            p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer space-y-2 flex flex-col justify-between
                            ${
                              isSelected
                                ? "bg-purple-500/25 border-purple-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] scale-[1.02]"
                                : "bg-black/30 border-white/10 text-slate-300 hover:bg-white/5 hover:border-white/20"
                            }
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs text-purple-200">{item.label}</span>
                            <span className={`h-2.5 w-2.5 rounded-full ${isSelected ? "bg-purple-400 animate-ping" : "bg-white/20"}`} />
                          </div>
                          <p className="text-[11px] text-slate-300 leading-snug">{item.desc}</p>
                          <span className="text-[10px] font-black uppercase text-purple-300">
                            {isSelected ? "✓ Selected" : "+ Click to Select"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Acute Obstetric Red Flags */}
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-rose-300 flex items-center gap-2">
                    <Flame className="h-4 w-4 text-rose-400" />
                    Emergency Pregnancy Signs (Immediate Doctor Care)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: "Active Vaginal Bleeding", label: "Bleeding", desc: "Any active bleeding or blood spotting during pregnancy." },
                      { id: "Absent Fetal Movement", label: "Baby Not Moving", desc: "No baby kicks or movement felt for hours." },
                      { id: "Severe Uterine Cramping / Leaking", label: "Severe Cramps / Water Leak", desc: "Strong belly cramps or watery fluid leaking." },
                    ].map((item) => {
                      const isSelected = complications.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleComplication(item.id)}
                          className={`
                            p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer space-y-2 flex flex-col justify-between
                            ${
                              isSelected
                                ? "bg-rose-500/30 border-rose-400 text-white shadow-[0_0_25px_rgba(244,63,94,0.5)] scale-[1.02]"
                                : "bg-black/30 border-white/10 text-slate-300 hover:bg-white/5 hover:border-white/20"
                            }
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs text-rose-200">{item.label}</span>
                            <span className={`h-2.5 w-2.5 rounded-full ${isSelected ? "bg-rose-400 animate-ping" : "bg-white/20"}`} />
                          </div>
                          <p className="text-[11px] text-slate-300 leading-snug">{item.desc}</p>
                          <span className="text-[10px] font-black uppercase text-rose-400">
                            {isSelected ? "🚨 EMERGENCY FLAGGED" : "+ Click to Select"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            ) : (
              /* Collapsed State Info */
              <div className="p-6 rounded-2xl border border-white/10 bg-black/20 text-center space-y-2 text-slate-400 text-xs">
                <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto" />
                <p className="font-bold text-slate-200">Patient marked as not pregnant.</p>
                <p>Click below to proceed directly to the summary.</p>
              </div>
            )}

            {/* ══════════════════════════════════════════════════
                ACTION NAVIGATION FOOTER
               ══════════════════════════════════════════════════ */}
            <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => router.push("/intake/diabetes")}
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
                    bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400
                    hover:from-purple-300 hover:to-rose-300
                    px-8 py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider
                    text-slate-950 shadow-[0_0_25px_rgba(216,70,239,0.6)]
                    hover:shadow-[0_0_35px_rgba(216,70,239,0.85)]
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

