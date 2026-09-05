"use client";

import React from "react";
import Link from "next/link";
import Navigation from "../components/Navigation";
import { Compass, ArrowRight, Home, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-secondary-container">
      <Navigation />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative">
        {/* Subtle Ambient Bloom */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-secondary-fixed/50 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="w-full max-w-lg bg-surface-container-lowest border-[1.5px] border-primary rounded-xl p-8 sm:p-12 shadow-sm text-center relative overflow-hidden">
          {/* Compass Icon Animation */}
          <div className="w-16 h-16 rounded-full bg-secondary-container border-[1.5px] border-primary flex items-center justify-center mx-auto mb-4 text-primary shadow-sm animate-pulse">
            <Compass className="w-8 h-8 text-primary stroke-[1.5]" />
          </div>

          <span className="text-[10px] font-bold uppercase tracking-widest text-secondary block mb-1">
            404 Error • Uncharted Coordinates
          </span>

          <h1 className="font-serif text-4xl sm:text-5xl font-normal text-primary mb-3">
            Lost Flight Path
          </h1>

          <p className="text-xs sm:text-sm text-on-surface-variant max-w-sm mx-auto leading-relaxed mb-8">
            Even seasoned pilots encounter unexpected crosswinds. The destination you are
            requesting does not exist or has been relocated.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-on-primary hover:bg-neutral-800 border-[1.5px] border-primary px-6 py-2.5 rounded-full text-xs font-bold transition-transform active:scale-95 shadow-sm"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return to Flight Deck</span>
            </Link>

            <Link
              href="/upload"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-secondary-fixed text-primary hover:bg-secondary-container border-[1.5px] border-primary px-5 py-2.5 rounded-full text-xs font-bold transition-colors"
            >
              <span>Start New Interview</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
