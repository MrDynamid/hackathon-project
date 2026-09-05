"use client";

import React from "react";
import { ParsedResume, BulletRewrite, TemplateId } from "../types";

interface ResumeDocumentProps {
  resume: ParsedResume;
  rewrites: BulletRewrite[];
  template: TemplateId;
}

export default function ResumeDocument({ resume, rewrites, template }: ResumeDocumentProps) {
  // Helper to replace bullets with accepted rewrites
  const getBulletsForExperience = (expId: string, originalBullets: string[]) => {
    return originalBullets.map((orig, idx) => {
      const match = rewrites.find(
        (r) => r.experienceId === expId && r.original.trim() === orig.trim()
      );
      if (match && match.status === "accepted") {
        return { text: match.suggested, isRewritten: true };
      }
      return { text: orig, isRewritten: false };
    });
  };

  if (template === "classic-executive") {
    return (
      <div
        id="printable-resume"
        className="bg-white text-black p-8 sm:p-12 shadow-sm border border-neutral-300 font-sans text-xs leading-relaxed max-w-3xl mx-auto min-h-[900px]"
      >
        {/* Header */}
        <div className="text-center border-b pb-4 mb-4 border-black">
          <h1 className="text-2xl font-bold uppercase tracking-wider">{resume.name}</h1>
          <p className="text-sm font-semibold text-neutral-700 mt-0.5">{resume.title}</p>
          <div className="flex flex-wrap justify-center gap-3 text-[11px] text-neutral-600 mt-2">
            {resume.contact.email && <span>{resume.contact.email}</span>}
            {resume.contact.phone && <span>• {resume.contact.phone}</span>}
            {resume.contact.location && <span>• {resume.contact.location}</span>}
            {resume.contact.linkedin && <span>• {resume.contact.linkedin}</span>}
          </div>
        </div>

        {/* Summary */}
        {resume.summary && (
          <div className="mb-4">
            <h2 className="text-[11px] font-bold uppercase tracking-wider border-b border-neutral-300 pb-0.5 mb-1.5">
              Professional Summary
            </h2>
            <p className="text-[11px] text-neutral-800 leading-normal">{resume.summary}</p>
          </div>
        )}

        {/* Skills */}
        {resume.skills.length > 0 && (
          <div className="mb-4">
            <h2 className="text-[11px] font-bold uppercase tracking-wider border-b border-neutral-300 pb-0.5 mb-1.5">
              Core Technical Competencies
            </h2>
            <p className="text-[11px] text-neutral-800 leading-normal">
              {resume.skills.join(" • ")}
            </p>
          </div>
        )}

        {/* Experience */}
        <div className="mb-4">
          <h2 className="text-[11px] font-bold uppercase tracking-wider border-b border-neutral-300 pb-0.5 mb-2">
            Professional Experience
          </h2>
          <div className="space-y-3.5">
            {resume.experience.map((exp) => {
              const bulletList = getBulletsForExperience(exp.id, exp.bullets);
              return (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-neutral-900">{exp.role}</span>
                    <span className="text-[10px] text-neutral-500 font-medium">{exp.dates}</span>
                  </div>
                  <div className="flex justify-between items-baseline text-[11px] text-neutral-700 italic mb-1">
                    <span>{exp.company}</span>
                    {exp.location && <span>{exp.location}</span>}
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-neutral-800">
                    {bulletList.map((item, idx) => (
                      <li key={idx} className={item.isRewritten ? "text-neutral-900 font-medium" : ""}>
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Education */}
        {resume.education.length > 0 && (
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-wider border-b border-neutral-300 pb-0.5 mb-2">
              Education
            </h2>
            {resume.education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline text-[11px]">
                <div>
                  <span className="font-bold">{edu.degree}</span> — {edu.institution}
                </div>
                <span className="text-[10px] text-neutral-500">{edu.dates}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // "modern-atelier" Template (Matches the Ethereal Clarity Design)
  return (
    <div
      id="printable-resume"
      className="bg-surface-container-lowest text-on-surface p-8 sm:p-12 border-[1.5px] border-primary rounded-xl font-sans text-xs leading-relaxed max-w-3xl mx-auto shadow-sm relative overflow-hidden min-h-[900px]"
    >
      {/* Editorial Decorative Corner Accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-secondary-fixed/40 rounded-bl-full pointer-events-none -z-0" />

      {/* Header */}
      <div className="border-b-[1.5px] border-primary pb-6 mb-6 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-primary tracking-tight">
              {resume.name}
            </h1>
            <p className="text-xs uppercase font-bold tracking-widest text-secondary mt-1">
              {resume.title}
            </p>
          </div>
          <div className="text-[11px] text-on-surface-variant space-y-0.5 sm:text-right">
            <div>{resume.contact.email}</div>
            <div>{resume.contact.phone}</div>
            <div>{resume.contact.location}</div>
          </div>
        </div>
      </div>

      {/* Summary */}
      {resume.summary && (
        <div className="mb-6">
          <h2 className="text-[10px] uppercase font-bold tracking-widest text-primary mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            Executive Overview
          </h2>
          <p className="text-xs text-on-surface leading-relaxed pl-4 border-l-2 border-secondary-fixed">
            {resume.summary}
          </p>
        </div>
      )}

      {/* Skills */}
      {resume.skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-[10px] uppercase font-bold tracking-widest text-primary mb-2.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            Technical Competencies
          </h2>
          <div className="flex flex-wrap gap-1.5 pl-4">
            {resume.skills.map((skill, idx) => (
              <span
                key={idx}
                className="bg-surface-container border border-outline-variant text-[11px] font-medium px-2.5 py-0.5 rounded-full text-on-surface"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      <div className="mb-6">
        <h2 className="text-[10px] uppercase font-bold tracking-widest text-primary mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-secondary"></span>
          Engineering Experience
        </h2>
        <div className="space-y-4 pl-4 border-l-2 border-surface-variant">
          {resume.experience.map((exp) => {
            const bulletList = getBulletsForExperience(exp.id, exp.bullets);
            return (
              <div key={exp.id} className="relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <div>
                    <span className="font-bold text-sm text-primary">{exp.role}</span>
                    <span className="text-on-surface-variant text-xs"> — {exp.company}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container border border-outline-variant text-on-surface-variant w-fit">
                    {exp.dates}
                  </span>
                </div>
                <ul className="list-disc pl-4 space-y-1.5 text-[11px] text-on-surface mt-2">
                  {bulletList.map((item, idx) => (
                    <li
                      key={idx}
                      className={
                        item.isRewritten
                          ? "text-primary font-medium bg-secondary-fixed/30 p-1 rounded transition-colors"
                          : ""
                      }
                    >
                      {item.text}
                      {item.isRewritten && (
                        <span className="ml-1.5 text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-secondary-fixed text-primary border border-primary inline-block">
                          AI Polished
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Education */}
      {resume.education.length > 0 && (
        <div>
          <h2 className="text-[10px] uppercase font-bold tracking-widest text-primary mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            Academic Foundation
          </h2>
          <div className="pl-4">
            {resume.education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline text-xs">
                <div>
                  <span className="font-bold text-primary">{edu.degree}</span>
                  <span className="text-on-surface-variant"> — {edu.institution}</span>
                </div>
                <span className="text-[10px] text-on-surface-variant font-mono">{edu.dates}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
