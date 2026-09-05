"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navigation from "../../components/Navigation";
import { authClient } from "../../lib/auth-client";
import { Lock, Mail, ArrowRight, Sparkles, Loader2, CheckCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const signInWith = async (emailValue: string, passwordValue: string) => {
    setErrors({});
    setIsLoading(true);

    const { error } = await authClient.signIn.email({
      email: emailValue.trim(),
      password: passwordValue,
    });

    if (error) {
      setIsLoading(false);
      setErrors({ form: "Invalid email or password. Please try again." });
      return;
    }

    setIsLoading(false);
    setIsSuccess(true);
    router.push("/upload");
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};

    if (!email.includes("@")) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await signInWith(email, password);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-secondary-container">
      <Navigation />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative">
        {/* Subtle Ambient Bloom */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-secondary-fixed/50 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="w-full max-w-md bg-surface-container-lowest border-[1.5px] border-primary rounded-xl p-8 shadow-sm relative overflow-hidden">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-10 h-10 rounded-full bg-secondary-container border-[1.5px] border-primary flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-primary">Welcome Back</h1>
            <p className="text-xs text-on-surface-variant mt-1">
              Sign in to resume your mock interview preparation
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.form && (
              <div className="p-2.5 rounded-lg bg-error-container border border-error text-[11px] font-medium text-on-error-container">
                {errors.form}
              </div>
            )}
            {/* Email Field */}
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
                  className="w-full pl-9 pr-4 py-2 text-xs bg-background border-[1.5px] border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-fixed text-primary transition-all"
                  placeholder="name@company.com"
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-error font-medium mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-secondary hover:underline font-bold"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-background border-[1.5px] border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-fixed text-primary transition-all"
                  placeholder="••••••••••••"
                />
              </div>
              {errors.password && (
                <p className="text-[11px] text-error font-medium mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="w-full mt-2 bg-primary text-on-primary hover:bg-neutral-800 border-[1.5px] border-primary py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Verifying Credentials...</span>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Access Granted! Redirecting...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="text-center mt-6 pt-4 border-t border-outline-variant">
            <p className="text-xs text-on-surface-variant">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-primary font-bold hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
