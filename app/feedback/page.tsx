"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navigation from "../../components/Navigation";
import StepIndicator from "../../components/StepIndicator";
import ScoreGauge from "../../components/ScoreGauge";
import { usePrep } from "../../context/PrepContext";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Quote,
  Award,
  RotateCcw,
  Copy,
  Check,
} from "lucide-react";

export default function FeedbackPage() {
  const { feedback, targetRole, resume } = usePrep();
  const [copiedHash, setCopiedHash] = useState(false);

  if (!feedback) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6 text-center">
        <div className="space-y-3">
          <h1 className="font-serif text-2xl text-primary">No evaluation found</h1>
          <p className="text-sm text-on-surface-variant">Complete an interview before opening feedback.</p>
          <Link href="/upload" className="inline-flex rounded-full border border-primary px-4 py-2 text-xs font-bold text-primary">
            Start a new session
          </Link>
        </div>
      </div>
    )
  }

  const handleCopyHash = () => {
    if (feedback.verifiedHash) {
      navigator.clipboard.writeText(feedback.verifiedHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-secondary-container">
      <Navigation />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        <StepIndicator currentStep={4} />

        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-surface-container-lowest border-[1.5px] border-primary rounded-xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
            {/* Ambient Bloom */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-secondary-fixed/30 rounded-full blur-3xl -z-10 pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-[1.5px] border-primary pb-6 mb-6">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-secondary">
                  Step 04 of 05
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl font-normal text-primary mt-0.5">
                  Interview Evaluation & Rubric
                </h1>
                <p className="text-xs text-on-surface-variant mt-1">
                  Comprehensive performance audit grounded in your actual verbal interview transcript.
                </p>
              </div>

              {/* Verified Hash Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary-container border border-primary text-xs font-bold text-primary self-start sm:self-auto">
                <ShieldCheck className="w-4 h-4 text-secondary" />
                <span className="font-mono text-[11px]">{feedback.verifiedHash || "sha256-verified"}</span>
                <button
                  onClick={handleCopyHash}
                  className="hover:text-secondary transition-colors"
                  title="Copy verification hash"
                >
                  {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Score Overview Hero Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-6 bg-surface-container-low border border-primary rounded-xl mb-8">
              {/* Left: Overall Score Dial */}
              <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm">
                <ScoreGauge
                  score={feedback.overallScore}
                  size={150}
                  strokeWidth={10}
                  label="Overall Candidate Rating"
                  sublabel="Exceeds Senior Stripe Bar"
                />
                <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Top {100 - feedback.percentile}% of Applicants</span>
                </div>
              </div>

              {/* Right: Executive Summary */}
              <div className="md:col-span-8 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
                  <Award className="w-4 h-4" />
                  <span>Evaluation Synthesis • {targetRole}</span>
                </div>

                <p className="font-serif text-lg text-primary leading-relaxed">
                  &ldquo;{feedback.summary}&rdquo;
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1 mb-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Standout Strengths
                    </span>
                    <ul className="text-[11px] text-emerald-950 space-y-1 pl-1">
                      {feedback.strengths.slice(0, 2).map((st, idx) => (
                        <li key={idx} className="leading-snug">• {st}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1 mb-1">
                      <AlertCircle className="w-3 h-3 text-amber-600" /> Improvement Target
                    </span>
                    <ul className="text-[11px] text-amber-950 space-y-1 pl-1">
                      {feedback.growthAreas.slice(0, 2).map((ga, idx) => (
                        <li key={idx} className="leading-snug">• {ga}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Rubric Category Cards Breakdown */}
            <div className="space-y-4">
              <h3 className="font-serif text-2xl font-bold text-primary flex items-center gap-2">
                <span>Rubric Breakdown</span>
                <span className="text-xs font-sans font-bold text-on-surface-variant uppercase tracking-wider">
                  (4 Core Competencies)
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {feedback.categories.map((cat) => (
                  <div
                    key={cat.name}
                    className="p-5 bg-surface-container-low border-[1.5px] border-primary rounded-xl flex flex-col justify-between shadow-sm group hover:bg-surface-container transition-colors"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">
                          {cat.label}
                        </span>
                        <span className="text-sm font-serif font-bold px-2.5 py-0.5 rounded-full bg-secondary-fixed text-primary border border-primary">
                          {cat.score} / 100
                        </span>
                      </div>

                      {/* Evidence Quote from Transcript */}
                      <div className="p-3 bg-surface-container-lowest border border-outline-variant rounded-lg mb-3">
                        <span className="text-[10px] uppercase font-bold text-secondary flex items-center gap-1 mb-1">
                          <Quote className="w-3 h-3" /> Grounded Evidence
                        </span>
                        <p className="text-xs text-on-surface italic leading-relaxed">
                          &ldquo;{cat.evidence}&rdquo;
                        </p>
                      </div>

                      {/* Actionable Suggestion */}
                      <div className="text-xs text-on-surface-variant">
                        <span className="font-bold text-primary">Coaching Note: </span>
                        <span>{cat.suggestion}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-outline-variant flex items-center justify-between text-[11px] text-on-surface-variant">
                      <span>Status</span>
                      <span className="font-bold text-emerald-600">Passed Benchmark</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Action Ribbon */}
            <div className="mt-8 pt-6 border-t-[1.5px] border-primary flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-on-surface-variant">
                Ready to weave your answers into quantified resume bullet points?
              </div>

              <Link
                href="/improve"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-on-primary hover:bg-neutral-800 border-[1.5px] border-primary px-8 py-3 rounded-full text-xs font-bold transition-transform active:scale-95 shadow-md"
              >
                <span>Improve My Resume Based on This</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
