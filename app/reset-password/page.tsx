"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navigation from "../../components/Navigation";
import { authClient } from "../../lib/auth-client";
import { Lock, ArrowRight, ArrowLeft, CheckCircle2, Loader2, KeyRound } from "lucide-react";

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const invalidLink = searchParams.get("error") === "INVALID_TOKEN" || !token;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!token) {
      setError("This reset link is invalid or has expired.");
      return;
    }

    setError("");
    setIsLoading(true);

    const { error: resetError } = await authClient.resetPassword({
      newPassword: password,
      token,
    });

    if (resetError) {
      setIsLoading(false);
      setError("This reset link is invalid or has expired. Request a new one.");
      return;
    }

    setIsLoading(false);
    setIsSuccess(true);
    setTimeout(() => router.push("/login"), 1200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-secondary-container">
      <Navigation />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-secondary-fixed/50 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="w-full max-w-md bg-surface-container-lowest border-[1.5px] border-primary rounded-xl p-8 shadow-sm relative overflow-hidden">
          {isSuccess ? (
            <div className="text-center py-4 space-y-4 animate-in fade-in duration-300">
              <div className="w-12 h-12 rounded-full bg-secondary-container border-[1.5px] border-primary flex items-center justify-center mx-auto text-primary">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-primary">Password Updated</h2>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Your password has been reset. Redirecting you to sign in...
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-secondary-fixed text-primary border-[1.5px] border-primary px-6 py-2 rounded-full text-xs font-bold hover:bg-secondary-container transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          ) : invalidLink ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-error-container border-[1.5px] border-error flex items-center justify-center mx-auto text-on-error-container">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-primary">Invalid Reset Link</h2>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                This password reset link is missing or has expired. Please request a new one.
              </p>
              <Link
                href="/forgot-password"
                className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary border-[1.5px] border-primary px-6 py-2 rounded-full text-xs font-bold hover:bg-neutral-800 transition-colors"
              >
                <span>Request New Link</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div>
              <div className="text-center mb-6">
                <div className="w-10 h-10 rounded-full bg-secondary-container border-[1.5px] border-primary flex items-center justify-center mx-auto mb-3">
                  <KeyRound className="w-5 h-5 text-primary" />
                </div>
                <h1 className="font-serif text-3xl font-bold text-primary">Set New Password</h1>
                <p className="text-xs text-on-surface-variant mt-1">
                  Choose a strong password to secure your account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-2.5 rounded-lg bg-error-container border border-error text-[11px] font-medium text-on-error-container">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs bg-background border-[1.5px] border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-fixed text-primary"
                      placeholder="••••••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs bg-background border-[1.5px] border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-fixed text-primary"
                      placeholder="••••••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-on-primary hover:bg-neutral-800 border-[1.5px] border-primary py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center mt-6 pt-4 border-t border-outline-variant">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary font-bold transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Login</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  );
}
