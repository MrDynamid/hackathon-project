export type QuestionType = "resume-specific" | "role-specific" | "behavioral";

export interface ContactInfo {
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
}

export interface ExperienceEntry {
  id: string;
  role: string;
  company: string;
  dates: string;
  location?: string;
  bullets: string[];
}

export interface EducationEntry {
  id: string;
  degree: string;
  institution: string;
  dates: string;
  gpa?: string;
}

export interface ParsedResume {
  name: string;
  title: string;
  contact: ContactInfo;
  summary: string;
  skills: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  rawText?: string;
  suggestedTags?: string[];
  suggestedSkills?: string[];
}

export interface InterviewQuestion {
  id: string;
  text: string;
  type: QuestionType;
  order: number;
  expectedKeywords: string[];
}

export interface InterviewAnswer {
  questionId: string;
  answerText: string;
  answeredAt: string;
  audioDurationSec?: number;
}

export interface RubricCategory {
  name: "communication" | "technical_relevance" | "clarity_confidence" | "resume_role_fit";
  label: string;
  score: number; // 0 - 100
  evidence: string;
  suggestion: string;
}

export interface FeedbackReport {
  overallScore: number; // 0 - 100
  percentile: number;
  summary: string;
  strengths: string[];
  growthAreas: string[];
  categories: RubricCategory[];
  verifiedHash?: string;
}

export interface BulletRewrite {
  id: string;
  experienceId: string;
  company: string;
  role: string;
  original: string;
  suggested: string;
  rationale: string;
  status: "pending" | "accepted" | "rejected";
}

export type TemplateId = "modern-atelier" | "classic-executive";

export interface TemplateOption {
  id: TemplateId;
  name: string;
  description: string;
  styleTag: string;
}
