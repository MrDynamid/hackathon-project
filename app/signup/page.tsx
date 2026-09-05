"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navigation from "../../components/Navigation";
import { authClient } from "../../lib/auth-client";
import { Lock, Mail, User, ArrowRight, Sparkles, Loader2, CheckCircle } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Full name is required.";
    if (!email.includes("@")) newErrors.email = "Please enter a valid email address.";
    if (password.length < 6) newErrors.password = "Password must be at least 6 characters.";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
    if (!agreeTerms) newErrors.terms = "You must agree to the Terms of Service.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    const { error } = await authClient.signUp.email({
      name: name.trim(),
      email: email.trim(),
      password,
    });

    if (error) {
      setIsLoading(false);
      setErrors({
        form:
          error.message ??
          "We couldn't create your account. That email may already be registered.",
      });
      return;
    }

    setIsLoading(false);
    setIsSuccess(true);
    router.push("/upload");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-secondary-container">
      <Navigation />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-secondary-fixed/50 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="w-full max-w-md bg-surface-container-lowest border-[1.5px] border-primary rounded-xl p-8 shadow-sm relative overflow-hidden">
          <div className="text-center mb-6">
            <div className="w-10 h-10 rounded-full bg-secondary-container border-[1.5px] border-primary flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-primary">Create Your Account</h1>
            <p className="text-xs text-on-surface-variant mt-1">
              Join PrepPilot to prepare for interviews and refine your resume
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {errors.form && (
              <div className="p-2.5 rounded-lg bg-error-container border border-error text-[11px] font-medium text-on-error-container">
                {errors.form}
              </div>
            )}
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-background border-[1.5px] border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-fixed text-primary"
                  placeholder="Jane Doe"
                />
              </div>
              {errors.name && <p className="text-[11px] text-error font-medium mt-0.5">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-background border-[1.5px] border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-fixed text-primary"
                  placeholder="jane@domain.com"
                />
              </div>
              {errors.email && <p className="text-[11px] text-error font-medium mt-0.5">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                Password
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
              {errors.password && (
                <p className="text-[11px] text-error font-medium mt-0.5">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                Confirm Password
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
              {errors.confirmPassword && (
                <p className="text-[11px] text-error font-medium mt-0.5">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer text-xs text-on-surface-variant select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded text-primary border-primary focus:ring-secondary-fixed"
                />
                <span>
                  I accept the{" "}
                  <Link href="/terms" className="text-primary font-bold hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and zero-retention privacy guarantee.
                </span>
              </label>
              {errors.terms && (
                <p className="text-[11px] text-error font-medium mt-0.5">{errors.terms}</p>
              )}
            </div>

            {/* CTA */}
            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="w-full mt-3 bg-primary text-on-primary hover:bg-neutral-800 border-[1.5px] border-primary py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Provisioning Account...</span>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Account Ready! Launching Session...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Start</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-5 pt-4 border-t border-outline-variant">
            <p className="text-xs text-on-surface-variant">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
