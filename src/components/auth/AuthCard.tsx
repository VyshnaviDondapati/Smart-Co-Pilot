"use client";

import type { Role } from "./RoleSelector";

interface AuthCardProps {
  role: Role;
  children: React.ReactNode;
}

export default function AuthCard({ role, children }: AuthCardProps) {
  const isDoctor = role === "doctor";

  return (
    <div
      className={`
        relative w-full max-w-md rounded-3xl
        border border-white/[0.12]
        bg-white/[0.04]
        p-8 md:p-10
        shadow-2xl
        backdrop-blur-xl
        transition-all duration-500
      `}
      style={{
        animation: isDoctor
          ? "border-glow-indigo 4s ease-in-out infinite"
          : "border-glow 4s ease-in-out infinite",
      }}
    >
      {/* Inner gradient accent stripe at top */}
      <div
        className={`
          absolute inset-x-0 top-0 h-[2px] rounded-t-3xl
          ${
            isDoctor
              ? "bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"
              : "bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"
          }
        `}
      />

      {/* Subtle corner glow */}
      <div
        className={`
          pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full opacity-30
          ${
            isDoctor
              ? "bg-indigo-500/20 blur-3xl"
              : "bg-emerald-500/20 blur-3xl"
          }
        `}
      />

      {children}
    </div>
  );
}

