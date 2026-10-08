import { analyzePatientClinicalFindings } from "../src/lib/clinicalRules.js";
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
} from "../src/lib/db.js";

async function runTestSuite() {
  console.log("==========================================");
  console.log("🚀 STARTING SMART TRIAGE FULL VERIFICATION");
  console.log("==========================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
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
  
  const doctorUser = await findUserByEmail("doctor@hospital.org");
  assert(!!doctorUser, "Found default doctor account in database");
  
  const validDoctor = await validateUserCredentials("doctor@hospital.org", "doctor123");
  assert(!!validDoctor && validDoctor.role === "doctor", "Validated doctor credentials successfully");
  
  const invalidDoctor = await validateUserCredentials("doctor@hospital.org", "wrongPassword");
  assert(invalidDoctor === null, "Rejects invalid credentials");

  const nurseUser = await findUserByEmail("nurse@hospital.org");
  assert(!!nurseUser && nurseUser.role === "nurse", "Found default nurse account");

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

