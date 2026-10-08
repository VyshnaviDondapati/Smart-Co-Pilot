"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Stethoscope,
  HeartPulse,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  Sparkles,
  Activity,
  Zap,
  Mic,
} from "lucide-react";

/* ─────────── Types ─────────── */
type AuthView = "login" | "signup" | "forgot";
type Role = "doctor" | "nurse";

/* ═══════════════════════════════════════════════════════════════
   CUSTOM LOGO — Intertwined Cross/Ribbon
   ═══════════════════════════════════════════════════════════════ */
function SmartTriageLogo() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="h-14 w-14 shrink-0 drop-shadow-[0_4px_14px_rgba(45,212,191,0.55)]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="cyanTeal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="50%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
        <linearGradient id="purpleGlow" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="60%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#2dd4bf" />
        </linearGradient>
      </defs>
      <path
        d="M32 20 C18 20, 12 34, 24 46 L50 72 C60 82, 74 84, 82 72 C90 60, 84 46, 72 38 L42 18 C38 15, 34 20, 32 20 Z"
        stroke="url(#cyanTeal)"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M68 80 C82 80, 88 66, 76 54 L50 28 C40 18, 26 16, 18 28 C10 40, 16 54, 28 62 L58 82 C62 85, 66 80, 68 80 Z"
        stroke="url(#purpleGlow)"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN AUTH PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function AuthPage() {
  const router = useRouter();

  /* ── State ── */
  const [view, setView] = useState<AuthView>("login");
  const [role, setRole] = useState<Role>("doctor");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ── Form Fields ── */
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isDoctor = role === "doctor";

  /* ── Handlers ── */
  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSuccessMessage("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const toggleView = (target: AuthView) => {
    setError("");
    setView(target);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (view === "forgot") {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }

      setIsSubmitting(true);

      try {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            newPassword: password,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.error || "Password reset failed. Please check your email.");
          setIsSubmitting(false);
          return;
        }

        setSuccessMessage("✓ Password updated successfully! Please sign in with your new password.");
        setView("login");
        setPassword("");
        setConfirmPassword("");
      } catch (err: any) {
        setError(err.message || "Network error during password reset. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    } else if (view === "signup") {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }

      setIsSubmitting(true);

      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            fullName,
            role,
            password,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.error || "Registration failed. Please check your details.");
          setIsSubmitting(false);
          return;
        }

        setSuccessMessage("✓ Account successfully created! Please sign in with your credentials.");
        setView("login");
        setPassword("");
        setConfirmPassword("");
      } catch (err: any) {
        setError(err.message || "Network error during registration. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!email || !password) {
        setError("Please fill in all fields.");
        return;
      }

      setIsSubmitting(true);

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, role }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.error || "Invalid email or password. Please verify your credentials.");
          setIsSubmitting(false);
          return;
        }

        if (typeof window !== "undefined") {
          const rawName = data.user.fullName || "";
          localStorage.setItem("userRole", data.user.role);
          localStorage.setItem("userEmail", data.user.email);
          localStorage.setItem("userId", data.user.id);

          if (data.user.role === "doctor") {
            const formattedDocName =
              rawName.toLowerCase().startsWith("dr.") || rawName.toLowerCase().startsWith("dr ")
                ? rawName
                : `Dr. ${rawName}`;
            localStorage.setItem("doctorName", formattedDocName);
            localStorage.setItem("userName", formattedDocName);
          } else {
            const formattedNurseName =
              rawName.toLowerCase().startsWith("nurse") || rawName.toLowerCase().startsWith("duty nurse")
                ? rawName
                : `Nurse ${rawName}`;
            localStorage.setItem("nurseName", formattedNurseName);
            localStorage.setItem("userName", formattedNurseName);
          }
        }

        router.push(data.user.role === "doctor" ? "/doctor/dashboard" : "/intake");
      } catch (err: any) {
        setError(err.message || "Network error. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <main className="relative h-screen w-full overflow-hidden flex flex-col lg:flex-row select-none">
      {/* ══════════════════════════════════════════════════════
          1. IMMERSIVE 3D BACKGROUND (Lighter, Brighter & Clean)
         ══════════════════════════════════════════════════════ */}
      <div className="fixed inset-0 -z-10 bg-[#0d282e]">
        <div className="absolute inset-0 animate-bg-drift">
          <Image
            src="/bg-medical.jpg"
            alt="Medical Triage Environment"
            fill
            priority
            quality={95}
            className="object-cover object-[50%_0%] scale-[1.01]"
          />
        </div>

        {/* Soft, lighter translucent gradient overlay for text clarity without dimming the scene */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-[#041f24]/30 to-transparent w-full lg:w-[62%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
      </div>

      {/* ══════════════════════════════════════════════════════
          2. LEFT SIDE: SCROLLABLE CONTAINER (Invisible Scrollbar)
             First section fills initial view; second section
             reveals after scrolling!
         ══════════════════════════════════════════════════════ */}
      <div className="w-full lg:w-[56%] xl:w-[58%] h-full overflow-y-auto no-scrollbar flex flex-col px-6 sm:px-12 md:px-16 lg:px-20">
        
        {/* ── SECTION 1: PRIMARY HERO VIEW (Fills initial viewport height) ── */}
        <div className="min-h-[calc(100vh-60px)] lg:min-h-screen flex flex-col justify-center py-10">
          <div className="max-w-xl">
            {/* Logo + Header */}
            <div className="animate-stagger-1 flex items-center gap-4 mb-7">
              <SmartTriageLogo />
              <div>
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
                  Smart Triage
                </h2>
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-teal-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] -mt-1">
                  Co-Pilot
                </h2>
              </div>
            </div>

            {/* Subheading */}
            <h1 className="animate-stagger-2 text-3xl sm:text-4xl lg:text-[44px] font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
              AI-Powered Triage for <br />
              <span className="bg-gradient-to-r from-teal-300 via-cyan-200 to-emerald-300 bg-clip-text text-transparent">
                Primary Health Centres.
              </span>
            </h1>

            {/* First Paragraph */}
            <p className="animate-stagger-3 mt-5 text-base sm:text-lg leading-relaxed text-slate-100 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] font-normal">
              Optimizing primary care prioritization with intelligent clinical assistance and real-time vital tracking.
            </p>

            {/* Minimal Scroll Text */}
            <div className="animate-stagger-4 mt-12 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-teal-300/80">
              <span>Scroll</span>
              <span className="text-teal-400 font-bold">↓</span>
            </div>
          </div>
        </div>

        {/* ── SECTION 2: REVOLUTIONIZING RURAL HEALTHCARE (After Scroll) ── */}
        <div className="py-12 border-t border-teal-400/20 max-w-xl">
          {/* Second Heading */}
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] flex items-center gap-3">
            <Activity className="h-6 w-6 text-teal-300 shrink-0" />
            Revolutionizing Rural Healthcare
          </h2>

          {/* Second Paragraph */}
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-100/90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
            Our intelligent clinical triage platform empowers frontline healthcare workers to seamlessly record patient deep history, vital signs, and symptoms using AI voice scribe and structured intake. The triage engine instantly categorizes patients into Red, Yellow, or Green priority queues, empowering doctors to save lives faster.
          </p>

          {/* Feature Highlights */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5 pb-6">
            <div className="rounded-2xl border border-white/15 bg-black/25 p-4 backdrop-blur-md">
              <div className="flex items-center gap-2.5 text-teal-300 font-bold text-sm mb-1.5">
                <Mic className="h-4 w-4" />
                <span>AI Voice Scribe</span>
              </div>
              <p className="text-xs text-slate-200/80 leading-normal">
                Hands-free clinical speech recognition auto-extracting vitals, symptoms, and deep medical history.
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-black/25 p-4 backdrop-blur-md">
              <div className="flex items-center gap-2.5 text-cyan-300 font-bold text-sm mb-1.5">
                <Zap className="h-4 w-4" />
                <span>Instant Color Triage</span>
              </div>
              <p className="text-xs text-slate-200/80 leading-normal">
                Immediate algorithmic classification into Red, Yellow, and Green priority queues with clinical alerts.
              </p>
            </div>
          </div>

          {/* Footer inside scroll content */}
          <div className="pt-8 pb-4">
            <p className="text-xs font-medium text-slate-300/80 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              © 2026 Smart Triage Co-Pilot · Rural Healthcare Innovation Initiative
            </p>
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════
          3. RIGHT SIDE: FIXED & STATIONARY AUTH CARD
         ══════════════════════════════════════════════════════ */}
      <div className="w-full lg:w-[44%] xl:w-[42%] h-full shrink-0 flex items-center justify-center p-6 lg:p-10">
        <div
          className="
            animate-card-neon
            w-full max-w-[400px] rounded-2xl
            border border-teal-300/40
            bg-[#092227]/40
            p-6 sm:p-8
            shadow-2xl
            backdrop-blur-xl
            transition-all duration-300
          "
        >
          {/* ── DUAL-ROLE TOGGLE (Top of Card) ── */}
          <div className="mb-6 grid grid-cols-2 gap-1.5 rounded-xl bg-black/35 p-1 border border-white/10 backdrop-blur-md">
            {/* Doctor Access Tab */}
            <button
              type="button"
              onClick={() => setRole("doctor")}
              className={`
                flex items-center justify-center gap-2 rounded-lg px-3 py-2.5
                text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer
                ${
                  isDoctor
                    ? "bg-teal-500/25 border border-teal-300/60 text-white shadow-[0_0_15px_rgba(45,212,191,0.4)]"
                    : "text-slate-300 hover:text-white border border-transparent font-medium"
                }
              `}
            >
              <Stethoscope
                className={`h-4 w-4 shrink-0 transition-colors ${
                  isDoctor
                    ? "text-teal-300 drop-shadow-[0_0_6px_rgba(45,212,191,0.7)]"
                    : "text-slate-400"
                }`}
              />
              <span>Doctor Access</span>
            </button>

            {/* Nurse / Compounder Access Tab */}
            <button
              type="button"
              onClick={() => setRole("nurse")}
              className={`
                flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2.5
                text-[11px] font-bold uppercase tracking-tight transition-all duration-200 cursor-pointer
                ${
                  !isDoctor
                    ? "bg-teal-500/25 border border-teal-300/60 text-white shadow-[0_0_15px_rgba(45,212,191,0.4)]"
                    : "text-slate-300 hover:text-white border border-transparent font-medium"
                }
              `}
            >
              <HeartPulse
                className={`h-4 w-4 shrink-0 transition-colors ${
                  !isDoctor
                    ? "text-teal-300 drop-shadow-[0_0_6px_rgba(45,212,191,0.7)]"
                    : "text-slate-400"
                }`}
              />
              <span>Nurse / Staff</span>
            </button>
          </div>

          {/* ── CARD HEADER ── */}
          <div className="mb-5">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {view === "login"
                ? "Welcome Back"
                : view === "signup"
                ? "Create Account"
                : "Reset Password"}
            </h3>
            <p className="mt-1 text-xs text-slate-300">
              {view === "login"
                ? `Sign in to access your ${isDoctor ? "clinical dashboard" : "patient intake portal"}`
                : view === "signup"
                ? `Register as ${isDoctor ? "a Medical Doctor" : "Frontline Intake Staff"}`
                : "Enter your registered email and choose a new password"}
            </p>
          </div>

          {/* ── FORM ── */}
          <form onSubmit={handleSubmit} className="animate-fade-slide-in space-y-3.5" key={view}>
            {/* Full Name — Signup only */}
            {view === "signup" && (
              <div className="animate-fade-slide-in">
                <label className="mb-1 block text-xs font-semibold text-slate-200">
                  Full Name
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      setError("");
                    }}
                    placeholder="Dr. / Staff Full Name"
                    required
                    className="w-full rounded-xl border border-white/20 bg-black/30 py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-400/70 backdrop-blur-sm transition-all focus:border-teal-300 focus:bg-black/50 focus:ring-2 focus:ring-teal-400/20"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-200">
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="your.name@clinic.org"
                  required
                  className="w-full rounded-xl border border-white/20 bg-black/30 py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-400/70 backdrop-blur-sm transition-all focus:border-teal-300 focus:bg-black/50 focus:ring-2 focus:ring-teal-400/20"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-200">
                {view === "forgot" ? "New Password" : "Password"}
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-white/20 bg-black/30 py-2.5 pl-9 pr-10 text-sm text-white placeholder-slate-400/70 backdrop-blur-sm transition-all focus:border-teal-300 focus:bg-black/50 focus:ring-2 focus:ring-teal-400/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition-colors hover:text-white cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Forgot Password Link (Login view only) */}
              {view === "login" && (
                <div className="mt-1.5 flex justify-end">
                  <button
                    type="button"
                    onClick={() => toggleView("forgot")}
                    className="text-xs font-medium text-teal-300 hover:text-teal-200 transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
            </div>

            {/* Confirm Password — Signup or Forgot Password view */}
            {(view === "signup" || view === "forgot") && (
              <div className="animate-fade-slide-in">
                <label className="mb-1 block text-xs font-semibold text-slate-200">
                  {view === "forgot" ? "Confirm New Password" : "Confirm Password"}
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full rounded-xl border border-white/20 bg-black/30 py-2.5 pl-9 pr-10 text-sm text-white placeholder-slate-400/70 backdrop-blur-sm transition-all focus:border-teal-300 focus:bg-black/50 focus:ring-2 focus:ring-teal-400/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition-colors hover:text-white cursor-pointer"
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Success Message Display */}
            {successMessage && (
              <p className="animate-fade-slide-in text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-400/50 rounded-lg p-2.5 text-center shadow-lg">
                {successMessage}
              </p>
            )}

            {/* Error Message Display */}
            {error && (
              <p className="animate-fade-slide-in text-xs font-semibold text-red-400 bg-red-950/40 border border-red-500/30 rounded-lg p-2 text-center">
                {error}
              </p>
            )}

            {/* ── LARGE SUBMIT BUTTON ── */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="
                mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3.5
                bg-gradient-to-r from-[#99f6e4] via-[#67e8f9] to-[#a7f3d0]
                hover:from-[#5eead4] hover:via-[#38bdf8] hover:to-[#6ee7b7]
                text-[#042f2e] font-black text-sm uppercase tracking-widest
                shadow-[0_0_20px_rgba(94,234,212,0.6)] hover:shadow-[0_0_30px_rgba(94,234,212,0.85)]
                transition-all duration-300 cursor-pointer active:scale-[0.98]
                disabled:opacity-60 disabled:cursor-not-allowed
              "
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#042f2e]" />
                  {view === "login"
                    ? "SIGNING IN…"
                    : view === "signup"
                    ? "CREATING ACCOUNT…"
                    : "UPDATING PASSWORD…"}
                </>
              ) : (
                <>
                  {view === "login"
                    ? "SIGN IN"
                    : view === "signup"
                    ? "SIGN UP"
                    : "UPDATE PASSWORD"}
                  <ArrowRight className="h-4 w-4 stroke-[3]" />
                </>
              )}
            </button>
          </form>

          {/* ── BOTTOM TOGGLE (Login vs. Signup vs. Forgot) ── */}
          <div className="mt-5 text-center flex items-center justify-center gap-1.5">
            <p className="text-xs text-slate-300 font-medium">
              {view === "login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => toggleView("signup")}
                    className="font-extrabold text-white hover:text-teal-300 underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    Sign Up
                  </button>
                </>
              ) : view === "signup" ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => toggleView("login")}
                    className="font-extrabold text-white hover:text-teal-300 underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    Log In
                  </button>
                </>
              ) : (
                <>
                  Remembered your password?{" "}
                  <button
                    type="button"
                    onClick={() => toggleView("login")}
                    className="font-extrabold text-white hover:text-teal-300 underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </>
              )}
            </p>
            <Sparkles className="h-3.5 w-3.5 text-teal-300/80 animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  );
}
