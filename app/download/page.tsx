"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Navigation from "../../components/Navigation";
import ResumeDocument from "../../components/ResumeDocument";
import { usePrep } from "../../context/PrepContext";
import confetti from "canvas-confetti";
import { trackEvent } from "@/lib/analytics";
import {
  CheckCircle2,
  Download,
  RotateCcw,
  Share2,
  FileCheck,
  ShieldCheck,
  Check,
  Loader2,
} from "lucide-react";

export default function DownloadPage() {
  const { resume, rewrites, selectedTemplate, feedback, targetRole, targetJD, questions, answers, loadSampleResume } = usePrep();
  const [copiedLink, setCopiedLink] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const docRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Fire celebratory confetti on page load
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#64597a", "#e2d4fb", "#000000", "#eaddff"],
      });
    } catch (err) {
      // safe fallback
    }
  }, []);

  const handleDownloadPdf = async () => {
    if (isGenerating) return;
    setPdfError("");
    const node = docRef.current;
    if (!node) return;
    setIsGenerating(true);
    try {
      // Dynamically import the heavy libs only when the user downloads.
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas-pro"),
      ]);

      const canvas = await html2canvas(node, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Slice a tall render across multiple A4 pages.
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const safeName = (resume.name || "resume").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "");
      pdf.save(`${safeName || "resume"}-preppilot.pdf`);
    } catch (err) {
      console.log("[v0] pdf generation error:", (err as Error).message);
      setPdfError("Could not generate the PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    setPdfError("");
    try {
      const payload = { resume, rewrites, selectedTemplate, feedback, targetRole, targetJD, questions, answers };
      let response = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("publish failed");
      const { token } = await response.json();
      trackEvent("share_published", { guest: true });
      const url = `${window.location.origin}/share/${encodeURIComponent(token)}`;
      const shareData = { title: "PrepPilot interview session", text: `PrepPilot interview results for ${targetRole || "this role"}`, url };
      if (navigator.share) await navigator.share(shareData);
      else if (navigator.clipboard) await navigator.clipboard.writeText(url);
      else {
        const input = document.createElement("input");
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        input.remove();
      }
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2500);
    } catch (error) {
      if ((error as DOMException).name !== "AbortError") setPdfError("Could not publish this session. Please try again.");
    }
  };

  const acceptedCount = rewrites.filter((r) => r.status === "accepted").length;

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-secondary-container">
      <div className="no-print">
        <Navigation />
      </div>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Success Banner Card */}
        <div className="no-print bg-surface-container-lowest border-[1.5px] border-primary rounded-xl p-8 shadow-sm text-center relative overflow-hidden mb-8">
          <div className="w-14 h-14 rounded-full bg-secondary-container border-[1.5px] border-primary flex items-center justify-center mx-auto mb-4 text-primary shadow-sm">
            <CheckCircle2 className="w-7 h-7 text-primary" />
          </div>

          <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">
            Flight Completed Successfully
          </span>

          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-primary mt-1 mb-2">
            Your Polished Resume is Ready
          </h1>

          <p className="text-xs sm:text-sm text-on-surface-variant max-w-lg mx-auto leading-relaxed mb-6">
            You completed the mock interview for{" "}
            <span className="font-bold text-primary">{targetRole}</span>, scored{" "}
            <span className="font-bold text-primary">{feedback?.overallScore ?? 0}/100</span>, and
            approved <span className="font-bold text-primary">{acceptedCount} high-impact bullet upgrades</span>.
          </p>

          {/* Download CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-primary text-on-primary hover:bg-neutral-800 border-[1.5px] border-primary px-7 py-3 rounded-full text-xs font-bold transition-transform active:scale-95 shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Resume PDF</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 bg-surface-container hover:bg-surface-container-high border border-outline-variant px-4 py-3 rounded-full text-xs font-bold text-on-surface transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedLink ? "Link Copied!" : "Share Session"}</span>
            </button>
          </div>

          {pdfError && (
            <p className="text-[11px] text-error mt-3 font-medium">{pdfError}</p>
          )}

          {/* Verified Badge */}
          <div className="mt-6 pt-4 border-t border-outline-variant/60 flex flex-wrap items-center justify-center gap-4 text-[11px] text-on-surface-variant">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
              <span>Verified Evaluation Hash:</span>
              <code className="font-mono text-primary font-bold">{feedback?.verifiedHash || "Pending evaluation"}</code>
            </div>

            <span className="hidden sm:inline">•</span>

            <Link
              href="/upload"
              onClick={loadSampleResume}
              className="flex items-center gap-1 text-secondary font-bold hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Start a New Session</span>
            </Link>
          </div>
        </div>

        {/* Printable Resume Document Section */}
        <div className="bg-surface-container-lowest border-[1.5px] border-primary rounded-xl p-4 sm:p-8 shadow-sm">
          <div className="no-print flex items-center justify-between border-b border-outline-variant pb-4 mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-secondary" />
              <span>Document Render: {resume.name}</span>
            </span>
            <span className="text-[11px] text-on-surface-variant font-mono">
              Ready for ATS submission
            </span>
          </div>

          {/* The Document */}
          <div ref={docRef} className="p-2 sm:p-4 bg-background rounded-xl border border-outline-variant/40">
            <ResumeDocument
              resume={resume}
              rewrites={rewrites}
              template={selectedTemplate}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
