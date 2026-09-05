import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateObject } from 'ai'
import type { LanguageModel } from 'ai'

export type GeminiStageError = 'quota' | 'provider' | 'invalid-response'

export class GeminiGenerationError extends Error {
  stage: GeminiStageError
  retryable: boolean

  constructor(message: string, stage: GeminiStageError = 'provider', retryable = true) {
    super(message)
    this.name = 'GeminiGenerationError'
    this.stage = stage
    this.retryable = retryable
  }
}

// PrepPilot uses Google Gemini for every AI call. GEMINI_API_KEY is the
// project credential name provisioned for this app.
export const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
})

// Fast, capable multimodal model. Handles text + native PDF understanding.
// We pair it with FAST_THINKING (below) to cap extended reasoning, which keeps
// structured-output latency low instead of the 60s+ that flash models spend on
// deep reasoning by default.
export const PREP_MODEL = google('gemini-2.5-flash')

// Gemini-only fallback chain. These are separate model IDs so a temporary
// model-specific failure can recover without switching providers.
export const PREP_MODEL_FALLBACK = google('gemini-2.5-pro')
export const PREP_MODEL_LEGACY_FALLBACK = google('gemini-2.0-flash')
export const PREP_TEXT_MODELS: LanguageModel[] = [
  PREP_MODEL,
  PREP_MODEL_FALLBACK,
  PREP_MODEL_LEGACY_FALLBACK,
]

export async function withGeminiFallback<T>(run: (model: LanguageModel) => Promise<T>): Promise<T> {
  let lastError: unknown
  for (const model of PREP_TEXT_MODELS) {
    try {
      return await run(model)
    } catch (error) {
      lastError = error
      const message = error instanceof Error ? error.message.toLowerCase() : ''
      if (!message.includes('quota') && !message.includes('rate') && !message.includes('429')) break
    }
  }
  throw lastError instanceof Error ? lastError : new GeminiGenerationError('Gemini generation failed')
}

export function generateGeminiObject(options: any) {
  return withGeminiFallback((model) => generateObject({ ...options, model }))
}

// Higher-quality model reserved for the most nuanced grading.
export const PREP_MODEL_PRO = PREP_MODEL_FALLBACK

// Text-to-speech model id (used via the REST TTS endpoint).
export const PREP_TTS_MODEL = 'gemini-3.1-flash-tts-preview'

// Provider options that keep Gemient's "thinking" minimal. Gemini 3.x models
// use thinkingLevel ("minimal" | "low" | "medium" | "high") rather than a token
// budget, and reject thinkingBudget outright. Every PrepPilot call produces
// structured JSON where deep reasoning adds large latency for little quality
// gain, so we cap it at "low" for snappy (~1-6s) responses.
export const FAST_THINKING = {
  google: {
    thinkingConfig: { thinkingLevel: 'low' as const, includeThoughts: false },
  },
} as const
