"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
} from "lucide-react";
import type { Role } from "./RoleSelector";
import ForgotPasswordModal from "./ForgotPasswordModal";

interface LoginFormProps {
  role: Role;
}

export default function LoginForm({ role }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);

  const isDoctor = role === "doctor";

  const focusClasses = isDoctor
    ? "border-white/[0.08] focus:border-indigo-500/40 focus:ring-indigo-500/20"
    : "border-white/[0.08] focus:border-emerald-500/40 focus:ring-emerald-500/20";

  const btnClasses = isDoctor
    ? "bg-gradient-to-r from-indigo-600 to-blue-600 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
    : "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Authentication failed. Please verify your credentials.");
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

      if (data.user.role === "doctor") {
        router.push("/doctor/dashboard");
      } else {
        router.push("/intake");
      }
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="animate-fade-slide-in space-y-4">
        {/* Email / ID */}
        <div className="relative">
          <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            placeholder="Email or Staff ID"
            required
            className={`
              w-full rounded-xl border bg-white/[0.04] py-3 pl-10 pr-4
              text-sm text-gray-100 placeholder-gray-500
              transition-all duration-200 backdrop-blur-sm
              focus:ring-2 ${focusClasses}
            `}
          />
        </div>

        {/* Password */}
        <div>
          <div className="relative">
            <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Password"
              required
              className={`
                w-full rounded-xl border bg-white/[0.04] py-3 pl-10 pr-11
                text-sm text-gray-100 placeholder-gray-500
                transition-all duration-200 backdrop-blur-sm
                focus:ring-2 ${focusClasses}
              `}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3.5 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-300 cursor-pointer"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Forgot Password */}
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setShowForgot(true)}
              className={`text-xs font-medium transition-colors cursor-pointer ${
                isDoctor
                  ? "text-indigo-400/70 hover:text-indigo-300"
                  : "text-emerald-400/70 hover:text-emerald-300"
              }`}
            >
              Forgot password?
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <p className="text-sm text-red-400 animate-fade-slide-in">{error}</p>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`
            flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm
            font-semibold text-white transition-all duration-300 cursor-pointer
            hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed
            ${btnClasses}
          `}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing In…
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <ForgotPasswordModal
        open={showForgot}
        onClose={() => setShowForgot(false)}
        accentColor={isDoctor ? "indigo" : "emerald"}
      />
    </>
  );
}

