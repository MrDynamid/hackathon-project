import { NextResponse } from 'next/server'
import { randomBytes, randomUUID } from 'crypto'
import { db } from '@/lib/db'
import { prepSessions } from '@/lib/db/schema'
import { z } from 'zod'
import { parsedResumeSchema, feedbackSchema, rewritesSchema } from '@/lib/ai/schemas'

const payloadSchema = z.object({
  id: z.string().optional(),
  resume: parsedResumeSchema.nullable().optional(),
  targetRole: z.string().optional().default(''),
  targetJD: z.string().optional().default(''),
  questions: z.array(z.unknown()).optional().default([]),
  answers: z.record(z.string(), z.string()).optional().default({}),
  feedback: feedbackSchema.nullable().optional(),
  rewrites: rewritesSchema.shape.rewrites.optional().default([]),
  selectedTemplate: z.string().optional().default('modern-atelier'),
})

export async function POST(request: Request) {
  const parsed = payloadSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid share payload.' }, { status: 400 })

  const token = randomBytes(18).toString('base64url')
  const now = new Date()
  const data = parsed.data
  await db.insert(prepSessions).values({
    id: randomUUID(),
    userId: 'guest',
    resume: data.resume ?? null,
    targetRole: data.targetRole,
    targetJD: data.targetJD,
    questions: data.questions as never,
    answers: data.answers,
    feedback: data.feedback ?? null,
    rewrites: data.rewrites.map((rewrite) => ({ ...rewrite, status: 'pending' as const })),
    selectedTemplate: data.selectedTemplate as never,
    status: 'shared',
    shareToken: token,
    sharedAt: now,
    createdAt: now,
    updatedAt: now,
  })

  return NextResponse.json({ token }, { headers: { 'Cache-Control': 'no-store' } })
}
