"use client";

import React from "react";
import Link from "next/link";
import Navigation from "../../components/Navigation";
import { ShieldCheck, ArrowLeft, Lock, FileText, CheckCircle2 } from "lucide-react";

export default function TermsPage() {
  const sections = [
    { id: "privacy", title: "1. Zero-Retention Resume Privacy Guarantee" },
    { id: "ai-transparency", title: "2. AI Rubric & Grounding Transparency" },
    { id: "user-content", title: "3. Ownership of Generated Resumes" },
    { id: "hackathon-compliance", title: "4. Hackathon & Educational Context" },
    { id: "limitations", title: "5. Disclaimer of Representation" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-secondary-container">
      <Navigation />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-12">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary font-bold transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Landing Page</span>
          </Link>

          <span className="text-[10px] uppercase font-bold tracking-widest text-secondary block">
            Legal & Privacy Architecture
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-normal text-primary mt-1">
            Terms of Service & Privacy
          </h1>
          <p className="text-xs text-on-surface-variant mt-1 font-mono">
            Effective Date: September 2026 • Version 1.0 (Hackathon Release)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Table of Contents (Sticky on Desktop) */}
          <aside className="md:col-span-4 sticky top-24 bg-surface-container-low border-[1.5px] border-primary rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-secondary" />
              <span>Table of Contents</span>
            </h3>
            <nav className="space-y-1 text-xs">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block py-1.5 px-2 rounded hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors leading-snug"
                >
                  {s.title}
                </a>
              ))}
            </nav>

            <div className="mt-6 pt-4 border-t border-outline-variant text-[11px] text-on-surface-variant flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Client-Side Private Processing</span>
            </div>
          </aside>

          {/* Legal Content Body */}
          <div className="md:col-span-8 bg-surface-container-lowest border-[1.5px] border-primary rounded-xl p-6 sm:p-8 space-y-8 shadow-sm text-xs leading-relaxed text-on-surface">
            {/* Section 1 */}
            <section id="privacy" className="scroll-mt-28">
              <h2 className="font-serif text-xl font-bold text-primary mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                1. Zero-Retention Resume Privacy Guarantee
              </h2>
              <p className="text-on-surface-variant mb-2">
                At PrepPilot, candidate privacy is non-negotiable. Resumes contain sensitive
                personal, educational, and employment histories. Under our single-session
                architecture:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-on-surface">
                <li>
                  Your uploaded or pasted resume is parsed in volatile client-side state.
                </li>
                <li>
                  No personal data is persisted to an external database or shared with third-party
                  advertising or analytics trackers.
                </li>
                <li>
                  Closing the browser session completely purges all in-flight session buffers.
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section id="ai-transparency" className="scroll-mt-28 pt-4 border-t border-outline-variant">
              <h2 className="font-serif text-xl font-bold text-primary mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                2. AI Rubric & Grounding Transparency
              </h2>
              <p className="text-on-surface-variant mb-2">
                PrepPilot utilizes constrained prompt engineering to ensure every evaluation metric
                is directly corroborated by what you wrote or stated during the mock interview.
              </p>
              <p className="text-on-surface-variant">
                Scores across Communication, Technical Relevance, Clarity, and Resume-Role Fit are
                coaching aids meant to simulate industry benchmark interviews, not definitive
                hiring guarantees.
              </p>
            </section>

            {/* Section 3 */}
            <section id="user-content" className="scroll-mt-28 pt-4 border-t border-outline-variant">
              <h2 className="font-serif text-xl font-bold text-primary mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                3. Ownership of Generated Resumes
              </h2>
              <p className="text-on-surface-variant">
                You retain complete, unencumbered ownership of all generated resume documents,
                upgraded bullet points, and interview transcripts created during your session. You
                are free to copy, modify, and submit them to prospective employers without royalty
                or attribution.
              </p>
            </section>

            {/* Section 4 */}
            <section id="hackathon-compliance" className="scroll-mt-28 pt-4 border-t border-outline-variant">
              <h2 className="font-serif text-xl font-bold text-primary mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                4. Hackathon & Educational Context
              </h2>
              <p className="text-on-surface-variant">
                This platform is developed as a showcase prototype for ONE HACK 2026 (Track 02: AI
                Agents & Automation). It demonstrates how generative agentic pipelines can unify
                resume tailoring and live mock interviews into a singular continuous loop.
              </p>
            </section>

            {/* Section 5 */}
            <section id="limitations" className="scroll-mt-28 pt-4 border-t border-outline-variant">
              <h2 className="font-serif text-xl font-bold text-primary mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                5. Disclaimer of Representation
              </h2>
              <p className="text-on-surface-variant">
                PrepPilot is an independent career preparation tool and is not affiliated,
                sponsored, or endorsed by Stripe, Vercel, Datadog, or any mentioned target
                companies. Company names and interview rubrics are used strictly for educational
                and realistic simulation purposes.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
