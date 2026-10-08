export interface AbnormalityItem {
  field: string;
  value: string;
  status: "CRITICAL_HIGH" | "CRITICAL_LOW" | "ELEVATED" | "LOW" | "NORMAL";
  severity: "RED" | "YELLOW" | "GREEN";
  finding: string;
  treatment: string;
  urgency: string;
}

export interface ClinicalAnalysis {
  hasAbnormalities: boolean;
  totalAbnormal: number;
  criticalCount: number;
  items: AbnormalityItem[];
  primaryDiagnosis: string;
  recommendedCarePlan: string[];
}

export function analyzePatientClinicalFindings(patient: {
  bpSystolic?: string;
  bpDiastolic?: string;
  sugarLevel?: string;
  bloodGlucose?: string;
  temperature?: string;
  wbcCount?: string;
  height?: string;
  weight?: string;
  bloodGroup?: string;
  isPregnant?: boolean;
  gestationalWeek?: string;
  fetalHeartRate?: string;
  diabetesType?: string;
  allergies?: string;
  symptoms?: string[];
  urgencyReason?: string;
}): ClinicalAnalysis {
  const items: AbnormalityItem[] = [];

  const sys = parseInt(patient.bpSystolic || "0", 10);
  const dia = parseInt(patient.bpDiastolic || "0", 10);
  const sugar = parseInt(patient.sugarLevel || patient.bloodGlucose || "0", 10);
  const temp = parseFloat(patient.temperature || "0");
  const wbc = parseInt(patient.wbcCount || "0", 10);
  const height = parseFloat(patient.height || "0");
  const weight = parseFloat(patient.weight || "0");

  // 1. Blood Pressure Analysis
  if (sys > 0 || dia > 0) {
    if (sys >= 180 || dia >= 120) {
      items.push({
        field: "Blood Pressure",
        value: `${sys}/${dia} mmHg`,
        status: "CRITICAL_HIGH",
        severity: "RED",
        finding: "🚨 Stage 3 Hypertensive Crisis — acute risk of cerebral stroke, myocardial infarction, or acute pulmonary edema.",
        treatment: "Administer Tab Amlodipine 5mg / Labetalol 20mg IV bolus. Immediate 12-lead ECG, serial BP monitoring q15min. Restrict fluids and evaluate for target organ damage.",
        urgency: "Stat (0-10 min)",
      });
    } else if (sys >= 140 || dia >= 90) {
      items.push({
        field: "Blood Pressure",
        value: `${sys}/${dia} mmHg`,
        status: "ELEVATED",
        severity: "YELLOW",
        finding: "⚠️ Stage 2 Hypertension — arterial pressure above clinical safe range.",
        treatment: "Initiate oral antihypertensive therapy (Telmisartan 40mg or Amlodipine 5mg). Repeat BP in 30 minutes. Advise low sodium diet and cardiac workup.",
        urgency: "Urgent (within 1 hr)",
      });
    } else if ((sys > 0 && sys < 90) || (dia > 0 && dia < 60)) {
      items.push({
        field: "Blood Pressure",
        value: `${sys}/${dia} mmHg`,
        status: "CRITICAL_LOW",
        severity: "RED",
        finding: "🚨 Hypotension / Hemodynamic Shock — systemic tissue hypoperfusion.",
        treatment: "Place patient in Trendelenburg position. Stat 500mL IV Normal Saline / Ringer's Lactate wide open. Rule out septic shock, hemorrhage, or anaphylaxis.",
        urgency: "Immediate Stat",
      });
    }
  }

  // 2. Blood Sugar / Glycemic Analysis
  if (sugar > 0) {
    if (sugar >= 250) {
      items.push({
        field: "Blood Glucose",
        value: `${sugar} mg/dL`,
        status: "CRITICAL_HIGH",
        severity: "RED",
        finding: "🚨 Severe Hyperglycemia — risk of Diabetic Ketoacidosis (DKA) or Hyperosmolar Hyperglycemic State (HHS).",
        treatment: "Administer Regular Human Insulin 6-10 Units sub-Q. Start IV Normal Saline 0.9% infusion. Stat urine dipstick for ketones, serum electrolytes, and hourly glucometry.",
        urgency: "Stat (0-15 min)",
      });
    } else if (sugar >= 140) {
      items.push({
        field: "Blood Glucose",
        value: `${sugar} mg/dL`,
        status: "ELEVATED",
        severity: "YELLOW",
        finding: "⚠️ Elevated Blood Sugar / Impaired Glucose Tolerance.",
        treatment: "Review oral antidiabetic agents (Metformin 500mg/Glimepiride). Fasting & post-prandial glycemic log, HbA1c test, and diabetic dietary modification.",
        urgency: "Routine Review",
      });
    } else if (sugar < 70) {
      items.push({
        field: "Blood Glucose",
        value: `${sugar} mg/dL`,
        status: "CRITICAL_LOW",
        severity: "RED",
        finding: "🚨 Acute Hypoglycemic Shock — risk of seizure, loss of consciousness, or permanent brain injury.",
        treatment: "Administer 100mL 25% Dextrose (D25) IV bolus immediately (or 15-20g fast-acting oral glucose if conscious). Recheck blood sugar in 15 minutes.",
        urgency: "Stat Immediate",
      });
    }
  }

  // 3. Temperature Analysis
  if (temp > 0) {
    if (temp >= 101.5) {
      items.push({
        field: "Body Temperature",
        value: `${temp} °F`,
        status: "CRITICAL_HIGH",
        severity: "RED",
        finding: "🚨 High Grade Pyrexia / Severe Febrile Episode — potential active systemic infection or bacteremia.",
        treatment: "Administer Tab/Inj Paracetamol 650mg stat. Cold sponge compresses. Send blood culture & malaria/dengue serology. Start empirical antibiotic cover.",
        urgency: "Prompt (15 min)",
      });
    } else if (temp >= 99.5) {
      items.push({
        field: "Body Temperature",
        value: `${temp} °F`,
        status: "ELEVATED",
        severity: "YELLOW",
        finding: "⚠️ Low-Grade Fever / Inflammatory Response.",
        treatment: "Tab Paracetamol 500mg SOS. Maintain oral hydration. Monitor temperature curve q2h.",
        urgency: "Within 1-2 hrs",
      });
    } else if (temp < 95.0) {
      items.push({
        field: "Body Temperature",
        value: `${temp} °F`,
        status: "CRITICAL_LOW",
        severity: "RED",
        finding: "🚨 Hypothermia — thermoregulatory failure or severe sepsis.",
        treatment: "Active external warming blankets. Warm IV fluids. Monitor core temperature and cardiac rhythm.",
        urgency: "Stat Immediate",
      });
    }
  }

  // 4. WBC / Leukocyte Count Analysis
  if (wbc > 0) {
    if (wbc >= 15000) {
      items.push({
        field: "WBC Count",
        value: `${wbc.toLocaleString()} /mcL`,
        status: "CRITICAL_HIGH",
        severity: "RED",
        finding: "🚨 Marked Leukocytosis — acute bacterial infection, deep-tissue abscess, or systemic inflammatory response (SIRS).",
        treatment: "Initiate IV Broad-Spectrum Antibiotics (Inj Ceftriaxone 1g IV or Co-Amoxiclav). Order Complete Blood Count (CBC) with differential, CRP/ESR, and focus imaging (Chest X-ray/Ultrasound).",
        urgency: "Stat (30 min)",
      });
    } else if (wbc >= 11000) {
      items.push({
        field: "WBC Count",
        value: `${wbc.toLocaleString()} /mcL`,
        status: "ELEVATED",
        severity: "YELLOW",
        finding: "⚠️ Moderate Leukocytosis — active inflammatory or localized infectious process.",
        treatment: "Oral antibiotic therapy (Tab Amoxicillin-Clavulanate 625mg BD x 5 days). Repeat CBC in 48 hours. Ensure fluid intake.",
        urgency: "Within 2 hrs",
      });
    } else if (wbc < 4000) {
      items.push({
        field: "WBC Count",
        value: `${wbc.toLocaleString()} /mcL`,
        status: "LOW",
        severity: "YELLOW",
        finding: "⚠️ Leukopenia — bone marrow suppression or severe viral infection (e.g. Dengue, Enteric fever).",
        treatment: "Strict barrier nursing / reverse isolation. Peripheral blood smear, viral panel, and avoid NSAIDs/immunosuppressants.",
        urgency: "Priority Review",
      });
    }
  }

  // 5. BMI Analysis
  if (height > 0 && weight > 0) {
    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);
    if (bmi >= 30) {
      items.push({
        field: "BMI / Weight",
        value: `${bmi.toFixed(1)} kg/m² (Obese)`,
        status: "ELEVATED",
        severity: "YELLOW",
        finding: "⚠️ Class 1+ Obesity — increased cardiovascular risk and insulin resistance.",
        treatment: "Lifestyle counseling, lipid profile test, cardiovascular risk screening, and dietary guidance.",
        urgency: "Routine Review",
      });
    } else if (bmi < 18.5) {
      items.push({
        field: "BMI / Weight",
        value: `${bmi.toFixed(1)} kg/m² (Underweight)`,
        status: "LOW",
        severity: "YELLOW",
        finding: "⚠️ Underweight / Nutritional Deficiency risk.",
        treatment: "Nutritional supplementation, serum albumin, screening for chronic malabsorption or anemia.",
        urgency: "Routine Review",
      });
    }
  }

  // 6. Pregnancy High-Risk Alert
  if (patient.isPregnant) {
    if (sys >= 140 || dia >= 90) {
      items.push({
        field: "Obstetric Complication",
        value: `Gestational BP ${sys}/${dia} mmHg`,
        status: "CRITICAL_HIGH",
        severity: "RED",
        finding: "🚨 Gestational Hypertension / Suspected Pre-Eclampsia — danger to maternal & fetal viability.",
        treatment: "Stat Labetalol 100mg orally or IV. Magnesium Sulfate (MgSO4) 4g IV loading dose if pre-eclamptic signs. Immediate Obstetric consult & fetal ultrasound.",
        urgency: "Stat Emergency",
      });
    }
  }

  const criticalCount = items.filter((i) => i.severity === "RED").length;
  const hasAbnormalities = items.length > 0;

  // Generate composite care plan
  const recommendedCarePlan = items.map((i) => `[${i.field}] ${i.treatment}`);

  let primaryDiagnosis = "Stable Vital Baseline";
  if (criticalCount > 0) {
    primaryDiagnosis = `Critical Multi-System Instability (${criticalCount} Critical Flag${criticalCount > 1 ? "s" : ""})`;
  } else if (items.length > 0) {
    primaryDiagnosis = `Physiological Deviation Requiring Intervention (${items.length} Finding${items.length > 1 ? "s" : ""})`;
  }

  return {
    hasAbnormalities,
    totalAbnormal: items.length,
    criticalCount,
    items,
    primaryDiagnosis,
    recommendedCarePlan,
  };
}
