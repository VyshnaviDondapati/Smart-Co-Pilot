"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  X,
  Send,
  Bell,
  Volume2,
  Stethoscope,
  HeartPulse,
  User,
  Zap,
  CheckCircle,
} from "lucide-react";
import { useStaffChat } from "@/context/StaffChatContext";

export default function StaffChatWidget() {
  const pathname = usePathname();
  const {
    messages,
    sendMessage,
    isChatOpen,
    setIsChatOpen,
    unreadCount,
    activeToast,
    dismissToast,
    playNotificationSound,
    currentUserRole,
    setCurrentUserRole,
    currentUserName,
  } = useStaffChat();

  const [inputVal, setInputVal] = useState("");

  const handleSend = (text?: string) => {
    const toSend = text || inputVal;
    if (!toSend.trim()) return;
    sendMessage(toSend);
    if (!text) setInputVal("");
  };

  const isDoctor = currentUserRole === "doctor";

  // Hide on login, auth, and root pages (after all hooks are initialized)
  if (pathname === "/auth" || pathname === "/login" || pathname === "/") {
    return null;
  }

  return (
    <>
      {/* ══════════════════════════════════════════════════════
          1. REAL-TIME TOAST NOTIFICATION POPUP (TOP-RIGHT)
         ══════════════════════════════════════════════════════ */}
      {activeToast && !isChatOpen && (
        <div className="fixed top-5 right-5 z-50 max-w-md w-full animate-bounce-short">
          <div
            onClick={() => setIsChatOpen(true)}
            className="rounded-2xl border-2 border-teal-400 bg-slate-950/95 p-4 shadow-[0_0_35px_rgba(20,184,166,0.5)] backdrop-blur-2xl transition-all hover:scale-[1.02] cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300 border border-teal-400/40">
                  <Bell className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-teal-300">
                      {activeToast.role === "doctor" ? "👨‍⚕️ Doctor Message" : "👩‍⚕️ Nurse Message"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">{activeToast.time}</span>
                  </div>
                  <h4 className="text-sm font-black text-white">{activeToast.sender}</h4>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  dismissToast();
                }}
                className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-2.5 text-xs text-slate-200 font-semibold leading-relaxed bg-black/40 p-2.5 rounded-xl border border-white/10">
              &quot;{activeToast.text}&quot;
            </p>

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-teal-300 font-bold">
              <span className="flex items-center gap-1">
                <Volume2 className="h-3.5 w-3.5" />
                <span>Audio Alert</span>
              </span>
              <span className="underline font-extrabold text-teal-200">Click to open Chat Box →</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Staff Chat Toggle Button (Positioned cleanly on Bottom-Left) */}
      {!isChatOpen && (
        <div className="fixed bottom-6 left-4 sm:left-6 z-40 flex items-center">
          <button
            type="button"
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-2.5 rounded-2xl border border-teal-400/50 bg-slate-950/95 hover:bg-slate-900 px-4 py-3 text-xs font-bold text-teal-200 shadow-[0_4px_25px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all cursor-pointer hover:scale-105 active:scale-95 group"
            title="Open Hospital Staff Real-Time Chat"
          >
            <div className="relative flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-teal-300 group-hover:animate-pulse" />
              {unreadCount > 0 && (
                <span className="absolute -top-2.5 -right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white shadow-md animate-bounce">
                  {unreadCount}
                </span>
              )}
            </div>
            <span>Staff Chat</span>
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          2. UNIFIED CHAT BOX (SPACIOUS & CLEAR ON BOTTOM-LEFT)
         ══════════════════════════════════════════════════════ */}
      {isChatOpen && (
        <div className="fixed bottom-6 left-4 sm:left-6 z-50 flex h-[600px] w-[420px] max-w-[calc(100vw-28px)] flex-col overflow-hidden rounded-3xl border-2 border-teal-400/60 bg-zinc-950/95 shadow-[0_0_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl animate-scale-up">
          
          {/* Header */}
          <div className="border-b border-white/10 bg-slate-900/90 p-4 shrink-0 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300 border border-teal-400/40">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Chat Box</h3>
                  <span className="text-[10px] text-teal-300 font-bold flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    Live Doctor &amp; Nurse Communication
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={playNotificationSound}
                  title="Test Chime Sound"
                  className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10 hover:text-teal-300 transition-colors cursor-pointer"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsChatOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-rose-500/20 hover:text-rose-200 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Active User Badge (Clean, WhatsApp-style header without manual toggle) */}
            <div className="flex items-center justify-between rounded-xl bg-black/40 px-3 py-2 border border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-300 font-medium">Logged in:</span>
                <span className="font-bold text-teal-300">
                  {isDoctor
                    ? `👨‍⚕️ ${currentUserName || "Dr. Arvind Rao"}`
                    : `👩‍⚕️ ${currentUserName || "Duty Nurse Priya"}`}
                </span>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30">
                {isDoctor ? "Doctor Portal" : "Nurse Station"}
              </span>
            </div>
          </div>

          {/* Quick Message Templates */}
          <div className="border-b border-white/10 bg-black/40 p-3 space-y-1.5 shrink-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              1-Tap Quick Messages:
            </span>
            <div className="flex flex-wrap gap-1">
              {(isDoctor
                ? [
                    "Prepare Trauma Bed 1",
                    "Administer Normal Saline IV",
                    "Run Urgent Blood Test",
                    "Admit to ICU immediately",
                  ]
                : [
                    "Patient vitals recorded",
                    "Trauma Bed 1 is ready",
                    "Oxygen cylinder attached",
                    "Doctor review needed",
                  ]
              ).map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleSend(chip)}
                  className="rounded-lg border border-white/10 bg-white/5 hover:bg-teal-500/20 hover:border-teal-400/40 px-2.5 py-1 text-[10px] font-bold text-slate-300 hover:text-teal-200 transition-all cursor-pointer text-left"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Stream — WhatsApp Style: My Messages on RIGHT, Incoming Messages on LEFT */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-black/20">
            {messages.map((msg) => {
              // WhatsApp Relative Alignment:
              // If sent by the current viewer's role -> RIGHT (Me)
              // If sent by the other role -> LEFT (Incoming Colleague)
              const isMe = msg.role === currentUserRole;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"} space-y-1`}
                >
                  <div
                    className={`flex items-center gap-1.5 text-[10px] font-bold px-1 ${
                      isMe ? "flex-row-reverse text-teal-300" : "flex-row text-slate-400"
                    }`}
                  >
                    <span>
                      {isMe
                        ? `You (${currentUserName || (isDoctor ? "Doctor" : "Nurse")})`
                        : msg.role === "doctor"
                        ? `👨‍⚕️ ${msg.sender}`
                        : `👩‍⚕️ ${msg.sender}`}
                    </span>
                    <span>•</span>
                    <span className="text-slate-400 font-medium">{msg.time}</span>
                  </div>
                  <div
                    className={`
                      max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed font-semibold shadow-lg
                      ${
                        isMe
                          ? "bg-teal-500/30 border border-teal-300/40 text-teal-50 rounded-tr-none shadow-[0_2px_12px_rgba(20,184,166,0.25)] text-left"
                          : "bg-slate-900/90 border border-white/15 text-slate-100 rounded-tl-none shadow-[0_2px_12px_rgba(0,0,0,0.5)] text-left"
                      }
                    `}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="border-t border-white/10 bg-slate-950 p-3.5 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              placeholder={`Send message as ${currentUserName || (isDoctor ? "Doctor" : "Nurse")}…`}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 rounded-xl border border-white/15 bg-black/60 py-2.5 px-3 text-xs font-semibold text-white placeholder-slate-400 focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400/30"
            />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md shrink-0 font-bold"
            >
              <Send className="h-4 w-4 stroke-[2.5]" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
