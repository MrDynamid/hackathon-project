import { generateObject } from 'ai'
import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { feedbackSchema, parsedResumeSchema, questionsSchema, FAST_THINKING } from '@/lib/ai/schemas'
import { generateGeminiObject } from '@/lib/ai/model'
import { z } from 'zod'

export const maxDuration = 60

const bodySchema = z.object({
  resume: parsedResumeSchema,
  targetRole: z.string().optional().default(''),
  targetJD: z.string().optional().default(''),
  questions: questionsSchema.shape.questions,
  answers: z.record(z.string(), z.string()),
})

export async function POST(req: Request) {
  // Evaluation is available to guests; persistence remains protected by Better Auth.

  const parsed = bodySchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { resume, targetRole, targetJD, questions, answers } = parsed.data

  const transcript = questions
    .map((q) => `Q${q.order} [${q.type}]: ${q.text}\nANSWER: ${answers[q.id]?.trim() || '(no answer provided)'}`)
    .join('\n\n')

  try {
    const { object } = await generateGeminiObject({
      schema: feedbackSchema,
      system:
        'You are a rigorous but fair interview evaluator. Grade the candidate on a 0-100 scale across exactly four ' +
        'categories: communication, technical_relevance, clarity_confidence, resume_role_fit. For each provide a ' +
        'human-readable label, a score, concrete evidence quoting the answers, and one actionable suggestion. ' +
        'Compute an overallScore consistent with the category scores, and a plausible percentile. Penalize missing or ' +
        'empty answers heavily. Provide 2-4 strengths and 1-3 growthAreas. Be specific and ground everything in the transcript.',
      prompt:
        `TARGET ROLE: ${targetRole || 'General role'}\n` +
        `JOB DESCRIPTION: ${targetJD || 'Not provided.'}\n\n` +
        `CANDIDATE SUMMARY: ${resume.summary}\n\n` +
        `INTERVIEW TRANSCRIPT:\n${transcript}`.slice(0, 16000),
      providerOptions: FAST_THINKING,
    })

    // Verifiable integrity hash of the graded transcript + score.
    const verifiedHash =
      'sha256-' +
      createHash('sha256').update(JSON.stringify({ transcript, score: object.overallScore })).digest('hex').slice(0, 29)

    return NextResponse.json({ feedback: { ...object, verifiedHash } })
  } catch (err) {
    console.log('[v0] evaluate error:', (err as Error).message)
    return NextResponse.json({ error: 'Failed to evaluate the interview.' }, { status: 500 })
  }
}
