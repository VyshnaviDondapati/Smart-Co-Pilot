"use client";

import React from "react";
import Link from "next/link";
import { AlertOctagon } from "lucide-react";
import { playEmergencyRedAlertSound } from "@/lib/emergencyAudio";

export default function CodeRedTraumaModal() {
  const handleClick = () => {
    try {
      playEmergencyRedAlertSound(2.0);
    } catch {}
  };

  return (
    <Link
      href="/red-alert"
      onClick={handleClick}
      className="
        flex items-center gap-1.5 rounded-xl border border-rose-500/70 bg-rose-600/30 hover:bg-rose-600
        px-3.5 py-1.5 text-xs font-bold text-rose-200 hover:text-white
        shadow-[0_0_15px_rgba(244,63,94,0.4)] hover:shadow-[0_0_25px_rgba(244,63,94,0.8)]
        transition-all duration-200 cursor-pointer active:scale-95 shrink-0
      "
      title="Immediate Emergency Red Alert Override"
    >
      <span className="h-2 w-2 rounded-full bg-rose-400 animate-ping" />
      <AlertOctagon className="h-3.5 w-3.5 text-rose-300" />
      <span>Red Alert</span>
    </Link>
  );
}
