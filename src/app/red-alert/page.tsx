"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertOctagon,
  Flame,
  Zap,
  Ambulance,
  HeartCrack,
  User,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Brain,
  Wind,
  ShieldAlert,
  Radio,
  Clock,
  Stethoscope,
} from "lucide-react";
import { useIntake } from "@/context/IntakeContext";

const emergencyCategories = [
  {
    id: "RTA",
    label: "Accident / Severe Injury",
    icon: Ambulance,
  },
  {
    id: "Cardiac",
    label: "Heart Attack / Severe Chest Pain",
    icon: HeartCrack,
  },
  {
    id: "Bleeding",
    label: "Heavy Bleeding",
    icon: Flame,
  },
  {
    id: "Head",
    label: "Head Injury / Unconscious",
    icon: Brain,
  },
  {
    id: "Resp",
    label: "Severe Breathing Problem / Choking",
    icon: Wind,
  },
  {
    id: "Maternal",
    label: "Pregnancy Emergency",
    icon: Zap,
  },
];

export default function RedAlertPage() {
  const router = useRouter();
  const { triggerCodeRedTrauma } = useIntake();

  const [patientName, setPatientName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Accident / Severe Injury");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dispatchedRecord, setDispatchedRecord] = useState<any>(null);

  const handleDispatch = async () => {
    setIsSubmitting(true);
    try {
      const nameToUse = patientName.trim() || "Emergency Red Alert Patient";
      const record = await triggerCodeRedTrauma(
        selectedCategory + (notes.trim() ? ` — Notes: ${notes.trim()}` : ""),
        nameToUse
      );
      setDispatchedRecord(record || { name: nameToUse });
    } catch (err) {
      console.error("Red alert dispatch failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between overflow-x-hidden selection:bg-rose-500 selection:text-white">
      
      {/* ── Atmospheric Ambient Lighting ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-rose-600/25 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-red-600/20 blur-[130px] rounded-full" />
        <div className="absolute top-1/3 -left-32 w-[400px] h-[400px] bg-amber-600/15 blur-[110px] rounded-full" />
      </div>

      {/* ── Top Header Navigation ── */}
      <header className="relative z-10 w-full border-b border-rose-500/20 bg-slate-950/70 backdrop-blur-xl px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <Link
              href="/intake"
              className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Vitals</span>
            </Link>

            <div className="h-4 w-px bg-white/15 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-black uppercase tracking-widest text-rose-400">
                Priority 1 Emergency Sentry
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1 text-[11px] font-bold text-rose-300">
              Dr. Arvind Rao (Sentry Duty)
            </span>
          </div>

        </div>
      </header>

      {/* ── Main Content Container ── */}
      <main className="relative z-10 flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col justify-center">
        
        {!dispatchedRecord ? (
          <div className="rounded-3xl border-2 border-rose-500/70 bg-slate-900/80 backdrop-blur-3xl p-6 sm:p-10 shadow-[0_0_80px_rgba(244,63,94,0.35)] space-y-8 animate-fade-slide-in">
            
            {/* Header Title Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-500/25 pb-6">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-rose-500/20 border-2 border-rose-400 text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.6)]">
                  <AlertOctagon className="h-9 w-9 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-full bg-rose-600 text-white px-3 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-md">
                      LEVEL 1 CODE RED
                    </span>
                    <span className="text-xs text-rose-300 font-bold tracking-wide flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> Direct Doctor Queue Bypass
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white mt-1.5 tracking-tight">
                    Emergency Red Alert Dispatch
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                    Instantly create an immediate Priority 1 ticket in the Doctor Workspace. Form requirements are bypassed for urgent resuscitation.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Fields: Patient Name & Optional Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-teal-400" />
                  Patient Name or Identifying Token
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Unknown Male (~35yo) or Patient Name"
                  className="w-full rounded-2xl border border-white/20 bg-black/60 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  <Stethoscope className="h-3.5 w-3.5 text-rose-400" />
                  Quick Clinical Note (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Unresponsive, heavy blood loss, pulse thready"
                  className="w-full rounded-2xl border border-white/20 bg-black/60 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition-all"
                />
              </div>
            </div>

            {/* Emergency Categories Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-200">
                  Select Primary Emergency Category:
                </label>
                <span className="text-[10px] text-rose-300 font-bold">1-Click Selection</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {emergencyCategories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.label;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.label)}
                      className={`
                        w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer
                        ${
                          isSelected
                            ? "bg-rose-600/30 border-rose-400 text-white shadow-[0_0_25px_rgba(244,63,94,0.4)] scale-[1.02]"
                            : "bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:border-white/20 hover:text-white"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl border shrink-0 ${isSelected ? "bg-rose-500/40 border-rose-300 text-white" : "bg-black/40 border-white/15 text-slate-400"}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <h4 className="text-sm font-black text-white leading-snug">
                          {cat.label}
                        </h4>
                      </div>

                      <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 ${isSelected ? "border-rose-300 bg-rose-500" : "border-white/30 bg-transparent"}`}>
                        {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions Row */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => router.push("/intake")}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleDispatch}
                disabled={isSubmitting}
                className="
                  w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl
                  bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500
                  px-8 py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider text-white
                  shadow-[0_0_35px_rgba(244,63,94,0.7)] transition-all cursor-pointer disabled:opacity-50 active:scale-95
                "
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Confirming…</span>
                  </>
                ) : (
                  <>
                    <AlertOctagon className="h-5 w-5 animate-pulse" />
                    <span>Confirm</span>
                  </>
                )}
              </button>
            </div>

          </div>
        ) : (
          /* Success Screen */
          <div className="rounded-3xl border-2 border-rose-500 bg-slate-900/90 backdrop-blur-3xl p-8 sm:p-12 shadow-[0_0_100px_rgba(244,63,94,0.5)] text-center space-y-6 animate-fade-slide-in">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-rose-500/20 border-2 border-rose-400 text-rose-300 shadow-[0_0_50px_rgba(244,63,94,0.8)] animate-pulse">
              <Ambulance className="h-12 w-12 text-rose-400" />
            </div>

            <div>
              <span className="rounded-full bg-rose-500 text-white px-4 py-1 text-xs font-black uppercase tracking-widest shadow-lg">
                PRIORITY 1 (RED) COMMITTED
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mt-3">
                Emergency Red Alert Dispatched
              </h2>
              <p className="text-sm text-slate-300 mt-1.5 max-w-md mx-auto">
                Patient <strong>{patientName || "Emergency Red Alert Patient"}</strong> is now assigned to the top of the Doctor Queue.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-rose-400/30 bg-rose-950/40 text-left text-sm space-y-2.5 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-400">Emergency Reason:</span>
                <span className="font-bold text-white text-right">{selectedCategory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Triage Queue:</span>
                <span className="font-bold text-rose-400">Priority 1 (Red Emergency)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Attending Doctor:</span>
                <span className="font-bold text-teal-300">Dr. Arvind Rao (On Duty)</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/intake"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-white/20 bg-white/5 text-xs font-bold text-slate-300 hover:bg-white/10 transition-all text-center"
              >
                New Vitals Intake
              </Link>

              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="
                  w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500
                  hover:from-rose-400 hover:to-amber-400
                  px-8 py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider text-slate-950
                  shadow-xl transition-all cursor-pointer hover:scale-105 active:scale-95
                "
              >
                <span>Open Doctor Queue</span>
                <ArrowRight className="h-4 w-4 stroke-[3]" />
              </button>
            </div>
          </div>
        )}

      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 w-full py-4 text-center text-xs text-slate-500">
        Smart Triage Co-Pilot · Emergency Decision Support &amp; Red Alert Sentry
      </footer>

    </div>
  );
}

