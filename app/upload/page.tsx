"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "../../components/Navigation";
import StepIndicator from "../../components/StepIndicator";
import { usePrep } from "../../context/PrepContext";
import {
  UploadCloud,
  FileText,
  Sparkles,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Loader2,
  ChevronDown,
  X,
  AlertTriangle,
} from "lucide-react";

export default function UploadPage() {
  const router = useRouter();
  const {
    targetRole,
    setTargetRole,
    targetJD,
    setTargetJD,
    analyzeResume,
    isSimulating,
    lastError,
  } = usePrep();

  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [localError, setLocalError] = useState("");

  const rolePresets = [
    "Professional Video Editor",
    "Senior Frontend Engineer",
    "Product Manager",
    "Data Analyst",
    "UX/UI Designer",
    "Digital Marketing Specialist",
  ];

  const acceptFile = (f: File | undefined) => {
    if (!f) return;
    const ok = /\.(pdf|docx|txt)$/i.test(f.name);
    if (!ok) {
      setLocalError("Unsupported file. Please upload a PDF, DOCX, or TXT.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setLocalError("File is larger than 10MB.");
      return;
    }
    setLocalError("");
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    acceptFile(e.dataTransfer.files?.[0]);
  };

  const canAnalyze =
    !isSimulating && (!!file || pastedText.trim().length >= 30 || targetRole.trim().length > 0);

  const handleAnalyze = async () => {
    setLocalError("");
    if (!canAnalyze) {
      setLocalError(
        "Add a resume file, paste your details, or at least enter the role you're targeting."
      );
      return;
    }
    const ok = await analyzeResume({ file, pastedText, targetRole, targetJD });
    if (ok) router.push("/review");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-secondary-container">
      <Navigation />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        <StepIndicator currentStep={1} />

        <div className="bg-surface-container-lowest border-[1.5px] border-primary rounded-xl p-6 sm:p-8 shadow-sm relative">
          {/* Header Title */}
          <div className="border-b-[1.5px] border-primary pb-6 mb-6">
            <span className="text-[10px] uppercase font-bold tracking-widest text-secondary">
              Step 01 of 05
            </span>
            <h1 className="font-serif text-3xl font-normal text-primary mt-0.5">
              Tell the AI what you&apos;re aiming for
            </h1>
            <p className="text-xs text-on-surface-variant mt-1 max-w-xl">
              Upload a resume, paste your notes, or simply name your target role. PrepPilot&apos;s
              AI reads everything, structures your profile, and generates any missing skills,
              summary, and experience for you.
            </p>
          </div>

          <div className="space-y-6">
            {/* Target Role — now the primary input */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider">
                Target Role <span className="text-secondary">(the AI tailors everything to this)</span>
              </label>

              <div className="relative">
                <Briefcase className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Professional Video Editor"
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-background border-[1.5px] border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-fixed text-primary font-medium"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-bold text-on-surface-variant">Popular:</span>
                {rolePresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTargetRole(preset)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                      targetRole === preset
                        ? "bg-secondary-fixed text-primary border-primary font-bold"
                        : "bg-surface-container border-outline-variant text-on-surface-variant hover:border-primary"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Drag & Drop Box */}
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
                Resume Document <span className="text-on-surface-variant font-medium normal-case">(optional — PDF, DOCX, TXT)</span>
              </label>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-[2px] border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                  isDragging
                    ? "border-primary bg-secondary-container/50 scale-[1.01]"
                    : "border-outline-variant bg-surface-container-low hover:bg-surface-container"
                }`}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={(e) => acceptFile(e.target.files?.[0])}
                />

                <div className="w-12 h-12 rounded-full bg-secondary-container border-[1.5px] border-primary flex items-center justify-center mx-auto mb-3 text-primary">
                  <UploadCloud className="w-6 h-6 text-primary" />
                </div>

                {file ? (
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-fixed border border-primary text-xs font-bold text-primary mb-1">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{file.name}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                        aria-label="Remove file"
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-on-surface-variant">
                      Gemini will read this file directly. Click to replace.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-primary">
                      Drag and drop your resume, or{" "}
                      <span className="text-secondary underline">browse files</span>
                    </p>
                    <p className="text-[11px] text-on-surface-variant mt-1">
                      No file yet? No problem — the AI can build one from your target role.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Collapsible Paste Text Area */}
            <div className="border border-outline-variant rounded-xl overflow-hidden bg-surface-container-low">
              <button
                type="button"
                onClick={() => setPasteOpen(!pasteOpen)}
                className="w-full flex justify-between items-center p-3 text-xs font-bold text-on-surface hover:bg-surface-container transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-secondary" />
                  <span>Or paste any notes / bullet points about yourself</span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-outline transition-transform ${
                    pasteOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {pasteOpen && (
                <div className="p-4 border-t border-outline-variant bg-surface-container-lowest">
                  <textarea
                    rows={5}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Paste anything — a rough resume, a few bullet points, or even just a sentence about your background..."
                    className="w-full p-3 text-xs bg-background border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-fixed text-primary custom-scrollbar"
                  />
                  <p className="text-[10px] text-on-surface-variant mt-1 italic">
                    The AI extracts structure, projects, and metrics — and fills the gaps.
                  </p>
                </div>
              )}
            </div>

            {/* Optional JD text area */}
            <div>
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Job Description / Focus Areas (Optional)
              </label>
              <textarea
                rows={2}
                value={targetJD}
                onChange={(e) => setTargetJD(e.target.value)}
                placeholder="Paste a snippet of the job description so the AI can sharpen your profile and interview questions..."
                className="w-full p-2.5 text-xs bg-background border border-outline-variant rounded-lg focus:outline-none focus:border-primary text-primary"
              />
            </div>

            {(localError || lastError) && (
              <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{localError || lastError}</span>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-4 border-t-[1.5px] border-primary flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-on-surface-variant flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-secondary" />
                <span>Powered by Google Gemini • Auto-generates missing sections</span>
              </div>

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-on-primary hover:bg-neutral-800 border-[1.5px] border-primary px-8 py-3 rounded-full text-xs font-bold transition-transform active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSimulating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Analyzing with AI...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze with AI</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
