"use client";

import { Stethoscope, HeartPulse } from "lucide-react";

export type Role = "nurse" | "doctor";

interface RoleSelectorProps {
  role: Role;
  onRoleChange: (role: Role) => void;
}

export default function RoleSelector({ role, onRoleChange }: RoleSelectorProps) {
  return (
    <div className="flex w-full rounded-xl bg-white/[0.04] p-1 backdrop-blur-sm border border-white/[0.06]">
      {/* Nurse / Compounder */}
      <button
        type="button"
        onClick={() => onRoleChange("nurse")}
        className={`
          group relative flex flex-1 items-center justify-center gap-2.5 rounded-lg px-4 py-3
          text-sm font-semibold tracking-wide transition-all duration-300 cursor-pointer
          ${
            role === "nurse"
              ? "bg-emerald-500/15 text-emerald-300 shadow-lg shadow-emerald-500/10 border border-emerald-400/20"
              : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] border border-transparent"
          }
        `}
      >
        <HeartPulse
          className={`h-4.5 w-4.5 transition-all duration-300 ${
            role === "nurse"
              ? "text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]"
              : "text-gray-500 group-hover:text-gray-300"
          }`}
        />
        <span>Nurse / Compounder</span>
        {role === "nurse" && (
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
          </span>
        )}
      </button>

      {/* Doctor */}
      <button
        type="button"
        onClick={() => onRoleChange("doctor")}
        className={`
          group relative flex flex-1 items-center justify-center gap-2.5 rounded-lg px-4 py-3
          text-sm font-semibold tracking-wide transition-all duration-300 cursor-pointer
          ${
            role === "doctor"
              ? "bg-indigo-500/15 text-indigo-300 shadow-lg shadow-indigo-500/10 border border-indigo-400/20"
              : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] border border-transparent"
          }
        `}
      >
        <Stethoscope
          className={`h-4.5 w-4.5 transition-all duration-300 ${
            role === "doctor"
              ? "text-indigo-400 drop-shadow-[0_0_6px_rgba(99,102,241,0.4)]"
              : "text-gray-500 group-hover:text-gray-300"
          }`}
        />
        <span>Doctor</span>
        {role === "doctor" && (
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-50" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.6)]" />
          </span>
        )}
      </button>
    </div>
  );
}

