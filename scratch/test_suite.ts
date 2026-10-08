import { analyzePatientClinicalFindings } from "../src/lib/clinicalRules";
import {
  findUserByEmail,
  validateUserCredentials,
  getAllPatients,
  savePatient,
  updatePatientStatus,
  getAllStaffMessages,
  saveStaffMessage,
  getResources,
  allocateIcuBed,
  createEmergencyAlert,
  getAllAlerts,
} from "../src/lib/db";

async function runTestSuite() {
  console.log("==========================================");
  console.log("🚀 STARTING SMART TRIAGE FULL VERIFICATION");
  console.log("==========================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name}`);
      failed++;
    }
  }

  // ── TEST 1: CLINICAL RULES & ABNORMALITY ENGINE ──
  console.log("📋 1. Testing Clinical Abnormality Rules Engine...");
  
  // 1a: Hypertensive Crisis + DKA
  const crisisResult = analyzePatientClinicalFindings({
    bpSystolic: "185",
    bpDiastolic: "125",
    sugarLevel: "320",
    temperature: "102.5",
    wbcCount: "16500",
  });
  assert(crisisResult.hasAbnormalities === true, "Detects critical abnormalities");
  assert(crisisResult.criticalCount >= 3, "Flags >= 3 critical red flags for Stage 3 HTN + DKA + Fever + WBC");
  assert(crisisResult.items.some(i => i.field === "Blood Pressure" && i.severity === "RED"), "Stage 3 HTN flagged as RED");
  assert(crisisResult.items.some(i => i.field === "Blood Glucose" && i.severity === "RED"), "Severe Hyperglycemia flagged as RED");

  // 1b: Pregnancy Pre-eclampsia
  const pregResult = analyzePatientClinicalFindings({
    isPregnant: true,
    bpSystolic: "150",
    bpDiastolic: "95",
  });
  assert(pregResult.items.some(i => i.field === "Obstetric Complication" && i.severity === "RED"), "Gestational Hypertension / Pre-eclampsia flagged as RED");

  // 1c: Normal Healthy Vitals
  const normalResult = analyzePatientClinicalFindings({
    bpSystolic: "120",
    bpDiastolic: "80",
    sugarLevel: "95",
    temperature: "98.4",
    wbcCount: "6500",
    height: "170",
    weight: "68",
  });
  assert(normalResult.hasAbnormalities === false, "Normal vitals have 0 abnormalities");
  assert(normalResult.criticalCount === 0, "Normal vitals have 0 critical flags");

  // ── TEST 2: DATABASE & USER AUTH VALIDATION ──
  console.log("\n🔒 2. Testing Database Operations & Auth Credentials...");
  
  const doctorUser = await findUserByEmail("doctor@smarttriage.org");
  assert(!!doctorUser, "Found default doctor account in database (doctor@smarttriage.org)");
  
  const validDoctor = await validateUserCredentials("doctor@smarttriage.org", "doctor123");
  assert(!!validDoctor && validDoctor.role === "doctor", "Validated doctor credentials successfully");
  
  const invalidDoctor = await validateUserCredentials("doctor@smarttriage.org", "wrongPassword");
  assert(invalidDoctor === null, "Rejects invalid credentials");

  const nurseUser = await findUserByEmail("nurse@smarttriage.org");
  assert(!!nurseUser && nurseUser.role === "nurse", "Found default nurse account (nurse@smarttriage.org)");

  // ── TEST 3: PATIENT INTAKE & TRIAGE QUEUE PERSISTENCE ──
  console.log("\n🏥 3. Testing Patient Intake & Queue Persistence...");
  
  const testPatient = await savePatient({
    name: "Automated Verification Test Patient",
    age: "45",
    gender: "Female",
    bpSystolic: "135",
    bpDiastolic: "85",
    bloodGlucose: "110",
    temperature: "98.6",
    bloodGroup: "O+",
    triagePriority: "YELLOW",
    urgencyScore: 55,
    urgencyReason: "Borderline blood pressure requiring routine monitoring.",
    symptoms: ["Mild headache"],
    status: "WAITING",
  });
  assert(!!testPatient && testPatient.id.startsWith("PT-"), "Created patient with ID " + testPatient?.id);

  const allPatients = await getAllPatients();
  assert(allPatients.some(p => p.id === testPatient.id), "Saved patient appears in full triage queue");

  const updateSuccess = await updatePatientStatus(testPatient.id, "IN_REVIEW", "Physician noted observation.");
  assert(!!updateSuccess && updateSuccess.status === "IN_REVIEW", "Updated patient status to IN_REVIEW with doctor notes");

  // ── TEST 4: STAFF CHAT MESSAGING & BROADCAST SYNC ──
  console.log("\n💬 4. Testing Hospital Staff Chat Persistence...");
  
  const savedMsg = await saveStaffMessage({
    sender: "Dr. Arvind Rao",
    role: "doctor",
    text: "Automated test message: Normal saline prepared.",
  });
  assert(!!savedMsg && savedMsg.sender === "Dr. Arvind Rao", "Persisted staff chat message");

  const allMessages = await getAllStaffMessages();
  assert(allMessages.some(m => m.id === savedMsg.id), "Chat message retrieved from database history");

  // ── TEST 5: RESOURCE MATRIX & EMERGENCY ALERTS ──
  console.log("\n🛏️ 5. Testing ICU Resources & Emergency Alerts...");
  
  const initialResources = await getResources();
  assert(initialResources.icuBeds.total === 6, "ICU Bed total is 6");
  
  const updatedBed = await allocateIcuBed(-1);
  assert(updatedBed.icuBeds.occupied === initialResources.icuBeds.occupied + 1, "Allocated 1 ICU bed");

  const deallocatedBed = await allocateIcuBed(1);
  assert(deallocatedBed.icuBeds.occupied === initialResources.icuBeds.occupied, "Deallocated ICU bed back to original");

  const emergencyAlert = await createEmergencyAlert("Test Trauma Victim", "Vehicle Collision", "Severe polytrauma.");
  assert(!!emergencyAlert.alert && emergencyAlert.patient.triagePriority === "RED", "Code Red emergency created P1 patient in queue");

  const allAlerts = await getAllAlerts();
  assert(allAlerts.some(a => a.id === emergencyAlert.alert.id), "Emergency alert logged in alerts registry");

  // ── TEST 6: MULTILINGUAL VOICE PARSING & TRANSLATION ──
  console.log("\n🎙️ 6. Testing Multilingual Voice Extraction (Telugu, Hindi, English)...");

  function parseMultilingual(text: string) {
    const res: Record<string, string> = {};
    const lower = text.toLowerCase();

    // Name
    const nameMatch = text.match(/(?:patient(?:\s+name)?(?:\s+is)?|name(?:\s+is)?|పేరు(?:\s+is)?|రోగి\s+పేరు|नाम(?:\s+is)?|मरीज\s+का\s+नाम)\s+([\u0C00-\u0C7F\u0900-\u097Fa-zA-Z\s]{2,25}?)(?:\s+(?:age|is|years|bp|blood|sugar|temp|having|weight|height|temperature|వయస్సు|బీపీ|షుగర్|उम्र|बीपी)|$)/i);
    if (nameMatch && nameMatch[1]) {
      const raw = nameMatch[1].trim();
      if (raw.length > 2 && !["is", "the", "a", "of", "having", "with", "అని", "గారి", "का"].includes(raw)) {
        res.name = raw.replace(/\b\w/g, (c) => c.toUpperCase());
      }
    }

    // Age
    const ageMatch = text.match(/(?:age(?:\s+is)?|వయస్సు(?:\s+is)?|उम्र(?:\s+is)?)\s*(\d{1,3})|(\d{1,3})\s*(?:years|yrs|సంవత్సరాలు|साल)/i);
    if (ageMatch) {
      const val = ageMatch[1] || ageMatch[2];
      if (parseInt(val, 10) > 0 && parseInt(val, 10) <= 120) res.age = val;
    }

    // BP
    const bpMatch = text.match(/(?:bp|blood\s*pressure|బీపీ|రక్తపోటు|बीपी|रक्तचाप)(?:\s+is)?\s*(\d{2,3})(?:\s*(?:over|\/|by|మరియు|और|\s)\s*)(\d{2,3})/i);
    if (bpMatch) {
      res.bpSystolic = bpMatch[1];
      res.bpDiastolic = bpMatch[2];
    }

    // Sugar
    const sugarMatch = text.match(/(?:sugar(?:\s*(?:level|count|value|reading|is|was|at))?|blood\s*sugar|glucose|rbs|grbs|glycemia|షుగర్(?:\s*(?:లెవల్|లెవెల్|స్థాయి|పరిమాణం))?|షుగరు|చక్కెర(?:\s*స్థాయి)?|రక్తంలో\s*చక్కెర|शुगर|ग्लूकोज)\s*(?:is|was|at|of|=|:|-)?\s*(\d{2,3})/i);
    if (sugarMatch && sugarMatch[1]) {
      res.sugarLevel = sugarMatch[1];
    }

    // Temp
    const tempMatch = text.match(/(?:temperature|temp|fever|జ్వరం|టెంపరేచర్|ఉష్ణోగ్రత|बुखार)(?:\s+is)?\s*(\d{2,3}(?:\.\d{1,2})?)/i);
    if (tempMatch) {
      res.temperature = tempMatch[1];
    }

    return res;
  }

  // 6a: Telugu Voice Consultation
  const teluguInput = "రోగి పేరు లక్ష్మి వయస్సు 48 బీపీ 145 95 షుగర్ 240 జ్వరం 100.2";
  const parsedTelugu = parseMultilingual(teluguInput);
  assert(parsedTelugu.name === "లక్ష్మి", "Telugu name extraction (లక్ష్మి)");
  assert(parsedTelugu.age === "48", "Telugu age extraction (48)");
  assert(parsedTelugu.bpSystolic === "145" && parsedTelugu.bpDiastolic === "95", "Telugu BP extraction (145/95)");
  assert(parsedTelugu.sugarLevel === "240", "Telugu sugar level extraction (240)");
  assert(parsedTelugu.temperature === "100.2", "Telugu temperature extraction (100.2)");

  // 6b: Hindi Voice Consultation
  const hindiInput = "मरीज का नाम राहुल उम्र 35 बीपी 120 80 शुगर 110 बुखार 99";
  const parsedHindi = parseMultilingual(hindiInput);
  assert(parsedHindi.name === "राहुल", "Hindi name extraction (राहुल)");
  assert(parsedHindi.age === "35", "Hindi age extraction (35)");
  assert(parsedHindi.bpSystolic === "120" && parsedHindi.bpDiastolic === "80", "Hindi BP extraction (120/80)");
  assert(parsedHindi.sugarLevel === "110", "Hindi sugar level extraction (110)");
  assert(parsedHindi.temperature === "99", "Hindi fever extraction (99)");

  // 6c: English Voice Consultation
  const englishInput = "Patient name is John Doe age 52 BP 130 over 85 blood sugar 160 temp 98.6";
  const parsedEnglish = parseMultilingual(englishInput);
  assert(parsedEnglish.name === "John Doe", "English name extraction (John Doe)");
  assert(parsedEnglish.age === "52", "English age extraction (52)");
  assert(parsedEnglish.bpSystolic === "130" && parsedEnglish.bpDiastolic === "85", "English BP extraction (130/85)");
  assert(parsedEnglish.sugarLevel === "160", "English sugar extraction (160)");
  assert(parsedEnglish.temperature === "98.6", "English temp extraction (98.6)");

  console.log("\n==========================================");
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
