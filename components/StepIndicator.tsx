"use client";

import React from "react";
import Link from "next/link";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number; // 1 to 5
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { number: 1, label: "Upload & Role", href: "/upload" },
    { number: 2, label: "Parsed Review", href: "/review" },
    { number: 3, label: "Mock Interview", href: "/interview" },
    { number: 4, label: "Feedback Report", href: "/feedback" },
    { number: 5, label: "Resume Studio", href: "/improve" },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 px-4">
      <div className="bg-surface-container-low border-[1.5px] border-primary rounded-full p-1.5 sm:p-2 shadow-sm flex items-center justify-between relative overflow-hidden">
        {steps.map((step) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;

          return (
            <Link
              key={step.number}
              href={step.href}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-1.5 px-2 rounded-full text-xs font-bold transition-all ${
                isCurrent
                  ? "bg-secondary-fixed text-primary border-[1.5px] border-primary shadow-sm"
                  : isCompleted
                  ? "text-primary hover:bg-surface-container"
                  : "text-outline hover:text-on-surface"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                  isCurrent
                    ? "bg-primary text-on-primary"
                    : isCompleted
                    ? "bg-secondary-container text-primary border border-primary"
                    : "bg-surface-container-high text-outline"
                }`}
              >
                {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : step.number}
              </div>
              <span className="hidden md:inline truncate">{step.label}</span>
              <span className="inline md:hidden text-[11px]">{step.number}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
