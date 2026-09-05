"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navigation from "../../components/Navigation";
import StepIndicator from "../../components/StepIndicator";
import ResumeDocument from "../../components/ResumeDocument";
import { usePrep } from "../../context/PrepContext";
import { templateOptions } from "../../data/initialData";
import { TemplateId } from "../../types";
import {
  Sparkles,
  ArrowRight,
  Check,
  X,
  FileText,
  Eye,
  Layout,
  CheckCircle2,
  RotateCcw,
  Download,
} from "lucide-react";

export default function ImproveResumePage() {
  const {
    resume,
    rewrites,
    toggleRewriteStatus,
    selectedTemplate,
    setSelectedTemplate,
    generateRewrites,
    isSimulating,
    lastError,
  } = usePrep();

  const [activeTab, setActiveTab] = useState<"rewrites" | "preview">("rewrites");
  const [rewriteAttempted, setRewriteAttempted] = useState(false);

  useEffect(() => {
    if (!rewrites.length && !rewriteAttempted) {
      setRewriteAttempted(true);
      void generateRewrites();
    }
  }, [generateRewrites, rewriteAttempted, rewrites.length]);

  const acceptedCount = rewrites.filter((r) => r.status === "accepted").length;

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-secondary-container">
      <Navigation />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        <StepIndicator currentStep={5} />

        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-surface-container-lowest border-[1.5px] border-primary rounded-xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-[1.5px] border-primary pb-6 mb-6">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-secondary">
                  Step 05 of 05
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl font-normal text-primary mt-0.5">
                  Resume Improvement Studio
                </h1>
                <p className="text-xs text-on-surface-variant mt-1">
                  Translate your verbal interview evidence into high-impact, quantified ATS bullet points.
                </p>
              </div>

              {/* View Switcher Pills */}
              <div className="inline-flex p-1 bg-surface-container-high rounded-full border border-primary self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab("rewrites")}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeTab === "rewrites"
                      ? "bg-secondary-fixed text-primary border border-primary shadow-sm"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-secondary" />
                  <span>Bullet Rewrites ({acceptedCount}/{rewrites.length} Accepted)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeTab === "preview"
                      ? "bg-secondary-fixed text-primary border border-primary shadow-sm"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Full Live Preview</span>
                </button>
              </div>
            </div>

            {/* Template Selector Bar */}
            <div className="mb-6 p-4 bg-surface-container-low border border-primary rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <Layout className="w-4 h-4 text-secondary" />
                  <span>Select Resume Aesthetic Template</span>
                </span>
                <p className="text-[11px] text-on-surface-variant">
                  Choose between high-craft editorial or traditional corporate ATS layout
                </p>
              </div>

              <div className="flex items-center gap-2">
                {templateOptions.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      selectedTemplate === tpl.id
                        ? "bg-primary text-on-primary border-primary shadow-sm"
                        : "bg-surface-container-lowest border-outline-variant text-on-surface hover:border-primary"
                    }`}
                  >
                    {tpl.name}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB 1: Bullet Rewrites (Side by Side) */}
            {activeTab === "rewrites" && (
              <div className="space-y-6">
                {isSimulating && (
                  <div className="grid grid-cols-1 gap-6" aria-live="polite">
                    {[1, 2, 3].map((item) => <div key={item} className="h-44 rounded-xl border border-outline-variant bg-surface-container-low animate-pulse" />)}
                  </div>
                )}
                {!isSimulating && lastError && (
                  <div className="rounded-xl border border-error bg-error-container/30 p-5 text-sm text-error" role="alert">
                    <p className="font-bold">The AI rewrite stage could not finish.</p>
                    <p className="mt-1">Your original bullets are safe. Retry to generate grounded suggestions.</p>
                    <button type="button" onClick={() => { setRewriteAttempted(true); void generateRewrites(); }} className="mt-3 rounded-full border border-error px-4 py-2 text-xs font-bold">Retry rewrites</button>
                  </div>
                )}
                {!isSimulating && !lastError && rewriteAttempted && rewrites.length === 0 && (
                  <div className="rounded-xl border border-outline-variant bg-surface-container-low p-8 text-center text-sm text-on-surface-variant">
                    No meaningful experience bullets were found to improve yet.
                  </div>
                )}
                {!isSimulating && !lastError && <div className="grid grid-cols-1 gap-6">
                  {rewrites.map((rw) => {
                    const isAccepted = rw.status === "accepted";
                    const isRejected = rw.status === "rejected";

                    return (
                      <div
                        key={rw.id}
                        className={`p-5 rounded-xl border-[1.5px] transition-all ${
                          isAccepted
                            ? "bg-emerald-50/30 border-primary"
                            : isRejected
                            ? "bg-neutral-50/50 border-outline-variant opacity-60"
                            : "bg-surface-container-lowest border-primary"
                        }`}
                      >
                        {/* Company / Role Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/60 pb-3 mb-4">
                          <div>
                            <span className="text-xs font-bold text-primary">{rw.role}</span>
                            <span className="text-xs text-on-surface-variant"> @ {rw.company}</span>
                          </div>

                          {/* Accept / Reject Controls */}
                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            <button
                              type="button"
                              onClick={() => toggleRewriteStatus(rw.id, "accepted")}
                              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                                isAccepted
                                  ? "bg-primary text-on-primary border-primary shadow-sm"
                                  : "bg-surface-container-lowest border-outline-variant text-on-surface hover:bg-emerald-50 hover:border-emerald-600"
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{isAccepted ? "Accepted" : "Accept Suggestion"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleRewriteStatus(rw.id, "rejected")}
                              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                                isRejected
                                  ? "bg-surface-container-highest border-primary text-primary"
                                  : "bg-surface-container-lowest border-outline-variant text-on-surface hover:bg-rose-50 hover:border-error"
                              }`}
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>{isRejected ? "Rejected" : "Keep Original"}</span>
                            </button>
                          </div>
                        </div>

                        {/* Side by Side Content */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Original Bullet */}
                          <div className="p-4 bg-surface-container-low border border-outline-variant rounded-xl flex flex-col justify-between">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5 block">
                                Original Resume Bullet
                              </span>
                              <p className="text-xs text-on-surface-variant leading-relaxed">
                                {rw.original}
                              </p>
                            </div>
                            <span className="text-[10px] text-outline mt-3">Before Interview</span>
                          </div>

                          {/* AI Suggested Rewrite */}
                          <div className="p-4 bg-secondary-container/40 border-[1.5px] border-primary rounded-xl flex flex-col justify-between relative overflow-hidden">
                            <div>
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" /> Grounded AI Rewrite
                                </span>
                                {isAccepted && (
                                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                                    Active in Output
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-primary font-medium leading-relaxed">
                                {rw.suggested}
                              </p>
                            </div>

                            {/* Rationale */}
                            <div className="mt-3 pt-2 border-t border-primary/20 text-[11px] text-on-surface-variant italic">
                              <span className="font-bold font-sans not-italic text-primary">
                                Why this works:{" "}
                              </span>
                              {rw.rationale}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>}
              </div>
            )}

            {/* TAB 2: Live Full Preview */}
            {activeTab === "preview" && (
              <div className="space-y-4">
                <div className="p-3 bg-secondary-fixed/50 border border-primary rounded-xl flex items-center justify-between text-xs text-primary font-bold">
                  <span>Showing real-time preview with all currently accepted bullet upgrades.</span>
                  <span className="font-mono text-[11px]">Template: {selectedTemplate}</span>
                </div>

                <div className="border border-outline-variant rounded-xl p-4 bg-surface-container-high overflow-x-auto">
                  <ResumeDocument
                    resume={resume}
                    rewrites={rewrites}
                    template={selectedTemplate}
                  />
                </div>
              </div>
            )}

            {/* Bottom Action Ribbon */}
            <div className="mt-8 pt-6 border-t-[1.5px] border-primary flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-on-surface-variant flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-secondary" />
                <span>{acceptedCount} improved bullets ready for immediate PDF export</span>
              </div>

              <Link
                href="/download"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-on-primary hover:bg-neutral-800 border-[1.5px] border-primary px-8 py-3 rounded-full text-xs font-bold transition-transform active:scale-95 shadow-md"
              >
                <span>Finalize & Download Resume</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
