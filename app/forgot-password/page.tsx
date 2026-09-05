"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navigation from "../../components/Navigation";
import { authClient } from "../../lib/auth-client";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, Loader2, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setIsLoading(true);

    // Always resolves the same way to avoid leaking whether an email exists.
    await authClient.requestPasswordReset({
      email: email.trim(),
      redirectTo: "/reset-password",
    });

    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-secondary-container">
      <Navigation />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-secondary-fixed/50 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="w-full max-w-md bg-surface-container-lowest border-[1.5px] border-primary rounded-xl p-8 shadow-sm relative overflow-hidden">
          {!isSubmitted ? (
            <div>
              <div className="text-center mb-6">
                <div className="w-10 h-10 rounded-full bg-secondary-container border-[1.5px] border-primary flex items-center justify-center mx-auto mb-3">
                  <KeyRound className="w-5 h-5 text-primary" />
                </div>
                <h1 className="font-serif text-3xl font-bold text-primary">Reset Password</h1>
                <p className="text-xs text-on-surface-variant mt-1">
                  Enter your email to receive simulated password reset instructions
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                    Registered Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs bg-background border-[1.5px] border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-fixed text-primary"
                      placeholder="aditi.sharma@example.com"
                    />
                  </div>
                  {error && <p className="text-[11px] text-error font-medium mt-1">{error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-on-primary hover:bg-neutral-800 border-[1.5px] border-primary py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Transmitting Recovery Token...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Recovery Link</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center py-4 space-y-4 animate-in fade-in duration-300">
              <div className="w-12 h-12 rounded-full bg-secondary-container border-[1.5px] border-primary flex items-center justify-center mx-auto text-primary">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>

              <h2 className="font-serif text-2xl font-bold text-primary">Check Your Inbox</h2>

              <p className="text-xs text-on-surface-variant leading-relaxed">
                We sent a simulated password recovery token to{" "}
                <span className="font-bold text-primary">{email}</span>. You can safely
                return to login.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-xs text-secondary font-bold hover:underline block mx-auto mb-4"
                >
                  Resend recovery token
                </button>

                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 bg-secondary-fixed text-primary border-[1.5px] border-primary px-6 py-2 rounded-full text-xs font-bold hover:bg-secondary-container transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </div>
          )}

          {!isSubmitted && (
            <div className="text-center mt-6 pt-4 border-t border-outline-variant">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary font-bold transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Login</span>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
