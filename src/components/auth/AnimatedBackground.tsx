"use client";

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient mesh */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #030712 0%, #0c1222 20%, #0a1628 40%, #111827 60%, #0f172a 80%, #030712 100%)",
          backgroundSize: "400% 400%",
          animation: "gradient-shift 20s ease infinite",
        }}
      />

      {/* Floating orb 1 — Emerald (top-left) */}
      <div
        className="absolute top-[10%] left-[15%] h-[420px] w-[420px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(16,185,129,0.18) 0%, rgba(6,95,70,0.08) 50%, transparent 70%)",
          filter: "blur(80px)",
          animation: "float-orb-1 18s ease-in-out infinite",
        }}
      />

      {/* Floating orb 2 — Indigo/Blue (bottom-right) */}
      <div
        className="absolute bottom-[5%] right-[10%] h-[500px] w-[500px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(99,102,241,0.16) 0%, rgba(49,46,129,0.06) 50%, transparent 70%)",
          filter: "blur(90px)",
          animation: "float-orb-2 22s ease-in-out infinite",
        }}
      />

      {/* Floating orb 3 — Teal (center) */}
      <div
        className="absolute top-[40%] left-[50%] h-[350px] w-[350px] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(20,184,166,0.12) 0%, rgba(15,118,110,0.05) 50%, transparent 70%)",
          filter: "blur(70px)",
          animation: "float-orb-3 15s ease-in-out infinite",
        }}
      />

      {/* Floating orb 4 — Soft violet (top-right) */}
      <div
        className="absolute top-[5%] right-[20%] h-[300px] w-[300px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 60%)",
          filter: "blur(60px)",
          animation: "float-orb-1 25s ease-in-out infinite reverse",
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Pulsing center glow */}
      <div
        className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 60%)",
          animation: "pulse-glow 8s ease-in-out infinite",
        }}
      />

      {/* Slowly rotating radial element */}
      <div
        className="absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.04]"
        style={{
          background:
            "conic-gradient(from 0deg, transparent, rgba(16,185,129,0.15), transparent, rgba(99,102,241,0.15), transparent)",
          animation: "subtle-rotate 60s linear infinite",
        }}
      />
    </div>
  );
}

