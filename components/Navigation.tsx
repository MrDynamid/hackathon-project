"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePrep } from "../context/PrepContext";
import { Sparkles, Menu, X, ArrowRight, RotateCcw, FileText } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();
  const { resume, loadSampleResume, resetToCleanSlate } = usePrep();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/upload", label: "Upload & Parse" },
    { href: "/review", label: "Review Resume" },
    { href: "/interview", label: "Interview Room" },
    { href: "/feedback", label: "Rubric Feedback" },
    { href: "/improve", label: "Improvement Studio" },
  ];

  return (
    <header className="w-full sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b-[1.5px] border-primary">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-secondary-container border-[1.5px] border-primary flex items-center justify-center transition-transform group-hover:rotate-12">
              <span className="material-symbols-outlined text-[18px] text-primary">navigation</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-[20px] font-bold tracking-tight text-primary leading-none">
                PrepPilot
              </span>
              <span className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold font-sans mt-0.5">
                AI Career Atelier
              </span>
            </div>
          </Link>
          <span className="hidden md:inline-flex text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-secondary-fixed text-primary border border-primary">
            v1.0 Live Demo
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? "bg-secondary-fixed text-primary border-[1.5px] border-primary shadow-sm"
                    : "text-on-surface-variant hover:text-primary hover:bg-surface-container"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center gap-2.5">
          <button
            onClick={loadSampleResume}
            title="Reload high-quality sample candidate (Aditi Sharma)"
            className="flex items-center gap-1 text-[11px] font-bold text-on-surface-variant hover:text-primary px-3 py-1 rounded-full border border-outline-variant hover:bg-surface-container transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Load Sample</span>
          </button>

          <Link
            href="/login"
            className="text-xs font-bold text-on-surface hover:text-primary px-3 py-1.5 rounded-full hover:bg-surface-container transition-colors"
          >
            Log In
          </Link>

          <Link
            href="/upload"
            className="flex items-center gap-1.5 bg-primary text-on-primary hover:bg-surface-tint border-[1.5px] border-primary px-4 py-1.5 rounded-full text-xs font-bold transition-transform active:scale-95 shadow-sm"
          >
            <span>Start Flight</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden items-center gap-2">
          <Link
            href="/upload"
            className="bg-secondary-fixed text-primary border border-primary px-3 py-1 rounded-full text-xs font-bold"
          >
            Start
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg border border-primary text-primary"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-primary bg-background p-4 space-y-2">
          <div className="grid grid-cols-2 gap-2 mb-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-xs font-bold text-center border ${
                  pathname === link.href
                    ? "bg-secondary-fixed border-primary text-primary"
                    : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-outline-variant">
            <button
              onClick={() => {
                loadSampleResume();
                setMobileMenuOpen(false);
              }}
              className="text-xs text-on-surface-variant font-bold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset Sample
            </button>
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-bold px-3 py-1.5"
              >
                Sign In
              </Link>
              <Link
                href="/terms"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs text-on-surface-variant underline"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
