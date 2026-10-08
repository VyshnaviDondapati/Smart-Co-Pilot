"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  MicOff,
  Radio,
  Volume2,
  FileText,
  RotateCcw,
} from "lucide-react";

/**
 * Clinical Speech-to-Entity Parser (English)
 * Instant zero-latency regex matching for all 10 clinical vitals and demographics.
 */
function parseSpokenVitals(transcript) {
  if (!transcript || typeof transcript !== "string") return {};
  const text = transcript.toLowerCase().trim();
  const result = {};

  // ── 1. Patient Name ──
  const nameMatch = text.match(
    /(?:patient(?:\s+name)?(?:\s+(?:is|named))?|name(?:\s+is)?)\s+([a-zA-Z\s]{2,30}?)(?:\s+(?:age|is|years|bp|blood|sugar|temp|having|weight|height|temperature|gender|male|female)|$)/i
  );
  if (nameMatch && nameMatch[1]) {
    const raw = nameMatch[1].trim().replace(/^(is|the|a|of|having|with|mr|mrs|ms|dr)\s+/i, "");
    if (raw.length >= 2 && !["is", "the", "a", "of", "having", "with", "patient", "and", "in"].includes(raw.toLowerCase())) {
      result.name = raw.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    }
  }

  // ── 2. Age ──
  const ageMatch = text.match(
    /(?:age(?:\s+(?:is|was|of))?)\s*(\d{1,3})|(\d{1,3})\s*(?:years\s*old|years|yrs)/i
  );
  if (ageMatch) {
    const val = parseInt(ageMatch[1] || ageMatch[2], 10);
    if (val > 0 && val <= 120) {
      result.age = String(val);
    }
  }

  // ── 3. Gender ──
  if (/(?:\bgender\s*(?:is)?\s*male|\bmale\s*patient|\bmale\b)/i.test(text) && !/\bfemale\b/i.test(text)) {
    result.gender = "Male";
  } else if (/(?:\bgender\s*(?:is)?\s*female|\bfemale\s*patient|\bfemale\b)/i.test(text)) {
    result.gender = "Female";
  } else if (/(?:\bgender\s*(?:is)?\s*other|\btransgender\b)/i.test(text)) {
    result.gender = "Other";
  }

  // ── 4. Blood Pressure (BP) ──
  const bpExplicitMatch = text.match(
    /(?:bp|blood\s*pressure)(?:\s*(?:is|was|at|of|=|:|-))?\s*(\d{2,3})(?:\s*(?:over|\/|by|and|or|\s|,|-)\s*)(\d{2,3})/i
  );
  if (bpExplicitMatch) {
    const sys = parseInt(bpExplicitMatch[1], 10);
    const dia = parseInt(bpExplicitMatch[2], 10);
    if (sys >= 60 && sys <= 260) result.bpSystolic = String(sys);
    if (dia >= 30 && dia <= 160) result.bpDiastolic = String(dia);
  } else {
    const sysMatch = text.match(/(?:systolic)(?:\s*(?:is|was|at|=|:|-))?\s*(\d{2,3})/i);
    const diaMatch = text.match(/(?:diastolic)(?:\s*(?:is|was|at|=|:|-))?\s*(\d{2,3})/i);
    if (sysMatch) result.bpSystolic = sysMatch[1];
    if (diaMatch) result.bpDiastolic = diaMatch[1];

    const slashMatch = text.match(/\b(1\d{2}|2[0-4]\d|[7-9]\d)\s*\/\s*([4-9]\d|1[0-2]\d)\b/);
    if (slashMatch) {
      result.bpSystolic = slashMatch[1];
      result.bpDiastolic = slashMatch[2];
    }
  }

  // ── 5. Sugar Level / Glucose ──
  const sugarMatch = text.match(
    /(?:sugar(?:\s*(?:level|count|value|reading|rate|is|was|at|of|=|:|-))?|blood\s*sugar|glucose|fasting\s*sugar|random\s*sugar|rbs|grbs|glycemia)(?:\s*(?:is|was|at|of|=|:|-))?\s*(\d{2,3})/i
  );
  if (sugarMatch && sugarMatch[1]) {
    const val = parseInt(sugarMatch[1], 10);
    if (val >= 30 && val <= 600) {
      result.sugarLevel = String(val);
    }
  }

  // ── 6. WBC Count / Total Count ──
  const wbcMatch = text.match(
    /(?:w\s*\.?\s*b\s*\.?\s*c(?:\s*(?:count|cells?|is|was|at|of|=|:|-))?|white\s*blood\s*(?:cells?|count)|total\s*(?:wbc\s*|leukocyte\s*)?count|cbp|tlc|leukocytes?)(?:\s*(?:is|was|at|of|=|:|-))?\s*(\d{1,2}[\s,]?\d{3}|\d{4,6})/i
  );
  if (wbcMatch && wbcMatch[1]) {
    const cleanWBC = wbcMatch[1].replace(/[\s,]/g, "");
    const val = parseInt(cleanWBC, 10);
    if (val >= 1000 && val <= 100000) {
      result.wbcCount = String(val);
    }
  }

  // ── 7. Temperature / Fever ──
  const tempMatch = text.match(
    /(?:temperature|temp|body\s*temp|fever)(?:\s*(?:is|was|at|of|=|:|-))?\s*(\d{2,3}(?:\.\d{1,2})?)/i
  );
  if (tempMatch && tempMatch[1]) {
    const val = parseFloat(tempMatch[1]);
    if (val >= 85 && val <= 112) {
      result.temperature = String(val);
    } else if (val >= 35 && val <= 42) {
      result.temperature = String(((val * 9) / 5 + 32).toFixed(1));
    }
  }

  // ── 8. Height ──
  const heightMatch = text.match(
    /(?:height)(?:\s*(?:is|was|at|of|=|:|-))?\s*(\d{2,3})|(\d{2,3})\s*(?:cm|centimeters)/i
  );
  if (heightMatch) {
    const val = parseInt(heightMatch[1] || heightMatch[2], 10);
    if (val >= 40 && val <= 250) {
      result.height = String(val);
    }
  }

  // ── 9. Weight ──
  const weightMatch = text.match(
    /(?:weight)(?:\s*(?:is|was|at|of|=|:|-))?\s*(\d{2,3}(?:\.\d{1,2})?)|(\d{2,3}(?:\.\d{1,2})?)\s*(?:kg|kgs|kilos|kilograms)/i
  );
  if (weightMatch) {
    const val = parseFloat(weightMatch[1] || weightMatch[2]);
    if (val >= 2 && val <= 300) {
      result.weight = String(val);
    }
  }

  // ── 10. Blood Group ──
  const bgMatch = text.match(
    /(?:blood\s*group|blood\s*type)?\s*(?:^|\s)(a|b|ab|o)\s*(?:group\s*)?(positive|negative|\+|\-)(?:$|\s)/i
  );
  if (bgMatch) {
    const type = bgMatch[1].toUpperCase();
    const posTerm = bgMatch[2].toLowerCase();
    const isPos = posTerm.includes("pos") || posTerm === "+";
    result.bloodGroup = `${type}${isPos ? "+" : "-"}`;
  }

  return result;
}

/**
 * Clinical Voice Scribe Component (English)
 * Non-destructive live continuous voice autofill + simultaneously allows manual typing
 */
export default function VoiceScribeWidget({ onDataExtracted }) {
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [extractedFields, setExtractedFields] = useState({});
  const [statusMessage, setStatusMessage] = useState("Click the microphone button to start speaking vitals.");

  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const isVoiceEnabledRef = useRef(true);
  const onDataExtractedRef = useRef(onDataExtracted);

  // Keep references synced to prevent stale closures
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    isVoiceEnabledRef.current = isVoiceEnabled;
  }, [isVoiceEnabled]);

  useEffect(() => {
    onDataExtractedRef.current = onDataExtracted;
  }, [onDataExtracted]);

  // Stop listening helper
  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  }, []);

  // Initialize Speech Recognition once (English)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatusMessage("Speech recognition not supported in this browser. Please use Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = async (event) => {
      if (!isVoiceEnabledRef.current) return;

      let fullTranscript = "";
      let latestSegment = "";

      for (let i = 0; i < event.results.length; i++) {
        const item = event.results[i][0].transcript;
        fullTranscript += item + " ";
        if (i === event.results.length - 1) {
          latestSegment = item;
        }
      }
      fullTranscript = fullTranscript.trim();
      setTranscript(fullTranscript);

      // Instant Zero-Latency Regex Matching
      const fullExtracted = parseSpokenVitals(fullTranscript);
      const latestExtracted = parseSpokenVitals(latestSegment);
      const combined = { ...fullExtracted, ...latestExtracted };

      if (Object.keys(combined).length > 0) {
        setExtractedFields((prev) => ({ ...prev, ...combined }));
        setStatusMessage(`✓ Auto-filled: ${Object.keys(combined).join(", ")}`);

        if (onDataExtractedRef.current) {
          onDataExtractedRef.current(combined);
        }

        // Dispatch global custom event for any other clinical listeners
        window.dispatchEvent(
          new CustomEvent("clinical-data-autofill", { detail: combined })
        );
      }

      // Background AI deep clinical NLP enrichment if transcript contains clinical text
      if (fullTranscript.length > 10) {
        try {
          const res = await fetch("/api/scribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transcript: fullTranscript }),
          });
          if (res.ok) {
            const aiData = await res.json();
            if (aiData.success && aiData.data) {
              const cleanAI = {};
              for (const [k, v] of Object.entries(aiData.data)) {
                if (v && String(v).trim().length > 0) cleanAI[k] = v;
              }
              if (Object.keys(cleanAI).length > 0) {
                setExtractedFields((prev) => ({ ...prev, ...cleanAI }));
                if (onDataExtractedRef.current) {
                  onDataExtractedRef.current(cleanAI);
                }
                window.dispatchEvent(
                  new CustomEvent("clinical-data-autofill", { detail: cleanAI })
                );
              }
            }
          }
        } catch (e) {}
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed") {
        setStatusMessage("Microphone permission denied. Please allow microphone access in browser settings.");
        setIsListening(false);
        isListeningRef.current = false;
      }
    };

    recognition.onend = () => {
      if (isListeningRef.current && isVoiceEnabledRef.current) {
        // Continuous auto-restart on natural speech pauses
        setTimeout(() => {
          if (isListeningRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {}
          }
        }, 150);
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      isListeningRef.current = false;
      try {
        recognition.stop();
      } catch (e) {}
    };
  }, []);

  // Master Power Toggle (Voice Autofill ON / OFF)
  const toggleMasterVoice = () => {
    if (isVoiceEnabled) {
      stopListening();
      setIsVoiceEnabled(false);
      isVoiceEnabledRef.current = false;
      setStatusMessage("● Voice autofill is OFF. Manual typing mode active.");
    } else {
      setIsVoiceEnabled(true);
      isVoiceEnabledRef.current = true;
      setStatusMessage("● Voice autofill is ON. Click microphone to speak.");
    }
  };

  // Main Mic Toggle Button
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    if (!isVoiceEnabled) {
      setIsVoiceEnabled(true);
      isVoiceEnabledRef.current = true;
    }

    if (isListening) {
      stopListening();
      setStatusMessage("Voice Scribe paused. Spoken vitals are saved in the form.");
    } else {
      try {
        setTranscript("");
        setExtractedFields({});
        recognitionRef.current.lang = "en-US";
        recognitionRef.current.start();
        setIsListening(true);
        isListeningRef.current = true;
        setStatusMessage("Listening continuously... Speak patient vitals clearly in English.");
      } catch (err) {
        console.warn("Could not start speech recognition:", err);
      }
    }
  };

  const handleClearTranscript = () => {
    setTranscript("");
    setExtractedFields({});
    setStatusMessage(isVoiceEnabled ? "Log cleared. Ready for next patient." : "Voice autofill is OFF.");
  };

  return (
    <div className="w-full rounded-2xl border border-teal-300/40 bg-gradient-to-r from-[#031d22]/80 via-[#072a30]/70 to-[#02181c]/80 p-4 sm:p-5 shadow-xl backdrop-blur-2xl transition-all">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Left: Microphone Action Button & Live Scribe Title */}
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={toggleListening}
            className={`
              relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border transition-all duration-300 cursor-pointer shadow-lg
              ${
                isListening
                  ? "bg-rose-500/25 border-rose-400 text-rose-300 shadow-[0_0_25px_rgba(244,63,94,0.6)] animate-pulse"
                  : isVoiceEnabled
                  ? "bg-teal-500/25 border-teal-300/60 text-teal-200 shadow-[0_0_20px_rgba(45,212,191,0.35)] hover:bg-teal-500/35 hover:scale-105"
                  : "bg-slate-800/60 border-slate-700 text-slate-400 opacity-80 hover:opacity-100"
              }
            `}
            title={isListening ? "Pause Listening" : isVoiceEnabled ? "Start Speaking" : "Turn Voice Autofill ON"}
          >
            {isListening ? (
              <>
                <span className="absolute inset-0 rounded-2xl bg-rose-500 opacity-30 animate-ping" />
                <Mic className="h-6 w-6 text-rose-300" />
              </>
            ) : isVoiceEnabled ? (
              <Mic className="h-6 w-6 text-teal-300" />
            ) : (
              <MicOff className="h-6 w-6 text-slate-400" />
            )}
          </button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-black tracking-wide text-white flex items-center gap-1.5">
                <Radio className="h-4 w-4 text-teal-400" />
                AI Clinical Voice Scribe (English)
              </span>

              {/* Master Power Toggle Button (ON / OFF) */}
              <button
                type="button"
                onClick={toggleMasterVoice}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                  isVoiceEnabled
                    ? "bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.35)]"
                    : "bg-slate-800/80 border-slate-600 text-slate-400 hover:text-white"
                }`}
                title="Click to toggle Voice Autofill ON or OFF"
              >
                <span className={`h-2 w-2 rounded-full ${isVoiceEnabled ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
                <span>Voice Autofill: {isVoiceEnabled ? "ON" : "OFF"}</span>
              </button>

              {/* Status Badge */}
              {isListening && (
                <span className="flex items-center gap-1.5 rounded-full bg-rose-500/20 border border-rose-400/40 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-rose-300 animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  Listening Continuously
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 mt-1 max-w-lg leading-normal font-medium">
              {statusMessage || "Speak patient vitals clearly in English to autofill the active form."}
            </p>
          </div>
        </div>

        {/* Right: Audio Waveform & Clear Log */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {isListening && (
            <div className="flex items-center gap-1 px-3 py-2 rounded-xl bg-black/40 border border-teal-400/30 backdrop-blur-md">
              <Volume2 className="h-3.5 w-3.5 text-rose-400 mr-1 animate-pulse" />
              <span className="h-2 w-1 bg-rose-400 rounded-full animate-pulse" style={{ animationDuration: "0.4s" }} />
              <span className="h-5 w-1 bg-teal-300 rounded-full animate-pulse" style={{ animationDuration: "0.6s" }} />
              <span className="h-3 w-1 bg-cyan-400 rounded-full animate-pulse" style={{ animationDuration: "0.5s" }} />
              <span className="h-6 w-1 bg-rose-400 rounded-full animate-pulse" style={{ animationDuration: "0.7s" }} />
              <span className="h-4 w-1 bg-emerald-400 rounded-full animate-pulse" style={{ animationDuration: "0.3s" }} />
            </div>
          )}

          {transcript && (
            <button
              type="button"
              onClick={handleClearTranscript}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-all cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Clear Log</span>
            </button>
          )}
        </div>

      </div>

      {/* ── Live Real-Time Spoken Dialogue Stream ── */}
      {transcript && (
        <div className="animate-fade-slide-in mt-3.5 rounded-xl border border-teal-400/30 bg-black/50 p-3 text-xs backdrop-blur-md">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 flex items-center gap-1">
              <FileText className="h-3 w-3" /> Live Spoken Dialogue:
            </span>
            <span className="text-[10px] text-emerald-300 font-mono font-semibold">
              Auto-Populated {Object.keys(extractedFields).length} field(s)
            </span>
          </div>
          <p className="text-slate-100 italic font-medium leading-relaxed">
            &ldquo;{transcript}&rdquo;
          </p>
        </div>
      )}

    </div>
  );
}
