"use client";

import { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  CreditCard,
  Loader2,
  ArrowRight,
} from "lucide-react";
import type { Role } from "./RoleSelector";

interface SignupFormProps {
  role: Role;
  onSignupSuccess: () => void;
}

export default function SignupForm({ role, onSignupSuccess }: SignupFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    licenseId: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isDoctor = role === "doctor";
  const accent = isDoctor ? "indigo" : "emerald";

  const focusClasses = isDoctor
    ? "border-white/[0.08] focus:border-indigo-500/40 focus:ring-indigo-500/20"
    : "border-white/[0.08] focus:border-emerald-500/40 focus:ring-emerald-500/20";

  const btnClasses = isDoctor
    ? "bg-gradient-to-r from-indigo-600 to-blue-600 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
    : "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          fullName: formData.fullName,
          role,
          licenseId: formData.licenseId,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Registration failed. Please check your details.");
        setIsSubmitting(false);
        return;
      }

      onSignupSuccess();
    } catch (err: any) {
      setError(err.message || "Network error during registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBase = `
    w-full rounded-xl border bg-white/[0.04] py-3 pl-10 pr-4
    text-sm text-gray-100 placeholder-gray-500
    transition-all duration-200 backdrop-blur-sm
    focus:ring-2 ${focusClasses}
  `;

  const inputWithToggle = `
    w-full rounded-xl border bg-white/[0.04] py-3 pl-10 pr-11
    text-sm text-gray-100 placeholder-gray-500
    transition-all duration-200 backdrop-blur-sm
    focus:ring-2 ${focusClasses}
  `;

  return (
    <form onSubmit={handleSubmit} className="animate-fade-slide-in space-y-4">
      {/* Full Name */}
      <div className="relative">
        <User className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Full Name"
          required
          className={inputBase}
        />
      </div>

      {/* Email */}
      <div className="relative">
        <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email address"
          required
          className={inputBase}
        />
      </div>

      {/* Professional License / ID */}
      <div className="relative">
        <CreditCard className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          name="licenseId"
          value={formData.licenseId}
          onChange={handleChange}
          placeholder={
            isDoctor
              ? "Medical License Number (e.g. MCI-XXXXX)"
              : "Staff ID / Registration Number"
          }
          required
          className={inputBase}
        />
      </div>

      {/* Password */}
      <div className="relative">
        <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          required
          minLength={6}
          className={inputWithToggle}
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

      {/* Confirm Password */}
      <div className="relative">
        <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type={showConfirmPassword ? "text" : "password"}
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm Password"
          required
          minLength={6}
          className={inputWithToggle}
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute top-1/2 right-3.5 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-300 cursor-pointer"
          tabIndex={-1}
        >
          {showConfirmPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-400 animate-fade-slide-in">{error}</p>
      )}

      {/* Role badge */}
      <div
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
          isDoctor
            ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/15"
            : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/15"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            isDoctor ? "bg-indigo-400" : "bg-emerald-400"
          }`}
        />
        Registering as{" "}
        <span className="font-semibold">
          {isDoctor ? "Clinical Reviewer (Doctor)" : "Frontline Intake Staff (Nurse / Compounder)"}
        </span>
      </div>

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
            Creating Account…
          </>
        ) : (
          <>
            Create Account
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}

