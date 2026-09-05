"use client";

import React, { createContext, useContext, useState, useRef, ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";
import {
  ParsedResume,
  InterviewQuestion,
  FeedbackReport,
  BulletRewrite,
  TemplateId,
} from "../types";
import {
  defaultResume,
  defaultTargetRole,
  defaultTargetJD,
  defaultQuestions,
  defaultAnswers,
  defaultFeedback,
  defaultRewrites,
  emptyResume,
} from "../data/initialData";

interface AnalyzeInput {
  file?: File | null;
  pastedText?: string;
  targetRole?: string;
  targetJD?: string;
}

interface PrepContextType {
  resume: ParsedResume;
  targetRole: string;
  targetJD: string;
  questions: InterviewQuestion[];
  answers: Record<string, string>;
  feedback: FeedbackReport | null;
  rewrites: BulletRewrite[];
  selectedTemplate: TemplateId;
  currentQuestionIndex: number;
  isVoiceMode: boolean;
  isRecording: boolean;
  isSimulating: boolean;
  aiNotes: string[];
  wasAugmented: boolean;
  lastError: string;
  activeSessionId: string;
  // Actions
  setResume: (resume: ParsedResume) => void;
  updatePersonalField: (field: string, value: string) => void;
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
  updateExperienceBullet: (expId: string, bulletIndex: number, newText: string) => void;
  setTargetRole: (role: string) => void;
  setTargetJD: (jd: string) => void;
  setAnswer: (questionId: string, answerText: string) => void;
  setCurrentQuestionIndex: (idx: number) => void;
  toggleRewriteStatus: (id: string, status: "accepted" | "rejected" | "pending") => void;
  setSelectedTemplate: (tpl: TemplateId) => void;
  setIsVoiceMode: (val: boolean) => void;
  setIsRecording: (val: boolean) => void;
  loadSampleResume: () => void;
  resetToCleanSlate: () => void;
  // Real AI actions
  analyzeResume: (input: AnalyzeInput) => Promise<boolean>;
  generateQuestions: () => Promise<boolean>;
  evaluateInterview: () => Promise<boolean>;
  generateRewrites: () => Promise<boolean>;
}

const PrepContext = createContext<PrepContextType | undefined>(undefined);

async function jsonOrThrow(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data;
}

export function PrepProvider({ children }: { children: ReactNode }) {
  const [resume, setResume] = useState<ParsedResume>(emptyResume);
  const [targetRole, setTargetRole] = useState<string>("");
  const [targetJD, setTargetJD] = useState<string>("");
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<FeedbackReport | null>(null);
  const [rewrites, setRewrites] = useState<BulletRewrite[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("modern-atelier");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [isVoiceMode, setIsVoiceMode] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [aiNotes, setAiNotes] = useState<string[]>([]);
  const [wasAugmented, setWasAugmented] = useState<boolean>(false);
  const [lastError, setLastError] = useState<string>("");
  const [activeSessionId] = useState<string>(
    () => `sess_${Math.random().toString(36).slice(2, 10)}`
  );
  const requestRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const beginRequest = () => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    const requestId = ++requestIdRef.current;
    return { controller, requestId };
  };

  const updatePersonalField = (field: string, value: string) => {
    setResume((prev) => {
      if (field in prev) {
        return { ...prev, [field]: value };
      }
      return {
        ...prev,
        contact: { ...prev.contact, [field]: value },
      };
    });
  };

  const addSkill = (skill: string) => {
    if (!skill.trim()) return;
    setResume((prev) => {
      if (prev.skills.includes(skill.trim())) return prev;
      return { ...prev, skills: [...prev.skills, skill.trim()] };
    });
  };

  const removeSkill = (skill: string) => {
    setResume((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const updateExperienceBullet = (expId: string, bulletIndex: number, newText: string) => {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) => {
        if (exp.id === expId) {
          const updatedBullets = [...exp.bullets];
          updatedBullets[bulletIndex] = newText;
          return { ...exp, bullets: updatedBullets };
        }
        return exp;
      }),
    }));
  };

  const setAnswer = (questionId: string, answerText: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerText,
    }));
  };

  const toggleRewriteStatus = (id: string, status: "accepted" | "rejected" | "pending") => {
    setRewrites((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  const loadSampleResume = () => {
    setResume(defaultResume);
    setTargetRole(defaultTargetRole);
    setTargetJD(defaultTargetJD);
    setQuestions(defaultQuestions);
    setAnswers(defaultAnswers);
    setFeedback(defaultFeedback);
    setRewrites(defaultRewrites);
    setAiNotes(["Loaded a sample profile so you can explore the app."]);
    setWasAugmented(false);
  };

  const resetToCleanSlate = () => {
    setResume(emptyResume);
    setTargetRole("");
    setTargetJD("");
    setQuestions([]);
    setAnswers({});
    setFeedback(null);
    setRewrites([]);
    setAiNotes([]);
    setWasAugmented(false);
    setLastError("");
  };

  // ---- Real AI actions ----

  const analyzeResume = async (input: AnalyzeInput): Promise<boolean> => {
    const { controller, requestId } = beginRequest();
    setIsSimulating(true);
    setLastError("");
    trackEvent("resume_analysis_started");
    try {

      const role = input.targetRole ?? targetRole;
      const jd = input.targetJD ?? targetJD;
      if (role) setTargetRole(role);
      if (jd) setTargetJD(jd);

      const form = new FormData();
      if (input.file) form.append("file", input.file);
      if (input.pastedText) form.append("pastedText", input.pastedText);
      if (role) form.append("targetRole", role);
      if (jd) form.append("targetJD", jd);

      const data = await jsonOrThrow(
        await fetch("/api/ai/parse-resume", { method: "POST", body: form, signal: controller.signal })
      );

      if (requestId !== requestIdRef.current) return false;
      setResume(data.resume as ParsedResume);
      setAiNotes(data.aiNotes || []);
      setWasAugmented(!!data.wasAugmented);
      trackEvent("resume_analysis_succeeded");
      return true;
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        trackEvent("resume_analysis_failed");
        setLastError((err as Error).message);
      }
      return false;
    } finally {
      setIsSimulating(false);
    }
  };

  const generateQuestions = async (): Promise<boolean> => {
    const { controller, requestId } = beginRequest();
    setIsSimulating(true);
    setLastError("");
    try {
      const data = await jsonOrThrow(
        await fetch("/api/ai/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resume, targetRole, targetJD }),
          signal: controller.signal,
        })
      );
      if (requestId !== requestIdRef.current) return false;
      const qs = (data.questions as InterviewQuestion[]).sort((a, b) => a.order - b.order);
      setQuestions(qs);
      setAnswers({});
      setCurrentQuestionIndex(0);
      return true;
    } catch (err) {
      setLastError((err as Error).message);
      return false;
    } finally {
      setIsSimulating(false);
    }
  };

  const evaluateInterview = async (): Promise<boolean> => {
    const { controller, requestId } = beginRequest();
    setIsSimulating(true);
    setLastError("");
    try {
      const data = await jsonOrThrow(
        await fetch("/api/ai/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resume, targetRole, targetJD, questions, answers }),
          signal: controller.signal,
        })
      );
      if (requestId !== requestIdRef.current) return false;
      setFeedback(data.feedback as FeedbackReport);
      return true;
    } catch (err) {
      setLastError((err as Error).message);
      return false;
    } finally {
      setIsSimulating(false);
    }
  };

  const generateRewrites = async (): Promise<boolean> => {
    const { controller, requestId } = beginRequest();
    setIsSimulating(true);
    setLastError("");
    try {
      const data = await jsonOrThrow(
        await fetch("/api/ai/rewrite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resume, targetRole, feedback }),
          signal: controller.signal,
        })
      );
      if (requestId !== requestIdRef.current) return false;
      const nextRewrites = data.rewrites as BulletRewrite[];
      setRewrites(nextRewrites);
      trackEvent("rewrite_succeeded", { count: nextRewrites.length });
      return true;
    } catch (err) {
      setLastError((err as Error).message);
      return false;
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <PrepContext.Provider
      value={{
        resume,
        targetRole,
        targetJD,
        questions,
        answers,
        feedback,
        rewrites,
        selectedTemplate,
        currentQuestionIndex,
        isVoiceMode,
        isRecording,
        isSimulating,
        aiNotes,
        wasAugmented,
        lastError,
        activeSessionId,
        setResume,
        updatePersonalField,
        addSkill,
        removeSkill,
        updateExperienceBullet,
        setTargetRole,
        setTargetJD,
        setAnswer,
        setCurrentQuestionIndex,
        toggleRewriteStatus,
        setSelectedTemplate,
        setIsVoiceMode,
        setIsRecording,
        loadSampleResume,
        resetToCleanSlate,
        analyzeResume,
        generateQuestions,
        evaluateInterview,
        generateRewrites,
      }}
    >
      {children}
    </PrepContext.Provider>
  );
}

export function usePrep() {
  const context = useContext(PrepContext);
  if (!context) {
    throw new Error("usePrep must be used within a PrepProvider");
  }
  return context;
}
