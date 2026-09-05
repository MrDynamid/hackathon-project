"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navigation from "../components/Navigation";
import { usePrep } from "../context/PrepContext";
import {
  ArrowRight,
  UploadCloud,
  Mic,
  BarChart3,
  FileCheck2,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Play,
} from "lucide-react";

export default function LandingPage() {
  const { loadSampleResume } = usePrep();
  const [activeStepTab, setActiveStepTab] = useState(0);

  const steps = [
    {
      step: "01",
      title: "Upload & Target",
      subtitle: "Drop your PDF or paste resume text with an optional target role.",
      tag: "Intelligent Parser",
      details:
        "PrepPilot instantly parses skills, technical stacks, and career milestones. No manual typing required.",
    },
    {
      step: "02",
      title: "Live Mock Interview",
      subtitle: "5 personalized, rubric-backed questions tailored to your actual claims.",
      tag: "Wispr Flow Voice AI",
      details:
        "Speak naturally with ultra-low latency voice transcription or type your responses under a realistic timer.",
    },
    {
      step: "03",
      title: "Rubric Grading",
      subtitle: "Granular scores grounded directly in quotes from your answers.",
      tag: "Evidence-Based Feedback",
      details:
        "Evaluates communication, system design depth, clarity, and role fit — just like a principal engineer would.",
    },
    {
      step: "04",
      title: "Upgraded Resume",
      subtitle: "AI converts your verbal answers into quantified, high-impact bullet points.",
      tag: "ATS-Optimized Export",
      details:
        "Review side-by-side rewrites, toggle accept/reject with one click, and export an editorial PDF.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-secondary-container">
      <Navigation />

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative px-4 sm:px-6 lg:px-8 pt-16 pb-20 max-w-5xl mx-auto text-center">
          {/* Subtle Ambient Bloom */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary-fixed/40 rounded-full blur-3xl -z-10 pointer-events-none" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border-[1.5px] border-primary bg-secondary-container text-on-secondary-container text-xs font-bold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-secondary" />
            <span>The Single-Pipeline Career Atelier</span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal text-primary tracking-tight leading-[1.1] mb-6">
            Upload your resume. <br />
            Ace the interview. <br />
            <span className="italic">Walk away with both improved.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed mb-8">
            Stop practicing generic LeetCode question banks. PrepPilot grounds every
            mock interview in your actual resume, grades your verbal answers, and
            rewrites your bullet points with real metrics.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/upload"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-on-primary hover:bg-neutral-800 border-[1.5px] border-primary px-8 py-3.5 rounded-full text-sm font-bold shadow-md transition-all active:scale-95"
            >
              <span>Start Free 5-Minute Session</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/interview"
              onClick={loadSampleResume}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-secondary-fixed text-primary hover:bg-secondary-container border-[1.5px] border-primary px-6 py-3.5 rounded-full text-sm font-bold transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-primary" />
              <span>Try Live Interview Room</span>
            </Link>
          </div>

          <p className="text-xs text-on-surface-variant mt-3">
            Zero sign-up required for demo • Fully private • Runs in-browser
          </p>
        </section>

        {/* 4-Step Interactive Flow Walkthrough */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-surface-container-low border-y-[1.5px] border-primary">
          <div className="max-w-[1280px] mx-auto">
            <div className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                The PrepPilot Loop
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-primary mt-2">
                One resume in. One polished resume out.
              </h2>
              <p className="text-sm text-on-surface-variant max-w-xl mx-auto mt-2">
                How our closed-loop AI coach connects your resume with real interview practice.
              </p>
            </div>

            {/* Stepper Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {steps.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveStepTab(idx)}
                  className={`p-6 rounded-xl border-[1.5px] border-primary transition-all cursor-pointer ${
                    activeStepTab === idx
                      ? "bg-secondary-container/80 shadow-sm ring-2 ring-primary"
                      : "bg-surface-container-lowest hover:bg-surface-container"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-serif text-2xl font-bold text-primary">
                      {item.step}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-background border border-primary text-primary">
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-primary mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant mb-3 leading-relaxed">
                    {item.subtitle}
                  </p>
                  <p className="text-[11px] text-on-surface border-t border-outline-variant/60 pt-2 font-medium">
                    {item.details}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-container-lowest border-[1.5px] border-primary rounded-xl p-6 relative overflow-hidden group">
              <div className="w-10 h-10 rounded-full bg-secondary-fixed border-[1.5px] border-primary flex items-center justify-center mb-4">
                <Mic className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-bold text-primary mb-2">
                Wispr Flow Voice Mode
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Practice answering out loud. Our ultra-low latency transcription captures
                your technical reasoning naturally without the stress of typing speed.
              </p>
            </div>

            <div className="bg-surface-container-lowest border-[1.5px] border-primary rounded-xl p-6 relative overflow-hidden group">
              <div className="w-10 h-10 rounded-full bg-secondary-container border-[1.5px] border-primary flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-bold text-primary mb-2">
                Evidence-Grounded Rubric
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                No hallucinated feedback. Every score is backed by exact quotes from your
                interview transcript, categorized by communication, depth, and role alignment.
              </p>
            </div>

            <div className="bg-surface-container-lowest border-[1.5px] border-primary rounded-xl p-6 relative overflow-hidden group">
              <div className="w-10 h-10 rounded-full bg-secondary-fixed border-[1.5px] border-primary flex items-center justify-center mb-4">
                <FileCheck2 className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-bold text-primary mb-2">
                Action-Verb Bullet Rewrites
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Your strong verbal answers shouldn't stay in the interview room. PrepPilot
                injects them right back into your resume bullets with verified metrics.
              </p>
            </div>
          </div>
        </section>

        {/* Demo Candidate Spotlight */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 bg-background">
          <div className="max-w-4xl mx-auto bg-surface-container border-[1.5px] border-primary rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                Pre-Loaded Candidate Profile
              </span>
              <h3 className="font-serif text-2xl font-bold text-primary mt-1">
                Aditi Sharma — Senior Frontend Engineer
              </h3>
              <p className="text-xs text-on-surface-variant mt-1 max-w-lg">
                Targeting Senior Frontend Engineer @ Stripe. Experience with micro-frontends,
                Webpack 5, and WebSockets ready for instant exploration.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/upload"
                className="bg-primary text-on-primary hover:bg-neutral-800 border-[1.5px] border-primary px-5 py-2.5 rounded-full text-xs font-bold shadow-sm transition-all"
              >
                Inspect Flow
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-low border-t-[1.5px] border-primary py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-primary">PrepPilot</span>
            <span className="text-xs text-on-surface-variant">
              — AI Career Atelier & Mock Interview Engine
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-on-surface-variant">
            <Link href="/terms" className="hover:text-primary transition-colors underline">
              Privacy & Terms
            </Link>
            <Link href="/upload" className="hover:text-primary transition-colors">
              Upload Resume
            </Link>
            <Link href="/interview" className="hover:text-primary transition-colors">
              Interview Room
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
