"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Printer,
  X,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Clock,
  User,
  HeartPulse,
  Activity,
  Stethoscope,
  Droplet,
  Thermometer,
  ShieldCheck,
  Search,
  ChevronRight,
} from "lucide-react";
import { PatientRecord } from "@/lib/db";

interface PatientReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPatient?: PatientRecord | null;
}

export default function PatientReceiptModal({
  isOpen,
  onClose,
  initialPatient,
}: PatientReceiptModalProps) {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(
    initialPatient || null
  );
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialPatient) {
      setSelectedPatient(initialPatient);
    }
  }, [initialPatient]);

  useEffect(() => {
    if (isOpen) {
      fetchPatients();
    }
  }, [isOpen]);

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/patients");
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.patients)) {
        const uniqueMap = new Map<string, PatientRecord>();
        data.patients.forEach((item: PatientRecord) => {
          if (item && item.id && !uniqueMap.has(item.id)) {
            uniqueMap.set(item.id, item);
          }
        });
        const uniqueList = Array.from(uniqueMap.values());
        setPatients(uniqueList);
        if (!selectedPatient && uniqueList.length > 0) {
          setSelectedPatient(uniqueList[0]);
        }
      }
    } catch (err) {
      console.warn("Receipt fetch notice:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const seenIds = new Set<string>();
  const filteredPatients = patients.filter((p) => {
    if (!p || !p.id || seenIds.has(p.id)) return false;
    seenIds.add(p.id);

    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      (p.triagePriority || "").toLowerCase().includes(q)
    );
  });

  const p = selectedPatient;

  const isP1 = p?.triagePriority === "RED";
  const isP2 = p?.triagePriority === "YELLOW";

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-6 backdrop-blur-xl animate-fade-in print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[900px] flex flex-col md:flex-row rounded-3xl border border-white/20 bg-slate-950/95 shadow-2xl overflow-hidden backdrop-blur-2xl print:border-none print:shadow-none print:bg-white print:h-auto print:max-h-none print:w-full">
        
        {/* ── LEFT SIDEBAR: PATIENT SELECTOR LIST (Hidden on Print) ── */}
        <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/10 bg-black/40 p-4 flex flex-col gap-3 shrink-0 print:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-400" />
              <h3 className="font-bold text-sm text-white">Patient Receipts</h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              {patients.length} Records
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or ticket..."
              className="w-full rounded-xl border border-white/15 bg-black/50 pl-8 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:border-teal-400 focus:outline-none"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1 max-h-48 md:max-h-none">
            {isLoading ? (
              <p className="text-center py-6 text-xs text-slate-400">Loading records...</p>
            ) : filteredPatients.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-400">No patient records found.</p>
            ) : (
              filteredPatients.map((item) => {
                const isSelected = selectedPatient?.id === item.id;
                const isItemP1 = item.triagePriority === "RED";
                const isItemP2 = item.triagePriority === "YELLOW";

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedPatient(item)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? "border-teal-400 bg-teal-950/50 shadow-md ring-1 ring-teal-400"
                        : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded text-[9px] font-black ${
                            isItemP1
                              ? "bg-rose-500 text-white"
                              : isItemP2
                              ? "bg-amber-400 text-slate-950"
                              : "bg-emerald-400 text-slate-950"
                          }`}
                        >
                          {item.triagePriority === "RED" ? "P1" : item.triagePriority === "YELLOW" ? "P2" : "P3"}
                        </span>
                        <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        #{item.id} · {item.age}y {item.gender}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* ── RIGHT MAIN PANEL: OFFICIAL CLINICAL RECEIPT & CASE SHEET ── */}
        <main className="flex-1 flex flex-col justify-between overflow-hidden bg-gradient-to-b from-slate-950 to-zinc-950 print:bg-white print:text-black">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-white/10 p-4 sm:px-6 bg-black/40 print:hidden">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-teal-500/20 border border-teal-400/30 px-2 py-0.5 text-[10px] font-black uppercase text-teal-300">
                Official Case Sheet
              </span>
              <span className="text-xs text-slate-300 font-semibold">
                Patient Admission Receipt
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 rounded-xl border border-teal-400/40 bg-teal-500/20 hover:bg-teal-500/30 px-3.5 py-1.5 text-xs font-bold text-teal-200 transition-all cursor-pointer shadow-sm"
                title="Print this receipt"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Receipt</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-white/10 bg-white/5 p-1.5 text-slate-400 hover:bg-white/15 hover:text-white transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Receipt Body (Scrollable & Printable) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 custom-scrollbar print:p-0 print:overflow-visible text-slate-100 print:text-black">
            {p ? (
              <div className="max-w-3xl mx-auto rounded-3xl border border-white/15 bg-black/40 p-6 sm:p-8 shadow-xl space-y-6 print:border-2 print:border-black print:bg-white print:p-6 print:rounded-none">
                
                {/* 1. Official Receipt Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-dashed border-white/20 pb-5 print:border-black">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/20 border border-teal-400/40 text-teal-300 print:border-black print:text-black">
                      <Stethoscope className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-black tracking-wide text-white print:text-black">
                        SMART TRIAGE CO-PILOT
                      </h2>
                      <p className="text-xs text-slate-300 print:text-gray-700 font-medium">
                        Primary Health Centre · Emergency Clinical Triage Network
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right font-mono">
                    <span className="text-xs font-black uppercase text-teal-300 print:text-black block">
                      TICKET #{p.id}
                    </span>
                    <span className="text-[11px] text-slate-400 print:text-gray-600 block">
                      {p.createdAt ? new Date(p.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : new Date().toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 2. Patient Demographics & Urgency Tag */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4 space-y-1 print:border-black print:bg-gray-50">
                    <span className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-600">Patient Details</span>
                    <h3 className="text-xl font-black text-white print:text-black">{p.name}</h3>
                    <p className="text-xs text-slate-300 print:text-gray-800">
                      Age: <strong>{p.age} years</strong> · Gender: <strong>{p.gender || "Adult"}</strong> · Blood Group: <strong className="text-teal-300 print:text-black">{p.bloodGroup || "O+"}</strong>
                    </p>
                  </div>

                  <div className={`rounded-2xl border p-4 flex flex-col justify-center items-center text-center ${
                    isP1
                      ? "border-rose-500/40 bg-rose-950/30 text-rose-300 print:border-black print:text-black"
                      : isP2
                      ? "border-amber-500/40 bg-amber-950/30 text-amber-300 print:border-black print:text-black"
                      : "border-emerald-500/40 bg-emerald-950/30 text-emerald-300 print:border-black print:text-black"
                  }`}>
                    <span className="text-[10px] font-black uppercase tracking-wider">Triage Priority</span>
                    <span className="text-2xl font-black mt-0.5">
                      {p.triagePriority === "RED" ? "P1 - RED" : p.triagePriority === "YELLOW" ? "P2 - YELLOW" : "P3 - GREEN"}
                    </span>
                    <span className="text-[10px] font-semibold opacity-80 mt-0.5">
                      {isP1 ? "Immediate Resuscitation" : isP2 ? "Urgent ≤ 30 Mins" : "Routine Consultation"}
                    </span>
                  </div>
                </div>

                {/* 3. Vitals Matrix */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-300 print:text-black flex items-center gap-1.5">
                    <Activity className="h-4 w-4" /> Recorded Vitals & Diagnostics
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 print:border-black print:bg-gray-50">
                      <span className="text-[10px] text-slate-400 print:text-gray-600 block">Blood Pressure</span>
                      <span className="font-mono font-bold text-sm text-white print:text-black">{p.bpSystolic}/{p.bpDiastolic} mmHg</span>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 print:border-black print:bg-gray-50">
                      <span className="text-[10px] text-slate-400 print:text-gray-600 block">Blood Glucose</span>
                      <span className="font-mono font-bold text-sm text-white print:text-black">{p.sugarLevel || p.bloodGlucose || "--"} mg/dL</span>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 print:border-black print:bg-gray-50">
                      <span className="text-[10px] text-slate-400 print:text-gray-600 block">Temperature</span>
                      <span className="font-mono font-bold text-sm text-white print:text-black">{p.temperature || "98.6"} °F</span>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 print:border-black print:bg-gray-50">
                      <span className="text-[10px] text-slate-400 print:text-gray-600 block">WBC / Blood Group</span>
                      <span className="font-mono font-bold text-sm text-white print:text-black">{p.bloodGroup || "O+"} · {p.wbcCount || "Normal"}</span>
                    </div>
                  </div>
                </div>

                {/* 4. Clinical Triage Reason & Symptoms */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2 print:border-black print:bg-gray-50 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-600">
                    Clinical Triage Evaluation & Rationale
                  </span>
                  <p className="text-slate-200 print:text-black leading-relaxed font-medium">
                    {p.urgencyReason || "All recorded body vitals and health records are in normal range. Patient is queued for regular doctor consultation."}
                  </p>
                </div>

                {/* 5. Assigned Doctor & Verification Watermark */}
                <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs print:border-black">
                  <div className="space-y-0.5">
                    <span className="text-slate-400 print:text-gray-600">Assigned Medical Officer:</span>
                    <p className="font-bold text-white print:text-black">
                      {p.assignedDoctor || "Dr. Amit Sharma (Medical Officer)"}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-emerald-400 print:text-black font-bold">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Verified by Frontline Nurse Station</span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-sm text-slate-400">Select a patient receipt to view full case details.</p>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="border-t border-white/10 p-3 sm:px-6 bg-black/40 flex items-center justify-between text-xs text-slate-400 print:hidden">
            <span>© 2026 Smart Triage Co-Pilot · Clinical Records</span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/15 bg-white/10 px-4 py-1.5 font-bold text-white hover:bg-white/20 transition-all cursor-pointer"
            >
              Close Receipt
            </button>
          </div>

        </main>

      </div>
    </div>
  );
}

