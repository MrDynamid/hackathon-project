"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "../../components/Navigation";
import StepIndicator from "../../components/StepIndicator";
import { usePrep } from "../../context/PrepContext";
import {
  User,
  Sparkles,
  Plus,
  X,
  ArrowRight,
  Briefcase,
  Loader2,
  ShieldCheck,
} from "lucide-react";

export default function ReviewPage() {
  const router = useRouter();
  const {
    resume,
    targetRole,
    updatePersonalField,
    addSkill,
    removeSkill,
    updateExperienceBullet,
    generateQuestions,
    aiNotes,
    wasAugmented,
    lastError,
    isSimulating,
  } = usePrep();

  const [newSkillInput, setNewSkillInput] = useState("");
  const [isStartingInterview, setIsStartingInterview] = useState(false);

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    if (newSkillInput.trim()) {
      addSkill(newSkillInput.trim());
      setNewSkillInput("");
    }
  };

  const missingSuggested = (resume.suggestedSkills || []).filter(
    (s) => !resume.skills.includes(s)
  );

  const handleStartInterview = async () => {
    setIsStartingInterview(true);
    const ok = await generateQuestions();
    setIsStartingInterview(false);
    if (ok) router.push("/interview");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-secondary-container">
      <Navigation />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        <StepIndicator currentStep={2} />

        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-surface-container-lowest border-[1.5px] border-primary rounded-xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-[1.5px] border-primary pb-6 mb-6">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-secondary">
                  Step 02 of 05
                </span>
                <h1 className="font-serif text-3xl font-normal text-primary mt-0.5">
                  AI-Structured Resume
                </h1>
                <p className="text-xs text-on-surface-variant mt-1">
                  The AI structured your profile{wasAugmented ? " and generated the missing sections" : ""}. Verify or edit anything before your mock interview.
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary-container border border-primary text-xs font-bold text-on-secondary-container self-start sm:self-auto">
                <ShieldCheck className="w-4 h-4 text-secondary" />
                <span>{wasAugmented ? "AI Generated + Verified" : "AI Analyzed"}</span>
              </div>
            </div>

            {aiNotes.length > 0 && (
              <div className="mb-6 p-3.5 bg-secondary-fixed/60 border border-primary rounded-xl">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-secondary" />
                  <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                    What the AI did
                  </span>
                </div>
                <ul className="space-y-1">
                  {aiNotes.map((note, i) => (
                    <li key={i} className="text-xs text-on-surface flex items-start gap-1.5">
                      <span className="text-secondary mt-0.5">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Target Role Ribbon */}
            <div className="mb-6 p-3.5 bg-surface-container border border-outline-variant rounded-xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">work</span>
                <div className="text-xs">
                  <span className="text-on-surface-variant">Targeting Position: </span>
                  <span className="font-bold text-primary">{targetRole || resume.title || "General role"}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary-fixed text-primary border border-primary">
                Customized Set
              </span>
            </div>

            {/* Candidate Overview Form */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-secondary" />
                  <span>Candidate Identity & Contact</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={resume.name}
                      onChange={(e) => updatePersonalField("name", e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-background border border-primary rounded-lg font-bold text-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant mb-1">
                      Professional Headline
                    </label>
                    <input
                      type="text"
                      value={resume.title}
                      onChange={(e) => updatePersonalField("title", e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-background border border-primary rounded-lg text-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={resume.contact.email || ""}
                      onChange={(e) => updatePersonalField("email", e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-background border border-outline-variant rounded-lg text-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant mb-1">
                      Phone Number & Location
                    </label>
                    <input
                      type="text"
                      value={`${resume.contact.phone || ""} • ${resume.contact.location || ""}`}
                      onChange={(e) => updatePersonalField("phone", e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-background border border-outline-variant rounded-lg text-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Skills Section */}
              <div className="pt-4 border-t border-outline-variant">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-secondary" />
                  <span>Extracted Skills & Competencies ({resume.skills.length})</span>
                </h3>

                <div className="flex flex-wrap gap-2 mb-3">
                  {resume.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 bg-secondary-container text-on-secondary-container border border-primary px-3 py-1 rounded-full text-xs font-bold"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="hover:text-error transition-colors ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* AI-suggested skills to quick-add */}
                {missingSuggested.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[11px] font-bold text-on-surface-variant mb-1.5">
                      AI suggests adding for this role:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {missingSuggested.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => addSkill(skill)}
                          className="inline-flex items-center gap-1 bg-surface-container text-on-surface border border-dashed border-primary px-2.5 py-1 rounded-full text-xs font-medium hover:bg-secondary-fixed transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          <span>{skill}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Skill Field */}
                <div className="flex items-center gap-2 max-w-sm">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={handleAddSkill}
                    placeholder="Add missing skill (e.g. Docker, Jest)..."
                    className="flex-1 px-3 py-1.5 text-xs bg-background border border-outline-variant rounded-lg focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3 py-1.5 bg-surface-container border border-primary rounded-lg text-xs font-bold hover:bg-secondary-fixed transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Work Experience */}
              <div className="pt-4 border-t border-outline-variant">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-secondary" />
                  <span>Parsed Work Experience</span>
                </h3>

                <div className="space-y-4">
                  {resume.experience.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-4 bg-surface-container-low border border-outline-variant rounded-xl space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div>
                          <span className="font-bold text-sm text-primary">{exp.role}</span>
                          <span className="text-xs text-on-surface-variant"> @ {exp.company}</span>
                        </div>
                        <span className="text-[11px] font-mono text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded border border-outline-variant w-fit">
                          {exp.dates}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {exp.bullets.map((bullet, bIdx) => (
                          <div key={bIdx} className="flex items-start gap-2">
                            <span className="text-xs font-bold text-secondary mt-1.5">•</span>
                            <textarea
                              rows={2}
                              value={bullet}
                              onChange={(e) =>
                                updateExperienceBullet(exp.id, bIdx, e.target.value)
                              }
                              className="flex-1 p-2 text-xs bg-background border border-outline-variant rounded-lg text-primary focus:border-primary custom-scrollbar"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t-[1.5px] border-primary space-y-3">
                {lastError && (
                  <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5">
                    {lastError}
                  </p>
                )}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-on-surface-variant italic">
                    The AI generates fresh questions tailored to your resume and target role.
                  </p>

                  <button
                    type="button"
                    onClick={handleStartInterview}
                    disabled={isStartingInterview || isSimulating}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-on-primary hover:bg-neutral-800 border-[1.5px] border-primary px-8 py-3 rounded-full text-xs font-bold transition-transform active:scale-95 shadow-md disabled:opacity-75"
                  >
                    {isStartingInterview ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Generating your questions...</span>
                      </>
                    ) : (
                      <>
                        <span>Start Mock Interview (5 Questions)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
