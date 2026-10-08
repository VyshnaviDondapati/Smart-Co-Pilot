import { NextRequest, NextResponse } from "next/server";

/**
 * Robust Multilingual Clinical Entity Parser (Telugu, Hindi, English)
 * Dynamically parses whatever text the user speaks/submits.
 */
function parseDynamicConsultationText(text: string): Record<string, string> {
  const lower = text.toLowerCase();
  const result: Record<string, string> = {
    name: "",
    age: "",
    bpSystolic: "",
    bpDiastolic: "",
    height: "",
    weight: "",
    bloodGroup: "",
    temperature: "",
    sugarLevel: "",
    wbcCount: "",
    aggravatingRelieving: "",
    pastSurgical: "",
    familyHistory: "",
    personalHistory: "",
    currentMedications: "",
    allergies: "",
    sleepCycle: "",
    urineIssues: "",
  };

  // 1. Patient Name (English: name is X / Telugu: పేరు X / Hindi: नाम X)
  const nameMatch = text.match(
    /(?:patient(?:\s+name)?(?:\s+is)?|name(?:\s+is)?|పేరు(?:\s+is)?|రోగి\s+పేరు|नाम(?:\s+is)?)\s+([\u0C00-\u0C7F\u0900-\u097Fa-zA-Z\s]{2,25}?)(?:\s+(?:age|is|years|bp|blood|sugar|temp|having|weight|height|temperature|వయస్సు|బీపీ|షుగర్)|$)/i
  );
  if (nameMatch && nameMatch[1]) {
    const raw = nameMatch[1].trim();
    if (raw.length > 2 && !["is", "the", "a", "of", "having", "with", "అని", "గారి"].includes(raw)) {
      result.name = raw.replace(/\b\w/g, (c) => c.toUpperCase());
    }
  }

  // 2. Age (English / Telugu / Hindi)
  const ageMatch = text.match(
    /(?:age(?:\s+is)?|వయస్సు(?:\s+is)?|उम्र(?:\s+is)?)\s*(\d{1,3})|(\d{1,3})\s*(?:years|yrs|సంవత్సరాలు|साल)/i
  );
  if (ageMatch) {
    const val = ageMatch[1] || ageMatch[2];
    if (parseInt(val, 10) > 0 && parseInt(val, 10) <= 120) {
      result.age = val;
    }
  }

  // 3. Blood Pressure (BP)
  const bpMatch = text.match(
    /(?:bp|blood\s*pressure|బీపీ|రక్తపోటు|बीपी|रक्तचाप)(?:\s+is)?\s*(\d{2,3})(?:\s*(?:over|\/|by|మరియు|\s)\s*)(\d{2,3})/i
  );
  if (bpMatch) {
    result.bpSystolic = bpMatch[1];
    result.bpDiastolic = bpMatch[2];
  }

  // 4. Sugar Level / Glucose
  const sugarMatch = text.match(
    /(?:sugar(?:\s*(?:level|count|value|reading|is|was|at))?|blood\s*sugar|glucose|rbs|grbs|glycemia|షుగర్(?:\s*(?:లెవల్|లెవెల్|స్థాయి|పరిమాణం))?|షుగరు|చక్కెర(?:\s*స్థాయి)?|రక్తంలో\s*చక్కెర|शुगर|ग्लूकोज)\s*(?:is|was|at|of|=|:|-)?\s*(\d{2,3})/i
  );
  if (sugarMatch && sugarMatch[1]) {
    const val = parseInt(sugarMatch[1], 10);
    if (val >= 30 && val <= 600) {
      result.sugarLevel = String(val);
    }
  }

  // 5. WBC Count
  const wbcMatch = text.match(
    /(?:w\s*\.?\s*b\s*\.?\s*c(?:\s*(?:count|cells?|is|was|at))?|white\s*blood\s*(?:cells?|count)|total\s*(?:wbc\s*)?count|cbp|leukocytes?|డబ్ల్యూ\s*బీ\s*సీ|డబ్ల్యూబీసీ|డబ్ల్యు\s*బి\s*సి|డబ్ల్యుబిసి|తెల్ల\s*రక్త\s*కణాలు|తెల్ల\s*కణాలు|डब्ल्यूबीसी|टीएलसी)\s*(?:is|was|at|of|=|:|-)?\s*(\d{1,2}[\s,]?\d{3}|\d{4,5})/i
  );
  if (wbcMatch && wbcMatch[1]) {
    const cleanWBC = wbcMatch[1].replace(/[\s,]/g, "");
    const val = parseInt(cleanWBC, 10);
    if (val >= 1000 && val <= 100000) {
      result.wbcCount = String(val);
    }
  }

  // 6. Body Temperature
  const tempMatch = text.match(
    /(?:temperature|temp|fever|టెంపరేచర్|జ్వరం|ఉష్ణోగ్రత|बुखार)(?:\s+is)?\s*(\d{2,3}(?:\.\d{1,2})?)/i
  );
  if (tempMatch) {
    result.temperature = tempMatch[1];
  }

  // 7. Height & Weight
  const heightMatch = text.match(
    /(?:height|ఎత్తు|लंबाई)(?:\s+is)?\s*(\d{2,3})|(\d{2,3})\s*(?:cm|centimeters|సెంటీమీటర్లు)/i
  );
  if (heightMatch) {
    result.height = heightMatch[1] || heightMatch[2];
  }

  const weightMatch = text.match(
    /(?:weight|బరువు|वजन)(?:\s+is)?\s*(\d{2,3}(?:\.\d{1,2})?)|(\d{2,3}(?:\.\d{1,2})?)\s*(?:kg|kilos|kilograms|కేజీలు|కిలోలు)/i
  );
  if (weightMatch) {
    result.weight = weightMatch[1] || weightMatch[2];
  }

  // 8. Blood Group
  const bgMatch = text.match(
    /(?:blood\s*group|type|రక్త\s*గ్రూపు|బ్లడ్\s*గ్రూప్)\s*([a-z]{1,2})\s*(positive|negative|\+|\-|పాజిటివ్|నెగటివ్)/i
  );
  if (bgMatch) {
    const type = bgMatch[1].toUpperCase();
    const isPos = bgMatch[2].includes("pos") || bgMatch[2] === "+" || bgMatch[2].includes("పాజిటివ్");
    if (["A", "B", "AB", "O"].includes(type)) {
      result.bloodGroup = `${type}${isPos ? "+" : "-"}`;
    }
  }

  // 9. Aggravating & Relieving Factors
  if (lower.includes("aggravat") || lower.includes("reliev") || lower.includes("worse") || lower.includes("better") || lower.includes("exertion") || lower.includes("pain increases") || lower.includes("నొప్పి")) {
    const factorMatch = text.match(/(?:pain|symptoms?|aggravated|relieved|increases?|worse|better|rest|exertion)[\w\s,()]+/i);
    result.aggravatingRelieving = factorMatch ? factorMatch[0].trim() : text.slice(0, 120).trim();
  }

  // 10. Past Surgical History
  if (lower.includes("surgery") || lower.includes("operation") || lower.includes("appendectomy") || lower.includes("hernia") || lower.includes("cesarean") || lower.includes("operated")) {
    const surgicalMention = text.match(/(?:surgery|operation|operated|had|underwent)[\w\s,()0-9]+/i);
    result.pastSurgical = surgicalMention ? surgicalMention[0].trim() : "Previous surgical history noted.";
  }

  // 11. Family History
  if (lower.includes("father") || lower.includes("mother") || lower.includes("family") || lower.includes("parents") || lower.includes("brother") || lower.includes("sister") || lower.includes("hereditary")) {
    const famMention = text.match(/(?:father|mother|family|parents)[\w\s,()]+/i);
    result.familyHistory = famMention ? famMention[0].trim() : "Positive family medical history noted.";
  }

  // 12. Personal History & Habits
  if (lower.includes("smoke") || lower.includes("smoking") || lower.includes("alcohol") || lower.includes("tobacco") || lower.includes("diet") || lower.includes("vegetarian") || lower.includes("lifestyle")) {
    const persMention = text.match(/(?:smok|alcohol|tobacco|diet|drink|vegetarian)[\w\s,()]+/i);
    result.personalHistory = persMention ? persMention[0].trim() : "Personal habits/diet reported.";
  }

  // 13. Current Medications
  if (lower.includes("taking") || lower.includes("tablet") || lower.includes("medicine") || lower.includes("medication") || lower.includes("metformin") || lower.includes("telmisartan") || lower.includes("insulin") || lower.includes("aspirin") || lower.includes("prescription")) {
    const medMention = text.match(/(?:taking|tablets?|medicines?|medications?|tab\.?|prescribed)[\w\s,()0-9mg]+/i);
    result.currentMedications = medMention ? medMention[0].trim() : "Current medications noted.";
  }

  // 14. Allergies
  if (lower.includes("allerg") || lower.includes("penicillin") || lower.includes("sulfa") || lower.includes("reaction")) {
    const allergyMention = text.match(/(?:allergic\s+to|allergy\s+to|allergic|allergy)[\w\s,()]+/i);
    result.allergies = allergyMention ? allergyMention[0].trim() : "Drug/food allergy reported.";
  }

  // 15. Sleep Cycle
  if (lower.includes("sleep") || lower.includes("insomnia") || lower.includes("waking up") || lower.includes("night") || lower.includes("restless")) {
    const sleepMention = text.match(/(?:sleep|insomnia|hours\s+of\s+sleep|sleeps?)[\w\s,()0-9]+/i);
    result.sleepCycle = sleepMention ? sleepMention[0].trim() : "Sleep patterns reported.";
  }

  // 16. Urine Issues
  if (lower.includes("urine") || lower.includes("urination") || lower.includes("burning") || lower.includes("nocturia") || lower.includes("dysuria") || lower.includes("micturition")) {
    const urineMention = text.match(/(?:urine|urination|burning|nocturia|dysuria)[\w\s,()]+/i);
    result.urineIssues = urineMention ? urineMention[0].trim() : "Urinary symptoms reported.";
  }

  return result;
}

/**
 * POST /api/scribe
 * Extracts structured clinical JSON from raw medical dialogue or transcripts
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transcript } = body;

    const queryText = transcript || "";

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && queryText && queryText.length > 5) {
      try {
        const prompt = `You are an AI clinical scribe for a rural Primary Health Centre.
Extract physiological and history parameters from the consultation text below into strict JSON format with these exact keys:
{
  "name": string,
  "age": string,
  "bpSystolic": string,
  "bpDiastolic": string,
  "height": string,
  "weight": string,
  "bloodGroup": string,
  "temperature": string,
  "sugarLevel": string,
  "wbcCount": string,
  "aggravatingRelieving": string,
  "pastSurgical": string,
  "familyHistory": string,
  "personalHistory": string,
  "currentMedications": string,
  "allergies": string,
  "sleepCycle": string,
  "urineIssues": string
}

Transcript:
"${queryText}"`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.1,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const jsonText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (jsonText) {
            const parsed = JSON.parse(jsonText);
            return NextResponse.json({ success: true, data: parsed, source: "gemini-2.5-flash" });
          }
        }
      } catch (err) {
        console.warn("Gemini Scribe extraction failed, using dynamic parser fallback:", err);
      }
    }

    // Dynamic Intelligent Multilingual Clinical Entity Extraction Fallback
    const extractedData = parseDynamicConsultationText(queryText);

    return NextResponse.json({
      success: true,
      data: extractedData,
      source: "smart-clinical-scribe-engine",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
