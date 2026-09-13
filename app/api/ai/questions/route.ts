import { generateObject } from 'ai'
import { NextResponse } from 'next/server'
import { questionsSchema, parsedResumeSchema, FAST_THINKING } from '@/lib/ai/schemas'
import { generateGeminiObject } from '@/lib/ai/model'
import { z } from 'zod'

export const maxDuration = 60

const bodySchema = z.object({
  resume: parsedResumeSchema,
  targetRole: z.string().optional().default(''),
  targetJD: z.string().optional().default(''),
})

export async function POST(req: Request) {
  // Question generation is available to guests; only saved sessions require auth.

  const parsed = bodySchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { resume, targetRole, targetJD } = parsed.data

  try {
    const { object } = await generateGeminiObject({
      schema: questionsSchema,
      system:
        'You are a senior technical interviewer. Generate exactly 5 mock interview questions grounded in the ' +
        "candidate's actual resume and the target role. Distribution: 2 resume-specific (reference concrete " +
        'projects/metrics from their experience), 2 role-specific (tuned to the target role and JD), and 1 behavioral. ' +
        'Set order 1-5. Provide 3-5 expectedKeywords per question that a strong answer would include. ' +
        'Questions must be specific, not generic — cite real details from the resume.',
      prompt:
        `TARGET ROLE: ${targetRole || 'General software engineering role'}\n\n` +
        `JOB DESCRIPTION / FOCUS:\n${targetJD || 'Not provided.'}\n\n` +
        `CANDIDATE RESUME (JSON):\n${JSON.stringify(resume).slice(0, 12000)}`,
      providerOptions: FAST_THINKING,
    })

    return NextResponse.json({ questions: object.questions })
  } catch (err) {
    console.log('[v0] questions error:', (err as Error).message)
    return NextResponse.json({ error: 'Failed to generate questions.' }, { status: 500 })
  }
}
