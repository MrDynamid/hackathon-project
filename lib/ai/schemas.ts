import { z } from 'zod'

// Re-export the Gemini model bindings so existing imports of PREP_MODEL keep working.
export { PREP_MODEL, PREP_MODEL_PRO, PREP_TTS_MODEL, FAST_THINKING } from './model'

export const contactSchema = z.object({
  email: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  location: z.string().optional().default(''),
  linkedin: z.string().optional().default(''),
  github: z.string().optional().default(''),
})

export const experienceSchema = z.object({
  id: z.string(),
  role: z.string(),
  company: z.string(),
  dates: z.string(),
  location: z.string().optional().default(''),
  bullets: z.array(z.string()),
})

export const educationSchema = z.object({
  id: z.string(),
  degree: z.string(),
  institution: z.string(),
  dates: z.string(),
  gpa: z.string().optional().default(''),
})

export const parsedResumeSchema = z.object({
  name: z.string(),
  title: z.string(),
  contact: contactSchema,
  summary: z.string(),
  skills: z.array(z.string()),
  experience: z.array(experienceSchema),
  education: z.array(educationSchema),
  // AI-generated helpers tailored to the target role. These are always
  // produced by the model so the UI never has to fall back to templates.
  suggestedTags: z.array(z.string()).optional().default([]),
  suggestedSkills: z.array(z.string()).optional().default([]),
})

// Result of the full "analyze" pass: the structured resume plus role-aware
// coaching so the user gets a ready-to-use profile from minimal input.
export const analysisSchema = z.object({
  resume: parsedResumeSchema,
  // Short, human-readable notes on what the AI inferred or generated.
  aiNotes: z.array(z.string()).default([]),
  // Whether the AI had to generate substantial content (thin/empty resume).
  wasAugmented: z.boolean().default(false),
})

export const questionsSchema = z.object({
  questions: z
    .array(
      z.object({
        id: z.string(),
        order: z.number(),
        type: z.enum(['resume-specific', 'role-specific', 'behavioral']),
        text: z.string(),
        expectedKeywords: z.array(z.string()),
      })
    )
    .length(5),
})

export const feedbackSchema = z.object({
  overallScore: z.number().min(0).max(100),
  percentile: z.number().min(0).max(100),
  summary: z.string(),
  strengths: z.array(z.string()),
  growthAreas: z.array(z.string()),
  categories: z
    .array(
      z.object({
        name: z.enum([
          'communication',
          'technical_relevance',
          'clarity_confidence',
          'resume_role_fit',
        ]),
        label: z.string(),
        score: z.number().min(0).max(100),
        evidence: z.string(),
        suggestion: z.string(),
      })
    )
    .length(4),
})

export const rewritesSchema = z.object({
  rewrites: z.array(
    z.object({
      id: z.string(),
      experienceId: z.string(),
      company: z.string(),
      role: z.string(),
      original: z.string(),
      suggested: z.string(),
      rationale: z.string(),
    })
  ),
})
