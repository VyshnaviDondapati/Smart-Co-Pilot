"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  Mic,
  MicOff,
  Sparkles,
  X,
  Copy,
  Check,
  Volume2,
  VolumeX,
  FileText,
  RotateCcw,
  Languages,
  Loader2,
  CheckCircle2,
} from "lucide-react";

const supportedLanguages = [
  { code: "te-IN", label: "తెలుగు (Telugu)", flag: "🇮🇳" },
  { code: "en-IN", label: "English (India)", flag: "🇬🇧" },
  { code: "hi-IN", label: "हिन्दी (Hindi)", flag: "🇮🇳" },
  { code: "ta-IN", label: "தமிழ் (Tamil)", flag: "🇮🇳" },
  { code: "kn-IN", label: "ಕನ್ನಡ (Kannada)", flag: "🇮🇳" },
];

/**
 * Intelligent Speech Assistant:
 * Speak in Telugu/English ➔ Translates to concise English summary ➔ Reads it out ➔ Autofills the active form!
 */
export default function ClinicalSpeechAssistant() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedLang, setSelectedLang] = useState("te-IN");
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [autofilledFields, setAutofilledFields] = useState([]);

  const recognitionRef = useRef(null);

  // Initialize Speech Recognition with selected language
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = selectedLang;

        recognition.onresult = (event) => {
          let currentTranscript = "";
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + " ";
          }
          setTranscript(currentTranscript.trim());
        };

        recognition.onerror = (event) => {
          console.warn("Speech recognition notice:", event.error);
          if (event.error === "not-allowed") {
            setIsListening(false);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [selectedLang]);

  // Ensure microphone is completely stopped whenever the assistant is closed
  useEffect(() => {
    if (!isOpen && isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    }
  }, [isOpen, isListening]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (transcript.trim()) {
        processAndAutofill(transcript.trim());
      }
    } else {
      try {
        setTranscript("");
        setSummary("");
        setAutofilledFields([]);
        recognitionRef.current.lang = selectedLang;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn("Could not start speech recognition:", err);
      }
    }
  };

  /**
   * Translates spoken Telugu/English into a concise English summary,
   * reads it out loud, and autofills the active form!
   */
  const processAndAutofill = async (textToProcess) => {
    const raw = textToProcess || transcript;
    if (!raw.trim()) return;

    setIsSummarizing(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: raw,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const shortSummary = data.reply || data.summary;
        setSummary(shortSummary);

        // 1. Read out ONLY the concise English summary
        speakText(shortSummary);

        // 2. Autofill the active form via global event dispatch
        if (data.extractedData && Object.keys(data.extractedData).length > 0) {
          setAutofilledFields(Object.keys(data.extractedData));
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("clinical-data-autofill", {
                detail: data.extractedData,
              })
            );
          }
        }
      }
    } catch (err) {
      console.error("Error processing speech:", err);
    } finally {
      setIsSummarizing(false);
    }
  };

  const speakText = (text) => {
    if (!speechEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[#*`_~]/g, "").replace(/###/g, "");
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = "en-US";
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  };

  const handleCopy = () => {
    if (!summary && !transcript) return;
    navigator.clipboard.writeText(summary || transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setTranscript("");
    setSummary("");
    setAutofilledFields([]);
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Hide on login, auth, and root pages (after all hooks are initialized)
  if (pathname === "/auth" || pathname === "/login" || pathname === "/") {
    return null;
  }

  return (
    <>
      {/* ══════════════════════════════════════════════════════
          FLOATING TRIGGER BUTTON (Bottom-Right)
         ══════════════════════════════════════════════════════ */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 rounded-2xl border border-teal-300/40 bg-slate-950/85 px-4 py-2.5 text-xs font-bold text-teal-200 shadow-2xl backdrop-blur-xl hover:bg-slate-900 transition-all cursor-pointer"
          >
            <Mic className="h-4 w-4 text-teal-300 animate-pulse" />
            <span>Speak in &amp; Autofill</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            relative flex h-14 w-14 items-center justify-center rounded-2xl border transition-all duration-300 cursor-pointer shadow-2xl
            ${
              isOpen
                ? "bg-rose-500/20 border-rose-400/60 text-rose-300 shadow-[0_0_25px_rgba(244,63,94,0.6)]"
                : "bg-gradient-to-tr from-teal-500 via-cyan-500 to-emerald-400 border-teal-200/50 text-[#042f2e] shadow-[0_0_30px_rgba(45,212,191,0.7)] hover:scale-105 active:scale-95"
            }
          `}
          title={isOpen ? "Close Assistant" : "Speak in & Autofill"}
        >
          {isOpen ? (
            <X className="h-6 w-6 stroke-[2.5]" />
          ) : (
            <>
              <span className="absolute inset-0 rounded-2xl bg-teal-400 opacity-30 animate-ping" />
              <Mic className="h-7 w-7 stroke-[2.5]" />
            </>
          )}
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════
          SLEEK SPEECH & SUMMARY MODAL
         ══════════════════════════════════════════════════════ */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[440px] rounded-3xl border border-teal-300/40 bg-slate-950/95 shadow-[0_0_50px_rgba(13,148,136,0.35)] backdrop-blur-2xl transition-all duration-300 flex flex-col max-h-[82vh] overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 p-4 bg-gradient-to-r from-teal-950/70 via-slate-900/80 to-cyan-950/60">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 border border-teal-400/30 text-teal-300 shadow-md">
                <Mic className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white tracking-wide">
                  Speak in &amp; Autofill
                </h3>
                <p className="text-[11px] text-slate-300 flex items-center gap-1">
                  <Languages className="h-3 w-3 text-teal-400" />
                  <span>Speech-to-English Auto-Fill</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400">
              <button
                type="button"
                onClick={() => setSpeechEnabled(!speechEnabled)}
                className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${
                  speechEnabled ? "text-teal-300" : "text-slate-500"
                }`}
                title={speechEnabled ? "Mute Voice Readout" : "Enable Voice Readout"}
              >
                {speechEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                title="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-rose-500/20 hover:text-rose-300 transition-colors"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
            
            {/* Language Selection Row */}
            <div className="flex items-center justify-between bg-black/40 border border-white/10 p-2.5 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <Languages className="h-3.5 w-3.5 text-teal-400" /> Spoken Language:
              </span>
              <select
                value={selectedLang}
                onChange={(e) => {
                  setSelectedLang(e.target.value);
                  if (isListening && recognitionRef.current) {
                    recognitionRef.current.stop();
                    setIsListening(false);
                  }
                }}
                className="bg-black/60 border border-white/20 text-white text-xs font-bold rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
              >
                {supportedLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                    {lang.flag} {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Primary Microphone Action Button */}
            <div className="p-4 rounded-2xl border border-white/10 bg-black/40 text-center space-y-3">
              <button
                type="button"
                onClick={toggleListening}
                className={`
                  mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border transition-all duration-300 cursor-pointer shadow-xl
                  ${
                    isListening
                      ? "bg-rose-500/30 border-rose-400 text-rose-300 shadow-[0_0_30px_rgba(244,63,94,0.6)] animate-pulse scale-105"
                      : "bg-gradient-to-r from-teal-500 to-emerald-400 border-teal-200/50 text-[#042f2e] shadow-[0_0_20px_rgba(45,212,191,0.5)] hover:scale-105"
                  }
                `}
              >
                {isListening ? (
                  <MicOff className="h-8 w-8 stroke-[2.5]" />
                ) : (
                  <Mic className="h-8 w-8 stroke-[2.5]" />
                )}
              </button>

              <div>
                <p className="font-extrabold text-sm text-white">
                  {isListening ? "Listening Live in Telugu/English..." : "Click to Speak Consultation"}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isListening
                    ? "Speak patient vitals. Click again to translate, read out & autofill."
                    : "Speak in Telugu or English. I will translate to concise English, read it out, and fill the form."}
                </p>
              </div>
            </div>

            {/* Live Spoken Transcript */}
            {transcript && (
              <div className="animate-fade-slide-in rounded-2xl border border-white/15 bg-black/50 p-3.5 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1 text-teal-300">
                    <FileText className="h-3 w-3" /> Spoken Dialogue:
                  </span>
                  {!summary && !isSummarizing && (
                    <button
                      type="button"
                      onClick={() => processAndAutofill(transcript)}
                      className="text-teal-300 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                    >
                      <Sparkles className="h-3 w-3" /> Translate &amp; Autofill
                    </button>
                  )}
                </div>
                <p className="text-slate-100 italic leading-relaxed font-medium">
                  &ldquo;{transcript}&rdquo;
                </p>
              </div>
            )}

            {/* Loading Indicator */}
            {isSummarizing && (
              <div className="flex items-center justify-center gap-2 p-3 text-teal-300 bg-teal-950/30 rounded-xl border border-teal-400/20">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="font-semibold text-xs">Translating &amp; autofilling form in English…</span>
              </div>
            )}

            {/* Concise English Summary (Read out aloud) */}
            {summary && (
              <div className="animate-fade-slide-in rounded-2xl border border-teal-400/40 bg-teal-950/25 p-4 space-y-2.5">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                    <Volume2 className="h-3.5 w-3.5 text-teal-400 animate-pulse" /> English Spoken Summary:
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-white bg-white/10 px-2 py-1 rounded-md transition-all cursor-pointer"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                <p className="text-slate-100 text-xs font-semibold leading-relaxed">
                  {summary}
                </p>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="p-3 bg-black/60 border-t border-white/10 text-center text-[10px] text-slate-400">
            Real-time multilingual consultation scribe for Primary Health Centres
          </div>
        </div>
      )}
    </>
  );
}
