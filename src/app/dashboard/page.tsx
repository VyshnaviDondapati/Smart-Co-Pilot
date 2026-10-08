"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Baby,
  BedDouble,
  CheckCircle,
  CheckCircle2,
  Clock,
  Copy,
  Droplet,
  Edit3,
  FileText,
  Flame,
  Heart,
  HeartPulse,
  Info,
  LogOut,
  Maximize2,
  MessageSquare,
  Pill,
  PlusCircle,
  Printer,
  Radio,
  RefreshCw,
  Save,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TestTube2,
  Thermometer,
  TrendingUp,
  User,
  Volume2,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { PatientRecord } from "@/lib/db";
import { analyzePatientClinicalFindings } from "@/lib/clinicalRules";
import CodeRedTraumaModal from "@/components/CodeRedTraumaModal";
import PatientReceiptModal from "@/components/PatientReceiptModal";
import { useStaffChat } from "@/context/StaffChatContext";
import { playEmergencyRedAlertSound } from "@/lib/emergencyAudio";

/* ══════════════════════════════════════════════════════════
   IMMERSIVE 3D MEDICAL BACKGROUND (MATCHING LOGIN SCREEN)
   ══════════════════════════════════════════════════════════ */
function DashboardMedicalBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-[#06181c] overflow-hidden">
      {/* 3D Medical Scene with Pan/Zoom Animation */}
      <div className="absolute inset-0 animate-bg-drift">
        <Image
          src="/bg-medical.jpg"
          alt="Medical Triage Environment"
          fill
          priority
          quality={95}
          className="object-cover object-[50%_0%] scale-[1.03] opacity-45"
        />
      </div>

      {/* Dark Ambient Glass Gradient Overlay for High Data Contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030d11]/85 via-[#04161b]/75 to-[#02090c]/90 backdrop-blur-[2px]" />
      <div className="absolute inset-0 bg-radial-vignette opacity-80" />

      {/* Soft Glow Orbs */}
      <div className="absolute top-[10%] left-[10%] h-[400px] w-[400px] rounded-full bg-teal-500/10 blur-[130px] animate-pulse-glow" />
      <div
        className="absolute bottom-[10%] right-[10%] h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[140px] animate-pulse-glow"
        style={{ animationDelay: "3s" }}
      />
    </div>
  );
}

export default function DoctorLiveClinicalDashboard() {
  const router = useRouter();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [doctorNotes, setDoctorNotes] = useState<string>("");
  const [notesSaved, setNotesSaved] = useState<boolean>(false);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState<boolean>(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [isNurseAccessBlocked, setIsNurseAccessBlocked] = useState<boolean>(false);
  const [doctorName, setDoctorName] = useState<string>("Dr. Arvind Rao");

  // Keep refs to avoid stale closure or polling intervals overwriting active typed notes
  const isNotesDirtyRef = useRef<boolean>(false);
  const doctorNotesRef = useRef<string>("");
  doctorNotesRef.current = doctorNotes;

  // Facility Resource Stats (Live from API)
  const [icuFreeBeds, setIcuFreeBeds] = useState<number>(2);
  const icuTotalBeds = 6;
  const [bloodBank, setBloodBank] = useState<Array<{ group: string; units: number; status: "critical" | "adequate" | "good" }>>([
    { group: "O-", units: 2, status: "critical" },
    { group: "A+", units: 8, status: "adequate" },
    { group: "B+", units: 5, status: "adequate" },
    { group: "O+", units: 12, status: "good" },
  ]);

  // Global Chat Context (Synchronized Real-Time Comms)
  const { messages, sendMessage, isChatOpen, setIsChatOpen, currentUserRole, setCurrentUserRole, setCurrentUserName } = useStaffChat();
  const [inlineChatInput, setInlineChatInput] = useState<string>("");

  // Fetch real resource stats from database API
  const fetchResources = async () => {
    try {
      const res = await fetch("/api/resources");
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.resources) {
        if (data.resources.icuBeds) {
          setIcuFreeBeds(data.resources.icuBeds.free);
        }
        if (data.resources.bloodBank) {
          setBloodBank(data.resources.bloodBank);
        }
      }
    } catch (e) {
      console.warn("Using offline resource fallback:", e);
    }
  };

  // Helper to select a patient and load their saved notes safely
  const handleSelectPatient = (patient: PatientRecord) => {
    setSelectedPatient(patient);
    setDoctorNotes(patient.doctorNotes || "");
    isNotesDirtyRef.current = false;
  };

  // Fetch real patients from database API without clearing user's active typed notes
  const fetchPatients = async (isManualRefresh: boolean = false) => {
    try {
      if (isManualRefresh) {
        setIsLoading(true);
      }
      const res = await fetch("/api/patients");
      if (!res.ok) {
        if (isManualRefresh) setIsLoading(false);
        return;
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.patients)) {
        const uniqueMap = new Map<string, PatientRecord>();
        data.patients.forEach((p: PatientRecord) => {
          if (p && p.id && !uniqueMap.has(p.id)) {
            uniqueMap.set(p.id, p);
          }
        });
        const sorted = Array.from(uniqueMap.values()).sort((a: PatientRecord, b: PatientRecord) => {
          const rank = { RED: 3, YELLOW: 2, GREEN: 1 };
          const rankDiff = (rank[b.triagePriority] || 1) - (rank[a.triagePriority] || 1);
          if (rankDiff !== 0) return rankDiff;
          return (b.urgencyScore || 0) - (a.urgencyScore || 0);
        });
        setPatients(sorted);

        setSelectedPatient((currentSelected) => {
          if (!currentSelected && sorted.length > 0) {
            setDoctorNotes(sorted[0].doctorNotes || "");
            isNotesDirtyRef.current = false;
            return sorted[0];
          } else if (currentSelected) {
            const updated = sorted.find((p) => p.id === currentSelected.id);
            if (updated) {
              // If doctor hasn't typed new unsaved notes, sync notes with server
              if (!isNotesDirtyRef.current && updated.doctorNotes !== undefined) {
                setDoctorNotes(updated.doctorNotes || "");
              }
              return updated;
            }
            return currentSelected;
          }
          return null;
        });
      }
    } catch (err) {
      console.warn("Patient fetch notice:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    try {
      const uRole = localStorage.getItem("userRole");
      if (uRole === "nurse") {
        setIsNurseAccessBlocked(true);
      } else {
        setIsNurseAccessBlocked(false);
        setCurrentUserRole("doctor");
        localStorage.setItem("userRole", "doctor");
        let dName = localStorage.getItem("doctorName");
        if (!dName || !dName.trim() || dName.toLowerCase().includes("nurse") || dName.toLowerCase().includes("praharshitha") || dName.toLowerCase().includes("priya")) {
          const uName = localStorage.getItem("userName");
          if (uRole === "doctor" && uName && !uName.toLowerCase().includes("nurse") && !uName.toLowerCase().includes("praharshitha") && !uName.toLowerCase().includes("priya")) {
            dName = uName.toLowerCase().startsWith("dr.") || uName.toLowerCase().startsWith("dr ") ? uName : `Dr. ${uName}`;
          } else {
            dName = "Dr. Amit Sharma";
          }
        }
        setDoctorName(dName);
        setCurrentUserName(dName);
        localStorage.setItem("doctorName", dName);
      }
    } catch {}

    fetchPatients(true);
    fetchResources();

    // Multi-Device Live Sync: Silent background polling interval so updates from nurses appear automatically
    const syncInterval = setInterval(() => {
      fetchPatients(false);
      fetchResources();
    }, 4000);

    return () => clearInterval(syncInterval);
  }, []);

  // Update Status in database & locally
  const handleUpdateStatus = async (id: string, newStatus: PatientRecord["status"]) => {
    try {
      const res = await fetch("/api/patients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus, notes: doctorNotes }),
      });
      if (res.ok) {
        setPatients((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: newStatus, doctorNotes } : p))
        );
        if (selectedPatient?.id === id) {
          setSelectedPatient((prev) => (prev ? { ...prev, status: newStatus, doctorNotes } : null));
        }

        // If admitting to ICU, allocate an ICU bed via API
        if (newStatus === "IN_REVIEW") {
          try {
            const bedRes = await fetch("/api/resources", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ icuBedChange: -1 }),
            });
            const bedData = await bedRes.json();
            if (bedData.success && bedData.resources?.icuBeds) {
              setIcuFreeBeds(bedData.resources.icuBeds.free);
            }
          } catch {}
        }

        // Send alert to nurses via global staff chat
        sendMessage(`[DOCTOR ORDER]: Patient ${selectedPatient?.name || id} status updated to [${newStatus}].`, "doctor", doctorName);
      }
    } catch (e) {
      console.error("Error updating patient status:", e);
    }
  };

  // Simulate Emergency Patient Trigger (Instant AI Queue Injection & Alert API)
  const handleSimulateEmergency = async () => {
    try {
      playEmergencyRedAlertSound(2.5);
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: "Ramesh Sharma",
          category: "Accident / Severe Injury",
          notes: "Acute severe chest trauma with tachypnea and diaphoresis.",
        }),
      });

      const data = await res.json();
      if (data.success && data.patient) {
        setPatients((prev) => {
          const filtered = prev.filter((p) => p.id !== data.patient.id);
          return [data.patient, ...filtered];
        });
        setSelectedPatient(data.patient);
        fetchResources();
      }
    } catch (e) {
      console.error("Emergency dispatch error:", e);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedPatient) return;
    try {
      await fetch("/api/patients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedPatient.id,
          status: selectedPatient.status,
          notes: doctorNotes,
        }),
      });
      isNotesDirtyRef.current = false;
      setPatients((prev) =>
        prev.map((p) => (p.id === selectedPatient.id ? { ...p, doctorNotes } : p))
      );
      setSelectedPatient((prev) => (prev ? { ...prev, doctorNotes } : null));
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2500);
    } catch (e) {
      console.error("Error saving notes:", e);
    }
  };

  const handleInlineChatSend = (text?: string) => {
    const toSend = text || inlineChatInput;
    if (!toSend.trim()) return;
    sendMessage(toSend, "doctor", doctorName);
    if (!text) setInlineChatInput("");
  };

  const handleOpenPatientDossier = (patient: PatientRecord) => {
    handleSelectPatient(patient);
    setIsDossierModalOpen(true);
    if (typeof document !== "undefined") {
      const el = document.getElementById("patient-360-panel");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleDeletePatient = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    const confirmed = window.confirm(`Are you sure you want to delete patient "${name}" (#${id}) from the hospital database?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/patients/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPatients((prev) => prev.filter((p) => p.id !== id));
        if (selectedPatient?.id === id) {
          setSelectedPatient(null);
          setIsDossierModalOpen(false);
        }
        sendMessage(`[RECORD DELETED]: Patient ${name} (#${id}) was deleted from the triage queue.`, "doctor", doctorName);
      }
    } catch (err) {
      console.error("Failed to delete patient:", err);
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

  // Filtered patients with guaranteed unique keys
  const filteredPatients = React.useMemo(() => {
    const seen = new Set<string>();
    return patients.filter((p) => {
      if (!p || !p.id || seen.has(p.id)) return false;
      seen.add(p.id);

      const matchesPriority =
        filterPriority === "ALL" || p.triagePriority === filterPriority;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.urgencyReason || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchesPriority && matchesSearch;
    });
  }, [patients, filterPriority, searchQuery]);

  const redCount = patients.filter((p) => p.triagePriority === "RED").length;

  const clinicalAnalysis = selectedPatient
    ? analyzePatientClinicalFindings(selectedPatient)
    : null;

  return (
    <main className="relative min-h-screen w-full flex flex-col justify-between py-5 px-3 sm:px-6 lg:px-8 text-slate-100 selection:bg-teal-500 selection:text-white">
      <DashboardMedicalBackground />

      {/* ══════════════════════════════════════════════════════
          1. TOP BAR: RESOURCE & CRISIS MANAGEMENT MONITOR
             (Sleek Frosted Glass Ribbon / Pill)
         ══════════════════════════════════════════════════════ */}
      <header className="mx-auto w-full max-w-[1600px] mb-5 rounded-2xl border border-white/20 bg-white/10 p-4 sm:p-5 backdrop-blur-2xl shadow-2xl space-y-4">
        
        {/* Tier 1: Station Branding (Left) & Action Buttons (Right) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Station Title */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/25 border border-teal-300/50 text-teal-300 shadow-[0_0_15px_rgba(45,212,191,0.35)] shrink-0">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight uppercase">
                Doctor Live Clinical Dashboard
              </h1>
              <p className="text-xs text-slate-300 font-medium">
                {doctorName} (Medical Officer On Duty) • Primary Health Centre
              </p>
            </div>
          </div>

          {/* Clean Action Buttons Row */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={handleSimulateEmergency}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-rose-400/50 bg-rose-500/25 hover:bg-rose-500/35 px-3 text-xs font-bold text-rose-200 shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0"
              title="Inject simulated Red Priority emergency trauma patient"
            >
              <Zap className="h-3.5 w-3.5 text-rose-300" />
              <span>+ Simulate Emergency</span>
            </button>

            <button
              type="button"
              onClick={() => fetchPatients(true)}
              disabled={isLoading}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 px-3 text-xs font-semibold text-slate-200 transition-all cursor-pointer shrink-0"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-teal-300" : ""}`} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => setIsChatOpen(true)}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-teal-300/40 bg-teal-500/20 hover:bg-teal-500/30 px-3 text-xs font-bold text-teal-200 transition-all cursor-pointer shrink-0"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Chat Box</span>
            </button>

            <button
              type="button"
              onClick={() => setIsReceiptModalOpen(true)}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-teal-300/40 bg-teal-500/20 hover:bg-teal-500/30 px-3 text-xs font-bold text-teal-200 transition-all cursor-pointer shrink-0 shadow-sm"
              title="View & Print Official Patient Case Sheets and Admission Receipts"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Patient Receipts</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 hover:bg-rose-500/25 hover:border-rose-400/40 hover:text-rose-200 px-3 text-xs font-semibold text-slate-300 transition-all cursor-pointer shrink-0"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

        </div>

        {/* Tier 2: Live Facility Resource Monitor (ICU Beds, Blood Bank, Alerts) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/10 pt-3">
          
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            {/* ICU Beds Free Badge */}
            <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-black/40 px-3 py-1.5 backdrop-blur-md">
              <BedDouble className="h-4 w-4 text-teal-300" />
              <span className="text-xs text-slate-300 font-medium">ICU Beds:</span>
              <span className={`px-2 py-0.5 rounded-md text-xs font-black ${
                icuFreeBeds <= 2
                  ? "bg-rose-500/25 text-rose-300 border border-rose-400/50 animate-pulse"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
              }`}>
                {icuFreeBeds} / {icuTotalBeds} Free
              </span>
            </div>

            {/* Blood Bank Live Stock */}
            <div className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-black/40 px-3 py-1.5 text-xs text-slate-300 backdrop-blur-md">
              <Droplet className="h-3.5 w-3.5 text-rose-400" />
              <span className="font-semibold text-slate-400">Blood Bank:</span>
              <div className="flex items-center gap-1.5">
                {bloodBank.map((b) => (
                  <span
                    key={b.group}
                    className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                      b.status === "critical"
                        ? "bg-rose-500/30 text-rose-300 border border-rose-500/50"
                        : "bg-white/10 text-slate-200 border border-white/10"
                    }`}
                  >
                    {b.group} ({b.units}u)
                  </span>
                ))}
              </div>
            </div>

            {/* Active Critical Alerts Flasher */}
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/50 bg-rose-950/40 px-3 py-1.5 text-xs text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.35)] backdrop-blur-md">
              <Flame className="h-4 w-4 text-rose-400 animate-pulse" />
              <span>Critical P1: <strong>{redCount} Waiting</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CodeRedTraumaModal />
          </div>

        </div>

      </header>

      {/* ══════════════════════════════════════════════════════
          2. MAIN WORKSPACE (2-TIER CLEAN DESKTOP LAYOUT)
         ══════════════════════════════════════════════════════ */}
      <div className="mx-auto w-full max-w-[1650px] space-y-6 pb-12">
        
        {/* ────────────────────────────────────────────────────
            TOP ROW: PRIORITY QUEUE (LEFT: 7 Cols) + STAFF CHAT (RIGHT: 5 Cols)
           ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* 1. DYNAMIC AI PRIORITY QUEUE (TOP LEFT: 7 Cols) */}
          <section className="lg:col-span-7 flex flex-col gap-4 rounded-3xl border border-white/20 bg-white/10 p-5 sm:p-6 backdrop-blur-2xl shadow-2xl">
            {/* Header & Search */}
            <div className="space-y-3 pb-3 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-teal-300" />
                  <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                    Dynamic AI Priority Queue
                  </h2>
                </div>
                <span className="rounded-full bg-teal-500/20 border border-teal-400/40 px-3 py-0.5 text-xs font-bold text-teal-200">
                  {filteredPatients.length} Active Patients
                </span>
              </div>

              {/* Search + Filter Tabs Row */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-6 relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search patient, ticket, symptom…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-black/40 py-2 pl-9 pr-3 text-xs font-semibold text-white placeholder-slate-400/80 backdrop-blur-sm focus:border-teal-300 focus:outline-none focus:ring-1 focus:ring-teal-400/30"
                  />
                </div>

                <div className="sm:col-span-6 grid grid-cols-4 gap-1 rounded-xl bg-black/40 p-1 border border-white/15">
                  {[
                    { id: "ALL", label: "All" },
                    { id: "RED", label: "P1 Red" },
                    { id: "YELLOW", label: "P2 Yellow" },
                    { id: "GREEN", label: "P3 Green" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setFilterPriority(tab.id)}
                      className={`py-1 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center ${
                        filterPriority === tab.id
                          ? "bg-teal-400 text-slate-950 shadow-md"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Queue List Cards (Clean 2-Column Responsive Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1.5 custom-scrollbar">
              {filteredPatients.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-white/10 bg-black/30 p-8 text-center text-slate-400 text-xs space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto opacity-80" />
                  <p className="font-bold text-white">No patients in this category</p>
                </div>
              ) : (
                filteredPatients.map((patient) => {
                  const isSelected = selectedPatient?.id === patient.id;
                  const isP1 = patient.triagePriority === "RED";
                  const isP2 = patient.triagePriority === "YELLOW";

                  return (
                    <div
                      key={patient.id}
                      onClick={() => handleSelectPatient(patient)}
                      className={`
                        rounded-2xl border p-4 transition-all duration-200 cursor-pointer text-left space-y-3 backdrop-blur-xl flex flex-col justify-between
                        ${
                          isSelected
                            ? "ring-2 ring-teal-400 bg-teal-950/40 border-teal-300/60 shadow-[0_0_25px_rgba(45,212,191,0.35)]"
                            : isP1
                            ? "border-rose-500/50 bg-rose-950/30 hover:border-rose-400 hover:bg-rose-950/40 shadow-[0_0_15px_rgba(244,63,94,0.2)] animate-pulse-border"
                            : isP2
                            ? "border-amber-500/40 bg-amber-950/20 hover:border-amber-400 hover:bg-amber-950/30"
                            : "border-white/15 bg-black/30 hover:border-emerald-400/40 hover:bg-black/50"
                        }
                      `}
                    >
                      {/* Top Row: Name + Severity Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                            isP1
                              ? "bg-rose-500 text-white shadow-md"
                              : isP2
                              ? "bg-amber-400 text-slate-950 font-black shadow-md"
                              : "bg-emerald-400 text-slate-950 font-black"
                          }`}>
                            {patient.triagePriority === "RED" ? "P1" : patient.triagePriority === "YELLOW" ? "P2" : "P3"}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-white text-sm leading-tight truncate">
                              {patient.name}
                            </h4>
                            <span className="text-[11px] text-slate-300">
                              #{patient.id} • {patient.age}y • {patient.gender || "Adult"}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] text-slate-300 font-semibold bg-white/10 border border-white/15 px-2 py-0.5 rounded-md shrink-0">
                          {patient.bloodGroup || "O+"}
                        </span>
                      </div>

                      {/* Rationale Snippet */}
                      <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed font-normal">
                        {patient.urgencyReason || "Stable physiological baseline."}
                      </p>

                      {/* Bottom Row: Quick Stats & Open Button */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                        <div className="flex items-center gap-2 text-[11px] text-slate-300">
                          <span>BP: <strong className="text-white">{patient.bpSystolic}/{patient.bpDiastolic}</strong></span>
                          <span>•</span>
                          <span>Sugar: <strong className="text-white">{patient.sugarLevel || patient.bloodGlucose || "--"}</strong></span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => handleDeletePatient(e, patient.id, patient.name)}
                            title="Delete Patient Record"
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/30 hover:border-rose-400 hover:text-rose-100 transition-all cursor-pointer shadow-sm"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenPatientDossier(patient);
                            }}
                            className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer bg-teal-400 text-slate-950 hover:bg-teal-300 shadow-md"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="h-3 w-3 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* 3. DOCTOR-TO-STAFF SECURE CHAT WIDGET (TOP RIGHT: 5 Cols) */}
          <section className="lg:col-span-5 flex flex-col rounded-3xl border border-white/20 bg-white/10 p-5 sm:p-6 backdrop-blur-2xl shadow-2xl h-full min-h-[580px]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/15 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/25 border border-teal-300/40 text-teal-300 shadow-md">
                  <MessageSquare className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">
                    Staff Live Chat Box
                  </h3>
                  <span className="text-[10px] text-teal-300 font-bold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Doctor ↔ Nurse Channel
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsChatOpen(true)}
                className="rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Expand Fullscreen Chat"
              >
                Expand ↗
              </button>
            </div>

            {/* Quick Action Pre-set Chips */}
            <div className="py-2.5 border-b border-white/10 space-y-1 shrink-0">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                1-Tap Doctor Orders:
              </span>
              <div className="flex flex-wrap gap-1">
                {[
                  "Prepare Trauma Bed 1",
                  "Administer Normal Saline IV",
                  "Run Urgent Blood Test",
                  "Patient ready for review",
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleInlineChatSend(chip)}
                    className="rounded-lg border border-white/15 bg-black/40 hover:bg-teal-500/25 hover:border-teal-300/50 px-2 py-0.5 text-[10px] font-bold text-slate-300 hover:text-teal-200 transition-all cursor-pointer text-left"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5 custom-scrollbar pr-1 min-h-[300px] max-h-[380px]">
              {messages.map((msg) => {
                const isMe = msg.role === "doctor";

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"} space-y-0.5`}
                  >
                    <div
                      className={`flex items-center gap-1 text-[9px] font-bold px-1 ${
                        isMe ? "flex-row-reverse text-teal-300" : "flex-row text-slate-400"
                      }`}
                    >
                      <span>{isMe ? `You (${doctorName})` : `👩‍⚕️ ${msg.sender}`}</span>
                      <span>•</span>
                      <span className="text-slate-400 font-medium">{msg.time}</span>
                    </div>
                    <div
                      className={`
                        max-w-[92%] rounded-xl p-2.5 text-[11px] leading-relaxed font-semibold shadow-md
                        ${
                          isMe
                            ? "bg-teal-500/25 border border-teal-300/40 text-teal-100 rounded-tr-none text-left"
                            : "bg-slate-900/90 border border-white/15 text-slate-200 rounded-tl-none text-left"
                        }
                      `}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleInlineChatSend();
              }}
              className="pt-2.5 border-t border-white/15 flex items-center gap-1.5 shrink-0"
            >
              <input
                type="text"
                placeholder={`Send order as ${doctorName}…`}
                value={inlineChatInput}
                onChange={(e) => setInlineChatInput(e.target.value)}
                className="flex-1 rounded-xl border border-white/20 bg-black/40 py-2 px-2.5 text-xs font-semibold text-white placeholder-slate-400 focus:border-teal-300 focus:outline-none focus:ring-1 focus:ring-teal-400/30"
              />
              <button
                type="submit"
                disabled={!inlineChatInput.trim()}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md shrink-0 font-bold"
              >
                <Send className="h-3.5 w-3.5 stroke-[2.5]" />
              </button>
            </form>
          </section>

        </div>

        {/* ────────────────────────────────────────────────────
            BOTTOM ROW: PATIENT 360-DEGREE DEEP DIVE PANEL (MIDDLE CARD BELOW - FULL WIDTH)
           ──────────────────────────────────────────────────── */}
        <section id="patient-360-panel" className="w-full rounded-3xl border border-white/20 bg-white/10 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
          {selectedPatient ? (
            <div className="space-y-6 animate-fade-in">
              
              {/* 1. Patient Banner & Urgency Header (Full Width) */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/15 pb-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-500/20 border border-teal-300/40 text-teal-300 shadow-md mt-0.5">
                    <User className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                        {selectedPatient.name}
                      </h3>
                      {selectedPatient.triagePriority === "RED" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 border border-rose-500/50 px-3 py-0.5 text-xs font-black tracking-wider text-rose-300 uppercase shadow-sm animate-pulse">
                          🚨 Code Red Trauma
                        </span>
                      )}
                      {selectedPatient.triagePriority === "YELLOW" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/50 px-3 py-0.5 text-xs font-black tracking-wider text-amber-300 uppercase shadow-sm">
                          ⚠️ Priority Yellow
                        </span>
                      )}
                      <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-xs font-black uppercase tracking-wider ${
                        selectedPatient.status === "TREATED"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : selectedPatient.status === "IN_REVIEW"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : selectedPatient.status === "REFERRED"
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                          : "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                      }`}>
                        {selectedPatient.status || "WAITING"}
                      </span>
                    </div>

                    <p className="text-sm text-slate-300 mt-1.5 leading-normal">
                      Ticket: <strong className="text-white">#{selectedPatient.id}</strong> · Age: <strong className="text-white">{selectedPatient.age}y</strong> · Gender: <strong className="text-white">{selectedPatient.gender || "Adult"}</strong> · Blood Group: <strong className="text-cyan-300 font-bold">{selectedPatient.bloodGroup || "O+"}</strong>
                    </p>
                  </div>
                </div>

                {/* Right Actions & Urgency Badge */}
                <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap shrink-0">
                  <div className={`flex items-center gap-3 rounded-2xl border px-4 py-2.5 backdrop-blur-md shrink-0 shadow-lg ${
                    selectedPatient.triagePriority === "RED"
                      ? "border-rose-500/50 bg-rose-950/40 shadow-rose-950/50"
                      : selectedPatient.triagePriority === "YELLOW"
                      ? "border-amber-500/40 bg-amber-950/30"
                      : "border-white/20 bg-black/40"
                  }`}>
                    <HeartPulse className={`h-6 w-6 shrink-0 ${
                      selectedPatient.triagePriority === "RED" ? "text-rose-400 animate-pulse" : "text-teal-400"
                    }`} />
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block leading-none">Urgency Meter</span>
                      <span className="text-lg font-black text-white leading-none mt-1 block">
                        {selectedPatient.urgencyScore || 90}<span className="text-xs font-bold text-slate-400">/100</span>
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleDeletePatient(e, selectedPatient.id, selectedPatient.name)}
                    className="flex items-center gap-1.5 rounded-2xl border border-rose-500/40 bg-rose-500/15 hover:bg-rose-500/30 px-3.5 py-2.5 text-xs font-bold text-rose-200 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                    title="Delete patient record"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsDossierModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-2xl border border-teal-400/40 bg-teal-500/20 hover:bg-teal-500/30 px-4 py-2.5 text-xs font-bold text-teal-200 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                    title="Open Fullscreen Patient Case Sheet"
                  >
                    <Maximize2 className="h-4 w-4" />
                    <span>Full Dossier</span>
                  </button>
                </div>
              </div>

              {/* 2. Vitals Matrix (6 Horizontal Metric Cards) */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <Activity className="h-4 w-4" /> Recorded Clinical Vitals Matrix
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                  <div className="rounded-2xl border border-white/15 bg-black/40 p-3.5">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Blood Pressure</span>
                    <span className="text-base font-black text-white mt-1 block">
                      {selectedPatient.bpSystolic}/{selectedPatient.bpDiastolic}
                    </span>
                    <span className="text-[10px] text-slate-400">mmHg</span>
                  </div>

                  <div className="rounded-2xl border border-white/15 bg-black/40 p-3.5">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Blood Glucose</span>
                    <span className="text-base font-black text-white mt-1 block">
                      {selectedPatient.sugarLevel || selectedPatient.bloodGlucose || "--"}
                    </span>
                    <span className="text-[10px] text-slate-400">mg/dL</span>
                  </div>

                  <div className="rounded-2xl border border-white/15 bg-black/40 p-3.5">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Temperature</span>
                    <span className="text-base font-black text-white mt-1 block">
                      {selectedPatient.temperature || "98.6"}
                    </span>
                    <span className="text-[10px] text-slate-400">°F</span>
                  </div>

                  <div className="rounded-2xl border border-white/15 bg-black/40 p-3.5">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">WBC Count</span>
                    <span className="text-base font-black text-white mt-1 block">
                      {parseInt(selectedPatient.wbcCount || "7500", 10).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400">/mcL</span>
                  </div>

                  <div className="rounded-2xl border border-white/15 bg-black/40 p-3.5">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Height / Weight</span>
                    <span className="text-sm font-bold text-white mt-1 block">
                      {selectedPatient.height || "--"}cm / {selectedPatient.weight || "--"}kg
                    </span>
                    <span className="text-[10px] text-teal-300">BMI Normal</span>
                  </div>

                  <div className="rounded-2xl border border-white/15 bg-black/40 p-3.5">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Blood Group</span>
                    <span className="text-base font-black text-cyan-300 mt-1 block">
                      {selectedPatient.bloodGroup || "O+"}
                    </span>
                    <span className="text-[10px] text-slate-400">Verified</span>
                  </div>
                </div>
              </div>

              {/* 3. Side-by-Side: AI Clinical Findings (Left) & Deep History (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* 3A. AI Clinical Abnormality & Orders (7 Cols) */}
                <div className="lg:col-span-7 flex flex-col space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${
                      clinicalAnalysis?.criticalCount && clinicalAnalysis.criticalCount > 0
                        ? "text-rose-400"
                        : clinicalAnalysis?.hasAbnormalities
                        ? "text-amber-300"
                        : "text-emerald-400"
                    }`}>
                      <AlertOctagon className="h-4 w-4" />
                      AI Clinical Abnormality &amp; Treatment Orders
                    </h4>
                    {clinicalAnalysis?.hasAbnormalities && (
                      <button
                        type="button"
                        onClick={() => {
                          const orderText = clinicalAnalysis.recommendedCarePlan.join("\n• ");
                          isNotesDirtyRef.current = true;
                          setDoctorNotes((prev) => (prev ? `${prev}\n\n[RECOMMENDED ORDERS]:\n• ${orderText}` : `[RECOMMENDED ORDERS]:\n• ${orderText}`));
                        }}
                        className="text-[10px] font-bold text-teal-300 hover:text-white bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>+ Apply Orders to Rx</span>
                      </button>
                    )}
                  </div>

                  {clinicalAnalysis?.hasAbnormalities ? (
                    <div className="flex-1 flex flex-col rounded-2xl border border-rose-500/30 bg-rose-950/25 p-4 backdrop-blur-xl">
                      <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10 shrink-0">
                        <span className="font-extrabold text-rose-300 flex items-center gap-1.5 text-sm">
                          <span className="h-2.5 w-2.5 rounded-full bg-rose-400 animate-ping" />
                          {clinicalAnalysis.primaryDiagnosis}
                        </span>
                        <span className="text-xs text-slate-300 font-bold bg-rose-500/20 px-2.5 py-0.5 rounded-md border border-rose-500/30">
                          {clinicalAnalysis.totalAbnormal} Abnormal Findings
                        </span>
                      </div>

                      <div className="space-y-2.5 mt-3 max-h-[300px] overflow-y-auto pr-1.5 custom-scrollbar">
                        {clinicalAnalysis.items.map((item, idx) => (
                          <div
                            key={idx}
                            className={`rounded-xl border p-3 text-xs space-y-2 ${
                              item.severity === "RED"
                                ? "border-rose-500/40 bg-rose-900/30 text-rose-100"
                                : "border-amber-500/30 bg-amber-900/20 text-amber-100"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-black text-white flex items-center gap-1.5 text-sm">
                                <span className={`h-2 w-2 rounded-full ${item.severity === "RED" ? "bg-rose-400" : "bg-amber-400"}`} />
                                {item.field}: <strong className="text-cyan-300">{item.value}</strong>
                              </span>
                              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                                item.severity === "RED" ? "bg-rose-500 text-white" : "bg-amber-400 text-slate-950"
                              }`}>
                                {item.urgency}
                              </span>
                            </div>

                            <div className="text-xs leading-relaxed text-slate-200">
                              <strong className="text-rose-300 uppercase text-[10px] block font-bold">Clinical Finding:</strong>
                              {item.finding}
                            </div>

                            <div className="text-xs leading-relaxed text-teal-100 bg-black/40 p-2.5 rounded-lg border border-teal-400/20">
                              <strong className="text-teal-300 uppercase text-[10px] block font-bold flex items-center gap-1">
                                <Pill className="h-3 w-3" /> Recommended Orders &amp; Rx:
                              </strong>
                              {item.treatment}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 text-xs flex items-center gap-3 text-emerald-300">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                      <span>All vital signs &amp; physiological markers are within standard normal limits. Routine clinical observation indicated.</span>
                    </div>
                  )}
                </div>

                {/* 3B. Deep Clinical History Card (5 Cols) */}
                <div className="lg:col-span-5 flex flex-col space-y-2.5">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4" />
                    Deep Medical History &amp; Complications
                  </h4>

                  <div className="flex-1 rounded-2xl border border-purple-500/25 bg-black/40 p-4 space-y-3.5 backdrop-blur-xl shadow-lg max-h-[360px] overflow-y-auto pr-1.5 custom-scrollbar">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Allergies</span>
                        <span className={`text-xs font-bold block ${selectedPatient.allergies && selectedPatient.allergies !== "None" && selectedPatient.allergies !== "None documented" ? "text-rose-300" : "text-slate-200"}`}>
                          {selectedPatient.allergies || "None documented"}
                        </span>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Medications</span>
                        <span className="text-xs font-semibold text-slate-200 block">
                          {selectedPatient.currentMedications || "None"}
                        </span>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Surgical History</span>
                        <span className="text-xs font-semibold text-slate-200 block">
                          {selectedPatient.pastSurgical || "None reported"}
                        </span>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Diabetes / Endocrine</span>
                        <span className="text-xs font-bold text-teal-300 block">
                          {selectedPatient.diabetesType || "None"}
                        </span>
                      </div>
                    </div>

                    {selectedPatient.isPregnant && (
                      <div className="flex items-center justify-between rounded-xl border border-purple-400/30 bg-purple-950/30 p-3 text-xs">
                        <span className="text-slate-300 font-medium flex items-center gap-1.5">
                          <Baby className="h-4 w-4 text-purple-300" /> Pregnancy Screening:
                        </span>
                        <span className="font-extrabold text-purple-300 bg-purple-500/20 px-2.5 py-0.5 rounded-lg border border-purple-500/40">
                          Gestational Week {selectedPatient.gestationalWeeks || "28"}w
                        </span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* 4. ⚡ DEDICATED PHYSICIAN CLINICAL DISPOSITION & ORDERS CARD (FULL WIDTH BELOW) */}
              <div className="rounded-2xl border border-teal-500/30 bg-teal-950/20 p-5 sm:p-6 space-y-4 backdrop-blur-xl shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/25 border border-teal-400/40 text-teal-300 shadow">
                      <Stethoscope className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wider text-white">
                        Physician Disposition &amp; Clinical Orders Station
                      </h4>
                      <p className="text-xs text-slate-400">Update triage routing or append doctor orders to patient dossier</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-teal-300 bg-teal-900/50 border border-teal-500/40 px-3 py-1 rounded-xl">
                    Active Clinical Workflow
                  </span>
                </div>

                {/* Disposition Action Buttons */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                    Patient Triage Disposition Routing:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        handleUpdateStatus(selectedPatient.id, "IN_REVIEW");
                        setIcuFreeBeds((prev) => Math.max(0, prev - 1));
                      }}
                      className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-102 active:scale-95 ${
                        selectedPatient.status === "IN_REVIEW"
                          ? "border-rose-400 bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.4)]"
                          : "border-rose-400/40 bg-rose-500/20 text-rose-200 hover:bg-rose-500/30"
                      }`}
                    >
                      <Flame className="h-4 w-4 shrink-0" />
                      <span>Admit ICU</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedPatient.id, "TREATED")}
                      className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-102 active:scale-95 ${
                        selectedPatient.status === "TREATED"
                          ? "border-teal-400 bg-teal-500 text-slate-950 shadow-[0_0_12px_rgba(45,212,191,0.4)]"
                          : "border-teal-400/40 bg-teal-500/20 text-teal-200 hover:bg-teal-500/30"
                      }`}
                    >
                      <Pill className="h-4 w-4 shrink-0" />
                      <span>Prescribe</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedPatient.id, "REFERRED")}
                      className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-102 active:scale-95 ${
                        selectedPatient.status === "REFERRED"
                          ? "border-purple-400 bg-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                          : "border-purple-400/40 bg-purple-500/20 text-purple-200 hover:bg-purple-500/30"
                      }`}
                    >
                      <ArrowRight className="h-4 w-4 shrink-0" />
                      <span>Refer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedPatient.id, "TREATED")}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/40 bg-emerald-500/20 hover:bg-emerald-500/30 p-3 text-xs font-bold text-emerald-200 transition-all cursor-pointer shadow-sm hover:scale-102 active:scale-95"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>Complete</span>
                    </button>
                  </div>
                </div>

                {/* Clinical Notes & Prescription Box */}
                <div className="space-y-2 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase text-slate-200 flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-teal-300" />
                      Doctor Clinical Notes &amp; Prescription (Rx)
                    </label>
                    {notesSaved && (
                      <span className="text-xs font-bold text-emerald-400 animate-fade-in flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" /> Notes saved to dossier
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={3}
                    value={doctorNotes}
                    onChange={(e) => {
                      setDoctorNotes(e.target.value);
                      isNotesDirtyRef.current = true;
                    }}
                    placeholder="Type physician orders, clinical diagnosis, or prescription instructions here…"
                    className="w-full rounded-2xl border border-white/20 bg-black/50 p-3.5 text-xs sm:text-sm text-white placeholder-slate-400/80 backdrop-blur-sm focus:border-teal-300 focus:outline-none focus:ring-1 focus:ring-teal-400/30"
                  />
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-400">
                      Auto-synced with patient ticket #{selectedPatient.id}
                    </span>
                    <button
                      type="button"
                      onClick={handleSaveNotes}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
                    >
                      <Save className="h-4 w-4 stroke-[2.5]" />
                      <span>Save Clinical Orders</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 space-y-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-teal-500/15 border border-teal-400/30 text-teal-300 shadow-lg">
                <User className="h-8 w-8 opacity-80" />
              </div>
              <p className="font-extrabold text-white text-base">Select a Patient to Open 360° Profile</p>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                Click any patient from the Priority Queue in the top section to inspect their vitals, AI differential diagnosis, and clinical orders here below.
              </p>
            </div>
          )}
        </section>

      </div>

      {/* ══════════════════════════════════════════════════════
          5. COMPREHENSIVE PATIENT CLINICAL DOSSIER MODAL
         ══════════════════════════════════════════════════════ */}
      {isDossierModalOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-2xl animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border border-teal-400/40 bg-zinc-950/95 p-6 sm:p-8 shadow-[0_0_50px_rgba(45,212,191,0.25)] text-left space-y-6 overflow-y-auto custom-scrollbar">
            
            {/* Header: Patient Bio + Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/15 pb-5 shrink-0">
              <div className="flex items-center gap-3.5">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl font-black text-lg shadow-xl shrink-0 ${
                  selectedPatient.triagePriority === "RED"
                    ? "bg-rose-500 text-white shadow-rose-500/30 animate-pulse"
                    : selectedPatient.triagePriority === "YELLOW"
                    ? "bg-amber-400 text-slate-950 shadow-amber-500/20"
                    : "bg-emerald-400 text-slate-950 shadow-emerald-500/20"
                }`}>
                  {selectedPatient.triagePriority === "RED" ? "P1" : selectedPatient.triagePriority === "YELLOW" ? "P2" : "P3"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-white tracking-tight">
                      {selectedPatient.name}
                    </h2>
                    <span className="text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-400/30 px-2.5 py-0.5 rounded-md">
                      Blood: {selectedPatient.bloodGroup || "O+"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Record ID: <strong className="text-white">#{selectedPatient.id}</strong> • {selectedPatient.age}y • {selectedPatient.gender || "Adult"} • Admitted: {selectedPatient.createdAt ? new Date(selectedPatient.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                  </p>
                </div>
              </div>

              {/* Top Right Action Tools */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 px-3 py-2 text-xs font-bold text-slate-200 transition-all cursor-pointer"
                  title="Print Clinical Case Sheet"
                >
                  <Printer className="h-4 w-4 text-cyan-300" />
                  <span className="hidden sm:inline">Print Chart</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDossierModalOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 hover:bg-rose-500/30 hover:border-rose-400/50 border border-white/15 text-slate-300 hover:text-white transition-all cursor-pointer"
                  title="Close Dossier"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Vitals Matrix */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                <Activity className="h-4 w-4" /> Comprehensive Physiological Vitals
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-white/15 bg-black/50 p-3.5">
                  <span className="text-[11px] text-slate-400 font-semibold block uppercase">Blood Pressure</span>
                  <span className="text-lg font-black text-white mt-1 block">
                    {selectedPatient.bpSystolic}/{selectedPatient.bpDiastolic} <span className="text-xs text-slate-400 font-normal">mmHg</span>
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded inline-block mt-1 ${
                    parseInt(selectedPatient.bpSystolic || "120", 10) >= 140 ? "bg-rose-500/20 text-rose-300" : "bg-emerald-500/20 text-emerald-300"
                  }`}>
                    {parseInt(selectedPatient.bpSystolic || "120", 10) >= 140 ? "Hypertensive" : "Normal"}
                  </span>
                </div>

                <div className="rounded-2xl border border-white/15 bg-black/50 p-3.5">
                  <span className="text-[11px] text-slate-400 font-semibold block uppercase">Blood Glucose</span>
                  <span className="text-lg font-black text-white mt-1 block">
                    {selectedPatient.sugarLevel || selectedPatient.bloodGlucose || "--"} <span className="text-xs text-slate-400 font-normal">mg/dL</span>
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded inline-block mt-1 ${
                    parseInt(selectedPatient.sugarLevel || "110", 10) >= 140 ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300"
                  }`}>
                    {parseInt(selectedPatient.sugarLevel || "110", 10) >= 140 ? "Elevated" : "Optimal"}
                  </span>
                </div>

                <div className="rounded-2xl border border-white/15 bg-black/50 p-3.5">
                  <span className="text-[11px] text-slate-400 font-semibold block uppercase">Body Temperature</span>
                  <span className="text-lg font-black text-white mt-1 block">
                    {selectedPatient.temperature || "98.6"} <span className="text-xs text-slate-400 font-normal">°F</span>
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded inline-block mt-1 ${
                    parseFloat(selectedPatient.temperature || "98.6") >= 100.4 ? "bg-rose-500/20 text-rose-300" : "bg-emerald-500/20 text-emerald-300"
                  }`}>
                    {parseFloat(selectedPatient.temperature || "98.6") >= 100.4 ? "Febrile / Fever" : "Normothermic"}
                  </span>
                </div>

                <div className="rounded-2xl border border-white/15 bg-black/50 p-3.5">
                  <span className="text-[11px] text-slate-400 font-semibold block uppercase">WBC (Leukocytes)</span>
                  <span className="text-lg font-black text-white mt-1 block">
                    {parseInt(selectedPatient.wbcCount || "7500", 10).toLocaleString()} <span className="text-xs text-slate-400 font-normal">/mcL</span>
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded inline-block mt-1 ${
                    parseInt(selectedPatient.wbcCount || "7500", 10) >= 11000 ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300"
                  }`}>
                    {parseInt(selectedPatient.wbcCount || "7500", 10) >= 11000 ? "Leukocytosis" : "Standard"}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Clinical Abnormalities & Treatment Protocols */}
            {clinicalAnalysis && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 ${
                    clinicalAnalysis.criticalCount > 0
                      ? "text-rose-400"
                      : clinicalAnalysis.hasAbnormalities
                      ? "text-amber-300"
                      : "text-emerald-400"
                  }`}>
                    <AlertOctagon className="h-4 w-4" />
                    AI Clinical Abnormality &amp; Treatment Orders
                  </h3>
                  {clinicalAnalysis.hasAbnormalities && (
                    <button
                      type="button"
                      onClick={() => {
                        const orderText = clinicalAnalysis.recommendedCarePlan.join("\n• ");
                        isNotesDirtyRef.current = true;
                        setDoctorNotes((prev) => (prev ? `${prev}\n\n[RECOMMENDED ORDERS]:\n• ${orderText}` : `[RECOMMENDED ORDERS]:\n• ${orderText}`));
                      }}
                      className="text-xs font-bold text-teal-300 hover:text-white bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 px-3 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>+ Apply Orders to Rx</span>
                    </button>
                  )}
                </div>

                {clinicalAnalysis.hasAbnormalities ? (
                  <div className="space-y-3 rounded-2xl border border-rose-500/30 bg-rose-950/20 p-4 sm:p-5 backdrop-blur-xl">
                    {clinicalAnalysis.items.map((item, idx) => (
                      <div
                        key={idx}
                        className={`rounded-2xl border p-3.5 text-xs sm:text-sm space-y-2 ${
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

                        <div className="text-xs leading-relaxed text-slate-200">
                          <strong className="text-rose-300 uppercase text-[11px] block font-bold">🔴 What is not normal:</strong>
                          {item.finding}
                        </div>

                        <div className="text-xs leading-relaxed text-teal-100 bg-black/50 p-3 rounded-xl border border-teal-400/20">
                          <strong className="text-teal-300 uppercase text-[11px] block font-bold flex items-center gap-1.5">
                            <Pill className="h-3.5 w-3.5" /> 💊 Recommended Treatment &amp; Orders:
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
            )}

            {/* Medical History Section */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" /> Medical History &amp; Complications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-2xl border border-white/10 bg-black/40 p-3.5 space-y-1.5">
                  <span className="text-slate-400 block font-medium">Documented Allergies:</span>
                  <span className="font-bold text-rose-300 text-sm">{selectedPatient.allergies || "None documented"}</span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/40 p-3.5 space-y-1.5">
                  <span className="text-slate-400 block font-medium">Current Medications:</span>
                  <span className="font-semibold text-slate-200 text-sm">{selectedPatient.currentMedications || "None"}</span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/40 p-3.5 space-y-1.5">
                  <span className="text-slate-400 block font-medium">Surgical History:</span>
                  <span className="font-semibold text-slate-200 text-sm">{selectedPatient.pastSurgical || "None reported"}</span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/40 p-3.5 space-y-1.5">
                  <span className="text-slate-400 block font-medium">Diabetes / Glycemic History:</span>
                  <span className="font-semibold text-teal-300 text-sm">{selectedPatient.diabetesType || "None"}</span>
                </div>
              </div>
            </div>

            {/* Doctor Clinical Notes & Prescription */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-teal-300 flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Doctor Clinical Notes &amp; Prescription (Rx)
                </h3>
                {notesSaved && (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-400/30 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" /> Notes Saved to Cloud
                  </span>
                )}
              </div>
              <textarea
                rows={4}
                value={doctorNotes}
                onChange={(e) => {
                  setDoctorNotes(e.target.value);
                  isNotesDirtyRef.current = true;
                }}
                placeholder="Type clinical diagnosis, prescription dosage, observation orders, or doctor instructions..."
                className="w-full rounded-2xl border border-white/20 bg-black/60 p-4 text-xs sm:text-sm font-mono text-white placeholder-slate-400 focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400/30 custom-scrollbar"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="flex items-center gap-1.5 rounded-xl bg-teal-400 hover:bg-teal-300 px-4 py-2 text-xs font-bold text-slate-950 transition-all cursor-pointer shadow-md"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Notes &amp; Rx</span>
                </button>
              </div>
            </div>

            {/* Disposition Actions */}
            <div className="border-t border-white/15 pt-5 space-y-3">
              <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider block">
                Doctor Final Clinical Disposition
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateStatus(selectedPatient.id, "IN_REVIEW");
                    setIcuFreeBeds((prev) => Math.max(0, prev - 1));
                    setIsDossierModalOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-rose-400/40 bg-rose-500/25 hover:bg-rose-500/40 p-3.5 text-xs font-bold text-rose-200 shadow-md transition-all cursor-pointer active:scale-95"
                >
                  <Flame className="h-4 w-4 text-rose-400" />
                  <span>Admit to ICU</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleUpdateStatus(selectedPatient.id, "TREATED");
                    setIsDossierModalOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-teal-400/40 bg-teal-500/25 hover:bg-teal-500/40 p-3.5 text-xs font-bold text-teal-200 shadow-md transition-all cursor-pointer active:scale-95"
                >
                  <Pill className="h-4 w-4 text-teal-300" />
                  <span>Prescribe &amp; Treat</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleUpdateStatus(selectedPatient.id, "REFERRED");
                    setIsDossierModalOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-purple-400/40 bg-purple-500/25 hover:bg-purple-500/40 p-3.5 text-xs font-bold text-purple-200 shadow-md transition-all cursor-pointer active:scale-95"
                >
                  <ArrowRight className="h-4 w-4 text-purple-300" />
                  <span>Refer to Specialist</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleDeletePatient(e, selectedPatient.id, selectedPatient.name)}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-rose-500/50 bg-rose-950/40 hover:bg-rose-900/60 p-3.5 text-xs font-bold text-rose-300 transition-all cursor-pointer shadow-md active:scale-95"
                  title="Permanently remove this patient record"
                >
                  <Trash2 className="h-4 w-4 text-rose-400" />
                  <span>Delete Record</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDossierModalOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 p-3.5 text-xs font-bold text-slate-200 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4 text-slate-300" />
                  <span>Close Dossier</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          NURSE ACCESS RESTRICTION OVERLAY (ROLE-GUARD)
         ══════════════════════════════════════════════════════ */}
      {isNurseAccessBlocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-2xl animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-rose-500/40 bg-zinc-950/95 p-6 sm:p-8 text-center shadow-2xl space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/20 border border-rose-400 text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.4)]">
              <ShieldAlert className="h-9 w-9" />
            </div>

            <div>
              <span className="rounded-full bg-rose-500/20 border border-rose-400/30 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-rose-300">
                Doctor Authorization Required
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
                Medical Officer Portal
              </h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                You are currently signed in as a <strong>Frontline Nurse</strong>. Clinical disposition orders, ICU bed assignments, and medical prescriptions are restricted to authorized Doctors.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsReceiptModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-teal-400/40 bg-teal-500/20 hover:bg-teal-500/30 py-3.5 text-xs font-bold text-teal-200 transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
              >
                <FileText className="h-4 w-4" />
                <span>View Patient Case Sheets &amp; Receipts</span>
              </button>

              <button
                type="button"
                onClick={() => router.push("/intake")}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 py-3.5 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <HeartPulse className="h-4 w-4 stroke-[2.5]" />
                <span>Return to Nurse Station</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  localStorage.setItem("userRole", "doctor");
                  setIsNurseAccessBlocked(false);
                }}
                className="w-full text-center text-[11px] font-semibold text-slate-400 hover:text-slate-200 pt-1 cursor-pointer transition-colors"
              >
                Sign in as Doctor instead →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          OFFICIAL PATIENT ADMISSION RECEIPT MODAL
         ══════════════════════════════════════════════════════ */}
      <PatientReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        initialPatient={selectedPatient}
      />

      <footer className="mx-auto w-full max-w-[1600px] mt-6 text-center text-xs text-slate-400/70">
        <p>© 2026 Smart Triage Co-Pilot · Clinical Decision Support System for Rural PHCs</p>
      </footer>
    </main>
  );
}
