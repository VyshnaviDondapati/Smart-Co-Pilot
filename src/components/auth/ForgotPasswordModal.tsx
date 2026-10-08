"use client";

import { useState } from "react";
import { X, Mail, Loader2, CheckCircle2 } from "lucide-react";

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
  accentColor: "emerald" | "indigo";
}

export default function ForgotPasswordModal({
  open,
  onClose,
  accentColor,
}: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  if (!open) return null;

  const isEmerald = accentColor === "emerald";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("sending");
    // Mock: simulate API call
    setTimeout(() => {
      setStatus("sent");
    }, 1500);
  };

  const handleClose = () => {
    setEmail("");
    setStatus("idle");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`
          animate-fade-slide-in relative w-full max-w-md rounded-2xl
          border border-white/[0.12] bg-gray-900/80 p-6
          shadow-2xl backdrop-blur-xl
        `}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/[0.06] hover:text-gray-200 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {status === "sent" ? (
          /* ── Success State ── */
          <div className="flex flex-col items-center py-4 text-center">
            <div
              className={`mb-4 rounded-full p-3 ${
                isEmerald ? "bg-emerald-500/15" : "bg-indigo-500/15"
              }`}
            >
              <CheckCircle2
                className={`h-8 w-8 ${
                  isEmerald ? "text-emerald-400" : "text-indigo-400"
                }`}
              />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-100">
              Check Your Inbox
            </h3>
            <p className="mb-6 text-sm leading-relaxed text-gray-400">
              We've sent a password reset link to{" "}
              <span className="font-medium text-gray-200">{email}</span>.
              Please check your email and follow the instructions.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className={`
                w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 cursor-pointer
                ${
                  isEmerald
                    ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/20"
                    : "bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/20"
                }
              `}
            >
              Back to Login
            </button>
          </div>
        ) : (
          /* ── Form State ── */
          <>
            <h3 className="mb-1 text-lg font-semibold text-gray-100">
              Forgot Password?
            </h3>
            <p className="mb-5 text-sm text-gray-400">
              Enter your registered email and we'll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@clinic.org"
                  required
                  className={`
                    w-full rounded-xl border bg-white/[0.04] py-3 pl-10 pr-4
                    text-sm text-gray-100 placeholder-gray-500
                    transition-all duration-200 backdrop-blur-sm
                    focus:ring-2
                    ${
                      isEmerald
                        ? "border-white/[0.08] focus:border-emerald-500/40 focus:ring-emerald-500/20"
                        : "border-white/[0.08] focus:border-indigo-500/40 focus:ring-indigo-500/20"
                    }
                  `}
                />
              </div>

              <button
                type="submit"
                disabled={status === "sending" || !email}
                className={`
                  flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm
                  font-semibold transition-all duration-300 cursor-pointer
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${
                    isEmerald
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:brightness-110"
                      : "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:brightness-110"
                  }
                `}
              >
                {status === "sending" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

