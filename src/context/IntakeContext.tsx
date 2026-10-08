"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { playEmergencyRedAlertSound } from "@/lib/emergencyAudio";

export interface PersonalData {
  name: string;
  age: string;
  gender: "Female" | "Male" | "Other" | "";
  isEmergencyTrauma: boolean;
  traumaDetails?: string;
}

export interface VitalsData {
  bpSystolic: string;
  bpDiastolic: string;
  height: string;
  weight: string;
  sugarLevel: string;
  temperature: string;
  bloodGroup: string;
  wbcCount: string;
}

export interface DeepHistoryData {
  aggravatingRelieving: string;
  pastSurgical: string;
  familyHistory: string;
  personalHistory: string;
  currentMedications: string;
  allergies: string;
  sleepCycle: string;
  urineIssues: string;
}

export interface DiabetesData {
  glucoseLevel: string;
  classification: "None" | "Type 1" | "Type 2" | "Gestational" | "Suspected Prediabetes / Diabetes" | "Other";
  isHypoglycemic: boolean;
  hasDKASigns: boolean;
  hasFootUlcers: boolean;
  symptoms: string[];
}

export interface PregnancyData {
  isPregnant: boolean;
  gestationalWeeks: string;
  trimester: "1st Trimester (1-12w)" | "2nd Trimester (13-26w)" | "3rd Trimester (27-40w)" | "";
  preEclampsiaFlags: string[];
  complications: string[];
}

export interface TriageResult {
  priorityLevel: "P1-Red" | "P2-Yellow" | "P3-Green";
  urgencyScore: number; // 0 - 100
  reviewTimeLimit: string;
  reasons: string[];
  aiSummary: string;
}

interface IntakeContextType {
  personal: PersonalData;
  vitals: VitalsData;
  deepHistory: DeepHistoryData;
  diabetes: DiabetesData;
  pregnancy: PregnancyData;
  triageResult: TriageResult;
  updatePersonal: (data: Partial<PersonalData>) => void;
  updateVitals: (data: Partial<VitalsData>) => void;
  updateDeepHistory: (data: Partial<DeepHistoryData>) => void;
  updateDiabetes: (data: Partial<DiabetesData>) => void;
  updatePregnancy: (data: Partial<PregnancyData>) => void;
  triggerCodeRedTrauma: (traumaType?: string, patientName?: string) => Promise<any>;
  resetIntake: () => void;
}

const initialPersonal: PersonalData = {
  name: "",
  age: "",
  gender: "",
  isEmergencyTrauma: false,
  traumaDetails: "",
};

const initialVitals: VitalsData = {
  bpSystolic: "",
  bpDiastolic: "",
  height: "",
  weight: "",
  sugarLevel: "",
  temperature: "",
  bloodGroup: "",
  wbcCount: "",
};

const initialDeepHistory: DeepHistoryData = {
  aggravatingRelieving: "",
  pastSurgical: "",
  familyHistory: "",
  personalHistory: "",
  currentMedications: "",
  allergies: "",
  sleepCycle: "",
  urineIssues: "",
};

const initialDiabetes: DiabetesData = {
  glucoseLevel: "",
  classification: "None",
  isHypoglycemic: false,
  hasDKASigns: false,
  hasFootUlcers: false,
  symptoms: [],
};

const initialPregnancy: PregnancyData = {
  isPregnant: false,
  gestationalWeeks: "",
  trimester: "",
  preEclampsiaFlags: [],
  complications: [],
};

const IntakeContext = createContext<IntakeContextType | undefined>(undefined);

export function IntakeProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [personal, setPersonal] = useState<PersonalData>(initialPersonal);
  const [vitals, setVitals] = useState<VitalsData>(initialVitals);
  const [deepHistory, setDeepHistory] = useState<DeepHistoryData>(initialDeepHistory);
  const [diabetes, setDiabetes] = useState<DiabetesData>(initialDiabetes);
  const [pregnancy, setPregnancy] = useState<PregnancyData>(initialPregnancy);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load draft from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("smart_triage_intake_draft");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.personal) setPersonal(parsed.personal);
        if (parsed.vitals) setVitals(parsed.vitals);
        if (parsed.deepHistory) setDeepHistory(parsed.deepHistory);
        if (parsed.diabetes) setDiabetes(parsed.diabetes);
        if (parsed.pregnancy) setPregnancy(parsed.pregnancy);
      }
    } catch (e) {
      console.warn("Could not load intake draft from sessionStorage", e);
    }
    setIsLoaded(true);
  }, []);

  // Save draft to sessionStorage on change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      sessionStorage.setItem(
        "smart_triage_intake_draft",
        JSON.stringify({ personal, vitals, deepHistory, diabetes, pregnancy })
      );
    } catch (e) {}
  }, [personal, vitals, deepHistory, diabetes, pregnancy, isLoaded]);

  // Keep diabetes.glucoseLevel in sync with vitals.sugarLevel if not explicitly set
  useEffect(() => {
    if (vitals.sugarLevel && (!diabetes.glucoseLevel || diabetes.glucoseLevel === initialDiabetes.glucoseLevel)) {
      setDiabetes((prev) => {
        const sugarNum = parseFloat(vitals.sugarLevel);
        const autoClass =
          sugarNum > 140
            ? "Suspected Prediabetes / Diabetes"
            : prev.classification === "None"
            ? "None"
            : prev.classification;
        return {
          ...prev,
          glucoseLevel: vitals.sugarLevel,
          classification: prev.classification === "None" && sugarNum > 140 ? autoClass : prev.classification,
        };
      });
    }
  }, [vitals.sugarLevel]);

  const updatePersonal = (data: Partial<PersonalData>) => {
    setPersonal((prev) => ({ ...prev, ...data }));
  };

  const updateVitals = (data: Partial<VitalsData>) => {
    setVitals((prev) => ({ ...prev, ...data }));
  };

  const updateDeepHistory = (data: Partial<DeepHistoryData>) => {
    setDeepHistory((prev) => ({ ...prev, ...data }));
  };

  const updateDiabetes = (data: Partial<DiabetesData>) => {
    setDiabetes((prev) => ({ ...prev, ...data }));
  };

  const updatePregnancy = (data: Partial<PregnancyData>) => {
    setPregnancy((prev) => ({ ...prev, ...data }));
  };

  const resetIntake = () => {
    setPersonal(initialPersonal);
    setVitals(initialVitals);
    setDeepHistory(initialDeepHistory);
    setDiabetes(initialDiabetes);
    setPregnancy(initialPregnancy);
    try {
      sessionStorage.removeItem("smart_triage_intake_draft");
    } catch (e) {}
  };

  // ════════════════════════════════════════════════════════════════════
  // ⚡ DYNAMIC TRIAGE ENGINE & SUMMARY GENERATOR
  // ════════════════════════════════════════════════════════════════════
  const triageResult = useMemo<TriageResult>(() => {
    const reasons: string[] = [];
    let priority: "P1-Red" | "P2-Yellow" | "P3-Green" = "P3-Green";
    let score = 20;

    const sys = parseFloat(vitals.bpSystolic) || 0;
    const dia = parseFloat(vitals.bpDiastolic) || 0;
    const sugar = parseFloat(diabetes.glucoseLevel || vitals.sugarLevel) || 0;
    const wbc = parseFloat(vitals.wbcCount) || 0;
    const temp = parseFloat(vitals.temperature) || 0;

    // 1. Code Red Trauma Override
    if (personal.isEmergencyTrauma) {
      return {
        priorityLevel: "P1-Red",
        urgencyScore: 99,
        reviewTimeLimit: "IMMEDIATE (0-5 mins)",
        reasons: [
          `🚨 FAST-TRACK CODE RED TRAUMA OVERRIDE: ${personal.traumaDetails || "Acute Emergency / Resuscitation"}`,
          "Direct dispatch to trauma/resuscitation bay.",
        ],
        aiSummary: `EMERGENCY CODE RED: ${personal.name || "Unknown Patient"} (${personal.gender || "Patient"}, Age ${personal.age || "Unknown"}) presenting with acute trauma/critical instability (${personal.traumaDetails || "Emergency"}). Instant resuscitation protocol active.`,
      };
    }

    // 2. Critical Physiological Triggers (Level 1 Red)
    if (dia >= 120 || sys >= 190) {
      priority = "P1-Red";
      score = Math.max(score, 92);
      reasons.push(`Critical Hypertensive Crisis (${sys}/${dia} mmHg) — risk of acute organ damage / stroke`);
    }

    if (diabetes.isHypoglycemic || (sugar > 0 && sugar < 60)) {
      priority = "P1-Red";
      score = Math.max(score, 90);
      reasons.push(`Severe Hypoglycemic Crisis (${sugar} mg/dL) with neuroglycopenic shock risk`);
    }

    if (diabetes.hasDKASigns) {
      priority = "P1-Red";
      score = Math.max(score, 92);
      reasons.push("Suspected Diabetic Ketoacidosis (DKA) / Metabolic Emergency (Kussmaul breathing / Acetone breath)");
    }

    if (pregnancy.isPregnant) {
      if (pregnancy.complications.includes("Active Vaginal Bleeding") || pregnancy.complications.includes("Absent Fetal Movement")) {
        priority = "P1-Red";
        score = Math.max(score, 95);
        reasons.push("Obstetric Emergency: Active antepartum hemorrhage or loss of fetal movement");
      }
      if (
        (sys >= 150 || dia >= 95) &&
        (pregnancy.preEclampsiaFlags.includes("Severe Frontal Headache") || pregnancy.preEclampsiaFlags.includes("Visual Blurring / Scotoma") || pregnancy.preEclampsiaFlags.includes("Epigastric Pain"))
      ) {
        priority = "P1-Red";
        score = Math.max(score, 94);
        reasons.push(`Severe Pre-Eclampsia Alert (${sys}/${dia} mmHg in ${pregnancy.gestationalWeeks || "active"} weeks gestation with neurological/hepatic warning signs)`);
      }
    }

    if (wbc >= 20000) {
      priority = "P1-Red";
      score = Math.max(score, 88);
      reasons.push(`Extreme Leukocytosis (WBC ${wbc} cells/mcL) indicating severe systemic sepsis`);
    }

    // 3. Urgent Triggers (Level 2 Yellow)
    if (priority !== "P1-Red") {
      if (sys >= 140 || dia >= 90) {
        priority = "P2-Yellow";
        score = Math.max(score, 65);
        reasons.push(`Stage 2 Hypertension (${sys}/${dia} mmHg)`);
      }

      if (sugar >= 220) {
        priority = "P2-Yellow";
        score = Math.max(score, 70);
        reasons.push(`Uncontrolled Hyperglycemia (${sugar} mg/dL)`);
      }

      if (wbc >= 11000) {
        priority = "P2-Yellow";
        score = Math.max(score, 60);
        reasons.push(`Leukocytosis (WBC ${wbc} cells/mcL) — probable underlying acute infection`);
      }

      if (temp >= 101) {
        priority = "P2-Yellow";
        score = Math.max(score, 58);
        reasons.push(`High Grade Pyrexia (${temp} °F)`);
      }

      if (pregnancy.isPregnant && (pregnancy.preEclampsiaFlags.length > 0 || (sys >= 135 || dia >= 85))) {
        priority = "P2-Yellow";
        score = Math.max(score, 75);
        reasons.push(`Maternal Gestational Sentry: ${pregnancy.gestationalWeeks || "Pregnancy"} with pre-eclampsia risk indicators`);
      }

      if (diabetes.hasFootUlcers) {
        priority = "P2-Yellow";
        score = Math.max(score, 62);
        reasons.push("Diabetic Peripheral Complication: Non-healing ulcer / localized neuropathy");
      }

      if (deepHistory.allergies.toLowerCase().includes("penicillin") || deepHistory.allergies.toLowerCase().includes("severe")) {
        reasons.push(`Documented Drug Allergy Alert: ${deepHistory.allergies}`);
      }
    }

    if (reasons.length === 0) {
      reasons.push("Stable baseline physiological indicators within standard outpatient parameters.");
    }

    // AI Narrative Generation
    const narrativeParts: string[] = [];
    const ageGender = `${personal.age ? `${personal.age}yo` : "Adult"} ${personal.gender || "Patient"}`;
    narrativeParts.push(`${personal.name ? personal.name : "Patient"} (${ageGender})`);

    if (pregnancy.isPregnant) {
      narrativeParts.push(`at ${pregnancy.gestationalWeeks ? `${pregnancy.gestationalWeeks} weeks gestation` : "pregnancy"}`);
    }

    const vitalsList: string[] = [];
    if (sys && dia) vitalsList.push(`BP ${sys}/${dia}`);
    if (sugar) vitalsList.push(`Glucose ${sugar} mg/dL`);
    if (temp) vitalsList.push(`Temp ${temp}°F`);
    if (wbc) vitalsList.push(`WBC ${wbc}`);

    if (vitalsList.length > 0) {
      narrativeParts.push(`presenting with ${vitalsList.join(", ")}.`);
    }

    if (pregnancy.isPregnant && pregnancy.preEclampsiaFlags.length > 0) {
      narrativeParts.push(`Maternal screening notes ${pregnancy.preEclampsiaFlags.join(", ")}.`);
    }

    if (diabetes.isHypoglycemic) narrativeParts.push("Patient displays acute hypoglycemic tremor/confusion.");
    if (diabetes.hasDKASigns) narrativeParts.push("Kussmaul breathing and ketotic odor noted.");
    if (deepHistory.allergies) narrativeParts.push(`Allergies: ${deepHistory.allergies}.`);

    const aiSummary = narrativeParts.join(" ");

    const reviewTimeLimit =
      priority === "P1-Red"
        ? "≤ 15 minutes (Immediate)"
        : priority === "P2-Yellow"
        ? "≤ 30 - 45 minutes (Urgent)"
        : "Standard Outpatient (Routine)";

    return {
      priorityLevel: priority,
      urgencyScore: score,
      reviewTimeLimit,
      reasons,
      aiSummary,
    };
  }, [personal, vitals, deepHistory, diabetes, pregnancy]);

  // ════════════════════════════════════════════════════════════════════
  // 🚨 1-TAP CODE RED TRAUMA OVERRIDE FUNCTION
  // ════════════════════════════════════════════════════════════════════
  const triggerCodeRedTrauma = async (traumaType = "Acute Accident / Trauma", patientName = "Emergency Trauma Patient") => {
    // 1. Instantly play loud emergency red alert siren
    playEmergencyRedAlertSound(3.0);

    const updatedPersonal: PersonalData = {
      name: patientName || personal.name || "Emergency Trauma Patient",
      age: personal.age || "Adult",
      gender: personal.gender || "Other",
      isEmergencyTrauma: true,
      traumaDetails: traumaType,
    };

    setPersonal(updatedPersonal);

    // Save directly to persistent database and dispatch alert via API
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: updatedPersonal.name,
          category: traumaType,
          notes: `Code Red Trauma triggered from Nurse Station.`,
        }),
      });

      if (res.ok) {
        const saved = await res.json();
        return saved.patient || saved;
      }
    } catch (err) {
      console.error("Code red dispatch failed:", err);
    }
  };

  return (
    <IntakeContext.Provider
      value={{
        personal,
        vitals,
        deepHistory,
        diabetes,
        pregnancy,
        triageResult,
        updatePersonal,
        updateVitals,
        updateDeepHistory,
        updateDiabetes,
        updatePregnancy,
        triggerCodeRedTrauma,
        resetIntake,
      }}
    >
      {children}
    </IntakeContext.Provider>
  );
}

export function useIntake() {
  const context = useContext(IntakeContext);
  if (!context) {
    throw new Error("useIntake must be used within an IntakeProvider");
  }
  return context;
}

