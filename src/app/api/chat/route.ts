import { NextRequest, NextResponse } from "next/server";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequestBody {
  messages: ChatMessage[];
  transcript?: string;
  context?: {
    patientName?: string;
    age?: string;
    bp?: string;
    sugar?: string;
    wbc?: string;
    temp?: string;
    pregnant?: boolean;
    gestationalWeeks?: string;
    triageLevel?: string;
  };
}

/**
 * Parses natural dialogue (Telugu or English) and extracts structured parameters
 */
function extractVitalsFromText(text: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lower = text.toLowerCase();

  // Name (Telugu: పేరు / Hindi: नाम / English: Name)
  const nameMatch = text.match(/(?:patient(?:\s+name)?(?:\s+is)?|name(?:\s+is)?|పేరు(?:\s+is)?|రోగి\s+పేరు|नाम(?:\s+is)?|मरीज\s+का\s+नाम)\s+([\u0C00-\u0C7F\u0900-\u097Fa-zA-Z\s]{2,25}?)(?:\s+(?:age|is|years|bp|blood|sugar|temp|having|weight|height|temperature|వయస్సు|బీపీ|షుగర్|उम्र|बीपी)|$)/i);
  if (nameMatch && nameMatch[1]) {
    const raw = nameMatch[1].trim();
    if (raw.length > 2 && !["is", "the", "a", "of", "having", "with", "అని", "గారి", "का"].includes(raw)) {
      result.name = raw.replace(/\b\w/g, (c) => c.toUpperCase());
    }
  }

  // Age (Telugu: వయస్సు / Hindi: उम्र, साल / English: Age)
  const ageMatch = text.match(/(?:age(?:\s+is)?|వయస్సు(?:\s+is)?|उम्र(?:\s+is)?)\s*(\d{1,3})|(\d{1,3})\s*(?:years|yrs|సంవత్సరాలు|साल)/i);
  if (ageMatch) {
    const val = ageMatch[1] || ageMatch[2];
    if (parseInt(val, 10) > 0 && parseInt(val, 10) <= 120) {
      result.age = val;
    }
  }

  // Blood Pressure (Telugu: బీపీ, రక్తపోటు / Hindi: बीपी, रक्तचाप / English: BP)
  const bpMatch = text.match(/(?:bp|blood\s*pressure|బీపీ|రక్తపోటు|बीपी|रक्तचाप)(?:\s+is)?\s*(\d{2,3})(?:\s*(?:over|\/|by|మరియు|और|\s)\s*)(\d{2,3})/i);
  if (bpMatch) {
    result.bpSystolic = bpMatch[1];
    result.bpDiastolic = bpMatch[2];
  }

  // Sugar Level (Telugu: షుగర్, చక్కెర / Hindi: शुगर, ग्लूकोज / English: Sugar)
  const sugarMatch = text.match(/(?:sugar(?:\s*(?:level|count|value|reading|is|was|at))?|blood\s*sugar|glucose|rbs|grbs|glycemia|షుగర్(?:\s*(?:లెవల్|లెవెల్|స్థాయి|పరిమాణం))?|షుగరు|చక్కెర(?:\s*స్థాయి)?|రక్తంలో\s*చక్కెర|शुगर|ग्लूकोज)\s*(?:is|was|at|of|=|:|-)?\s*(\d{2,3})/i);
  if (sugarMatch && sugarMatch[1]) {
    const val = parseInt(sugarMatch[1], 10);
    if (val >= 30 && val <= 600) {
      result.sugarLevel = String(val);
    }
  }

  // WBC Count (Telugu: డబ్ల్యూబీసీ, తెల్ల కణాలు / Hindi: डब्ल्यूबीसी / English: WBC)
  const wbcMatch = text.match(/(?:w\s*\.?\s*b\s*\.?\s*c(?:\s*(?:count|cells?|is|was|at))?|white\s*blood\s*(?:cells?|count)|total\s*(?:wbc\s*)?count|cbp|leukocytes?|డబ్ల్యూ\s*బీ\s*సీ|డబ్ల్యూబీసీ|డబ్ల్యు\s*బి\s*సి|డబ్ల్యుబిసి|తెల్ల\s*రక్త\s*కణాలు|తెల్ల\s*కణాలు|डब्ल्यूबीसी|टीएलसी)\s*(?:is|was|at|of|=|:|-)?\s*(\d{1,2}[\s,]?\d{3}|\d{4,5})/i);
  if (wbcMatch && wbcMatch[1]) {
    const cleanWBC = wbcMatch[1].replace(/[\s,]/g, "");
    const val = parseInt(cleanWBC, 10);
    if (val >= 1000 && val <= 100000) {
      result.wbcCount = String(val);
    }
  }

  // Temperature (Telugu: జ్వరం, ఉష్ణోగ్రత / Hindi: बुखार / English: Temp)
  const tempMatch = text.match(/(?:temperature|temp|fever|జ్వరం|టెంపరేచర్|ఉష్ణోగ్రత|बुखार)(?:\s+is)?\s*(\d{2,3}(?:\.\d{1,2})?)/i);
  if (tempMatch) {
    result.temperature = tempMatch[1];
  }

  // Height & Weight
  const heightMatch = text.match(/(?:height|ఎత్తు|लंबाई)(?:\s+is)?\s*(\d{2,3})|(\d{2,3})\s*(?:cm|centimeters|సెంటీమీటర్లు)/i);
  if (heightMatch) result.height = heightMatch[1] || heightMatch[2];

  const weightMatch = text.match(/(?:weight|బరువు|वजन)(?:\s+is)?\s*(\d{2,3}(?:\.\d{1,2})?)|(\d{2,3}(?:\.\d{1,2})?)\s*(?:kg|kilos|కేజీలు|किलो)/i);
  if (weightMatch) result.weight = weightMatch[1] || weightMatch[2];

  // Blood Group
  const bgMatch = text.match(/(?:blood\s*group|type|రక్త\s*గ్రూపు|బ్లడ్\s*గ్రూప్)\s*([a-z]{1,2})\s*(positive|negative|\+|\-|పాజిటివ్|నెగటివ్)/i);
  if (bgMatch) {
    const type = bgMatch[1].toUpperCase();
    const isPos = bgMatch[2].includes("pos") || bgMatch[2] === "+" || bgMatch[2].includes("పాజిటివ్");
    if (["A", "B", "AB", "O"].includes(type)) {
      result.bloodGroup = `${type}${isPos ? "+" : "-"}`;
    }
  }

  return result;
}

/**
 * Generates a concise, natural English summary translating ONLY what was spoken
 */
function buildConciseEnglishSummary(spokenText: string, extracted: Record<string, string>): string {
  const parts: string[] = [];

  if (extracted.name) parts.push(`Patient ${extracted.name}`);
  if (extracted.age) parts.push(`aged ${extracted.age} years`);

  const vitals: string[] = [];
  if (extracted.bpSystolic && extracted.bpDiastolic) vitals.push(`Blood Pressure ${extracted.bpSystolic}/${extracted.bpDiastolic} mmHg`);
  if (extracted.sugarLevel) vitals.push(`Blood Glucose ${extracted.sugarLevel} mg/dL`);
  if (extracted.temperature) vitals.push(`Temperature ${extracted.temperature} °F`);
  if (extracted.wbcCount) vitals.push(`WBC ${extracted.wbcCount} cells/mcL`);
  if (extracted.bloodGroup) vitals.push(`Blood Group ${extracted.bloodGroup}`);

  let summary = "";
  if (parts.length > 0) {
    summary += parts.join(", ");
  } else {
    summary += "Patient consultation recorded";
  }

  if (vitals.length > 0) {
    summary += `, with ${vitals.join(", ")}.`;
  } else {
    summary += `. Spoken dialogue: "${spokenText.slice(0, 100)}".`;
  }

  return summary;
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequestBody = await req.json();
    const { messages, transcript } = body;

    const userMessage = transcript || messages?.[messages.length - 1]?.content || "";

    // 1. Extract clinical parameters from spoken dialogue
    const extractedData = extractVitalsFromText(userMessage);

    // 2. Generate concise English summary directly translating the spoken matter
    const summary = buildConciseEnglishSummary(userMessage, extractedData);

    // 3. Optional Gemini API translation fallback if key is present
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && userMessage.length > 5) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `You are an AI Clinical Scribe. Translate this spoken consultation (which may be in Telugu or Hindi) into a concise, 1-to-2 sentence spoken English clinical summary for a nurse triage record. Mention ONLY the patient's name, age, symptoms, and vitals that were actually spoken. Do NOT include any introductory greetings or textbook lectures.\n\nSpoken dialogue:\n"${userMessage}"`,
                    },
                  ],
                },
              ],
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const aiReply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (aiReply) {
            return NextResponse.json({
              reply: aiReply.trim(),
              summary: aiReply.trim(),
              extractedData,
              success: true,
            });
          }
        }
      } catch (geminiError) {
        console.warn("Gemini API call bypassed:", geminiError);
      }
    }

    return NextResponse.json({
      reply: summary,
      summary: summary,
      extractedData,
      success: true,
    });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
