import { generateObject } from 'ai'
import { NextResponse } from 'next/server'
import { rewritesSchema, parsedResumeSchema, feedbackSchema, FAST_THINKING } from '@/lib/ai/schemas'
import { generateGeminiObject } from '@/lib/ai/model'
import { z } from 'zod'

export const maxDuration = 60

const bodySchema = z.object({
  resume: parsedResumeSchema,
  targetRole: z.string().optional().default(''),
  feedback: feedbackSchema.nullable().optional(),
})

export async function POST(req: Request) {
  // Rewrite suggestions are available to guests; saving remains authenticated.

  const parsed = bodySchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { resume, targetRole, feedback } = parsed.data

  const bullets = resume.experience
    .flatMap((exp) => exp.bullets.map((b, i) => `[${exp.id}] (${exp.role} @ ${exp.company}) bullet ${i}: ${b}`))
    .join('\n')

  try {
    const { object } = await generateGeminiObject({
      model: PREP_MODEL,
      schema: rewritesSchema,
      system:
        'You are an expert resume editor. Rewrite the candidate\'s experience bullets to be more impactful and ' +
        'tailored to the target role. For each rewrite: keep the original, provide a stronger suggested version ' +
        '(strong action verb, quantified impact, role-relevant keywords — never invent metrics not implied by the ' +
        'original), and a one-sentence rationale. Set experienceId to the bracketed id. Generate ids like "rw-1". ' +
        'Produce a rewrite for each meaningful bullet (aim for 3-6 total).',
      prompt:
        `TARGET ROLE: ${targetRole || 'General role'}\n\n` +
        (feedback ? `INTERVIEW GROWTH AREAS:\n${feedback.growthAreas.join('\n')}\n\n` : '') +
        `EXPERIENCE BULLETS:\n${bullets}`.slice(0, 12000),
      providerOptions: FAST_THINKING,
    })

    // Default every rewrite to pending so the UI can accept/reject.
    const rewrites = object.rewrites.map((r) => ({ ...r, status: 'pending' as const }))
    return NextResponse.json({ rewrites })
  } catch (err) {
    console.log('[v0] rewrite error:', (err as Error).message)
    return NextResponse.json({ error: 'Failed to generate rewrites.' }, { status: 500 })
  }
}
