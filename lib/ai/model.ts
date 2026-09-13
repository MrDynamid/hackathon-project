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

// PrepPilot uses Google Gemini for every AI call. Rotate through the three
// project keys so one exhausted free-tier key does not take down the session.
const geminiKeys = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter((key): key is string => Boolean(key?.trim()))

const googleClients = geminiKeys.map((apiKey) => createGoogleGenerativeAI({ apiKey }))
export const google = googleClients[0] ?? createGoogleGenerativeAI({ apiKey: '' })

// Each key gets the same Gemini model chain. A model failure and a quota failure
// both advance to the next available key/model pair.
const geminiModelNames = ['gemini-3.6-flash']
export const PREP_TEXT_MODELS: LanguageModel[] = googleClients.flatMap((client) =>
  geminiModelNames.map((modelName) => client(modelName)),
)

export const PREP_MODEL = PREP_TEXT_MODELS[0] ?? google('gemini-2.5-flash')
export const PREP_MODEL_FALLBACK = PREP_TEXT_MODELS[1] ?? google('gemini-2.5-pro')
export const PREP_MODEL_LEGACY_FALLBACK = PREP_TEXT_MODELS[2] ?? google('gemini-2.0-flash')

export async function withGeminiFallback<T>(run: (model: LanguageModel) => Promise<T>): Promise<T> {
  let lastError: unknown
  for (const model of PREP_TEXT_MODELS) {
    try {
      return await run(model)
    } catch (error) {
      lastError = error
      const message = error instanceof Error ? error.message.toLowerCase() : ''
      const shouldTryNextCredential =
        message.includes('quota') ||
        message.includes('rate') ||
        message.includes('429') ||
        message.includes('401') ||
        message.includes('403') ||
        message.includes('api key') ||
        message.includes('resource exhausted')
      if (!shouldTryNextCredential) break
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
